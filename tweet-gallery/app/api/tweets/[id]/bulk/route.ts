import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdminSession } from "@/lib/session";
import { extractTweetId, extractHandle } from "@/lib/tweet";

export async function POST(req: NextRequest) {
  if (!isAdminSession()) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const body = await req.json();
  const { urls, category, notes, featured } = body as {
    urls: string[];
    category?: string;
    notes?: string;
    featured?: boolean;
  };

  if (!Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json(
      { error: "No URLs provided." },
      { status: 400 }
    );
  }

  // Dedupe and cap so someone can't paste 5,000 lines by accident.
  const cleanUrls = Array.from(
    new Set(urls.map((u) => u.trim()).filter(Boolean))
  ).slice(0, 100);

  const rows: {
    tweet_id: string;
    url: string;
    author_handle: string | null;
    category: string | null;
    notes: string | null;
    featured: boolean;
  }[] = [];
  const skipped: string[] = [];

  for (const url of cleanUrls) {
    const tweet_id = extractTweetId(url);
    if (!tweet_id) {
      skipped.push(url);
      continue;
    }
    rows.push({
      tweet_id,
      url,
      author_handle: extractHandle(url),
      category: category || null,
      notes: notes || null,
      featured: !!featured,
    });
  }

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "None of those looked like valid tweet URLs.", skipped },
      { status: 400 }
    );
  }

  const admin = supabaseAdmin();
  const { data, error } = await admin.from("tweets").insert(rows).select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    inserted: data?.length ?? 0,
    skipped,
  });
}
