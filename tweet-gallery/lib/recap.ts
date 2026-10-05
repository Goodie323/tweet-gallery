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
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || items.length === 0) return null;

  const payload = items.map((i) => ({
    id: i.entry.tweet_id,
    creator: i.name ?? i.handle,
    handle: i.handle,
    category: i.entry.category,
    curator_note: i.entry.notes,
    text: i.text,
  }));

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1500,
        system:
          "You write the weekly recap for a community archive of curated tweets. " +
          "Given a JSON list of tweets and optional weekly headline stats, return ONLY " +
          'valid JSON, no markdown fences, shaped as {"intro": string, "items": [{"id": string, "blurb": string}]}. ' +
          "intro: 2-3 sentences capturing the week's themes, weaving in the headline stats if given. " +
          "blurb: one sentence per tweet, naming the creator, saying what they said or showed. " +
          "Only use what is in the provided text and stats. Never invent facts, numbers, or quotes. " +
          "Never make token price predictions or give financial advice.",
        messages: [
          {
            role: "user",
            content: JSON.stringify({ stats: statsText, tweets: payload }),
          },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const raw: string = data?.content?.[0]?.text ?? "";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
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