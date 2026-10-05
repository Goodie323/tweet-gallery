import { getTweet } from "react-tweet/api";
import { supabase, type TweetEntry } from "@/lib/supabase";

export type RecapItem = {
  entry: TweetEntry;
  handle: string;
  name: string | null;
  avatar: string | null;
  text: string | null;
};

export type ArticleSegment =
  | { type: "text"; value: string }
  | { type: "link"; value: string; url: string; handle: string };

export type Recap = {
  paragraphs: ArticleSegment[][];
  items: RecapItem[];
  since: Date;
  aiUsed: boolean;
  statsText: string | null;
};

function clean(text: string) {
  return text.replace(/https:\/\/t\.co\/\w+/g, "").replace(/\s+/g, " ").trim();
}

function excerpt(text: string, max = 160) {
  return text.length > max ? text.slice(0, max).trimEnd() + "…" : text;
}

// Turns text containing {{tweetId}} tokens into text/link segments. The URL
// always comes from our own stored entry — never something the model wrote —
// so a hallucinated or malformed token just gets dropped, not followed.
function parseParagraph(raw: string, items: RecapItem[]): ArticleSegment[] {
  const byId = new Map(items.map((i) => [i.entry.tweet_id, i]));
  const segments: ArticleSegment[] = [];
  const regex = /\{\{(\d+)\}\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(raw)) !== null) {
    const [full, tweetId] = match;
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: raw.slice(lastIndex, match.index) });
    }
    const item = byId.get(tweetId);
    if (item) {
      segments.push({
        type: "link",
        value: "↗",
        url: item.entry.url,
        handle: item.handle,
      });
    }
    lastIndex = match.index + full.length;
  }
  if (lastIndex < raw.length) {
    segments.push({ type: "text", value: raw.slice(lastIndex) });
  }
  return segments;
}

// Deterministic, no-AI version — used whenever GEMINI_API_KEY isn't set or
// the API call fails, so /recap always renders something.
function buildFallbackArticle(items: RecapItem[]): string {
  if (items.length === 0) return "";
  const sentences = items.map((i) => {
    const said =
      i.entry.notes || (i.text ? excerpt(i.text) : "shared something worth a look");
    return `@${i.handle}{{${i.entry.tweet_id}}} ${said}.`;
  });
  return sentences.join(" ");
}

async function writeArticle(items: RecapItem[], statsText: string | null) {
  const key = process.env.GEMINI_API_KEY;
  if (!key || items.length === 0) return null;

  const payload = items.map((i) => ({
    tweet_id: i.entry.tweet_id,
    creator: i.name ?? i.handle,
    handle: i.handle,
    category: i.entry.category,
    curator_note: i.entry.notes,
    text: i.text,
  }));

  const systemInstruction =
    "You write a short bulletin-style recap for a community archive of curated tweets, " +
    "in the voice of someone writing their own bulletin submission — flowing prose, not a list. " +
    'Return ONLY JSON shaped as {"article": string}. ' +
    "The article is 2-3 short paragraphs (separated by a blank line) of plain text that reads " +
    "naturally, referencing creators by @handle inline as part of normal sentences " +
    "(e.g. 'today on pyth, @handle flagged a huge surge in price action'). " +
    "Immediately after each @handle mention that references a specific tweet, insert the literal " +
    "token {{tweet_id}} with no space, using the exact tweet_id given for that tweet, " +
    "e.g. '@handle{{1234567890}}'. Every tweet in the input must be referenced exactly once. " +
    "Only use what is in the given text, notes and stats — never invent facts, numbers, or quotes. " +
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
              parts: [{ text: JSON.stringify({ stats: statsText, tweets: payload }) }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            maxOutputTokens: 1200,
          },
        }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { article: string };
    return parsed.article || null;
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
      };
    })
  );

  const aiArticle = await writeArticle(items, statsText);
  const rawArticle = aiArticle ?? buildFallbackArticle(items);

  const paragraphs = rawArticle
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => parseParagraph(p, items));

  return { paragraphs, items, since, aiUsed: !!aiArticle, statsText };
}