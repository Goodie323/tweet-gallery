import { getTweet } from "react-tweet/api";
import { supabase, type TweetEntry } from "@/lib/supabase";

export type RecapItem = {
  entry: TweetEntry;
  handle: string;
  name: string | null;
  avatar: string | null;
  text: string | null;
  blurb: string;
};

export type Recap = {
  intro: string | null;
  items: RecapItem[];
  since: Date;
  aiUsed: boolean;
  statsText: string | null;
};

function clean(text: string) {
  return text.replace(/https:\/\/t\.co\/\w+/g, "").replace(/\s+/g, " ").trim();
}

function excerpt(text: string, max = 200) {
  return text.length > max ? text.slice(0, max).trimEnd() + "…" : text;
}

async function summarize(items: RecapItem[], statsText: string | null) {
  const key = process.env.GEMINI_API_KEY;
  if (!key || items.length === 0) return null;

  const payload = items.map((i) => ({
    id: i.entry.tweet_id,
    creator: i.name ?? i.handle,
    handle: i.handle,
    category: i.entry.category,
    curator_note: i.entry.notes,
    text: i.text,
  }));

  const systemInstruction =
    "You write the weekly recap for a community archive of curated tweets. " +
    "Given a JSON list of tweets and optional weekly headline stats, return JSON " +
    'shaped as {"intro": string, "items": [{"id": string, "blurb": string}]}. ' +
    "intro: 2-3 sentences capturing the week's themes, weaving in the headline stats if given. " +
    "blurb: one sentence per tweet, naming the creator, saying what they said or showed. " +
    "Only use what is in the provided text and stats. Never invent facts, numbers, or quotes. " +
    "Never make token price predictions or give financial advice.";

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: [
            {
              role: "user",
              parts: [
                { text: JSON.stringify({ stats: statsText, tweets: payload }) },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            maxOutputTokens: 1500,
          },
        }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed as { intro: string; items: { id: string; blurb: string }[] };
  } catch {
    return null;
  }
}

export async function getRecap(): Promise<Recap> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const { data } = await supabase
    .from("tweets")
    .select("*")
    .gte("added_at", since.toISOString())
    .order("featured", { ascending: false })
    .order("added_at", { ascending: false });

  const entries = (data ?? []) as TweetEntry[];

  const { data: statsRow } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "weekly_stats")
    .maybeSingle();
  const statsText = statsRow?.value || null;

  const items: RecapItem[] = await Promise.all(
    entries.map(async (entry) => {
      let tweet;
      try {
        tweet = await getTweet(entry.tweet_id);
      } catch {
        tweet = undefined;
      }
      const text = tweet?.text ? clean(tweet.text) : null;
      const handle = tweet?.user?.screen_name ?? entry.author_handle ?? "unknown";
      return {
        entry,
        handle,
        name: tweet?.user?.name ?? null,
        avatar: tweet?.user?.profile_image_url_https ?? null,
        text,
        blurb: entry.notes || (text ? excerpt(text) : `Shared by @${handle}.`),
      };
    })
  );

  const ai = await summarize(items, statsText);
  if (ai) {
    const byId = new Map(ai.items.map((i) => [i.id, i.blurb]));
    items.forEach((i) => {
      const b = byId.get(i.entry.tweet_id);
      if (b) i.blurb = b;
    });
  }

  return { intro: ai?.intro ?? null, items, since, aiUsed: !!ai, statsText };
}