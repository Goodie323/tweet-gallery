import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { isAdminSession } from "@/lib/session";

// Extracts the numeric tweet ID from any standard x.com / twitter.com URL.
function extractTweetId(url: string): string | null {
  const match = url.match(/status\/(\d+)/);
  return match ? match[1] : null;
}

function extractHandle(url: string): string | null {
  const match = url.match(/(?:x\.com|twitter\.com)\/([^\/]+)\/status/);
  return match ? match[1] : null;
}

export async function GET() {
  const { data, error } = await supabase
    .from("tweets")
    .select("*")
    .order("added_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ tweets: data });
}

export async function POST(req: NextRequest) {
  const isAuth = await isAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const body = await req.json();
  const { url, category, notes, featured } = body;

  const tweet_id = extractTweetId(url ?? "");
  if (!tweet_id) {
    return NextResponse.json(
      { error: "That doesn't look like a valid tweet URL." },
      { status: 400 }
    );
  }
  const author_handle = extractHandle(url);

  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("tweets")
    .insert({
      tweet_id,
      url,
      author_handle,
      category: category || null,
      notes: notes || null,
      featured: !!featured,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ tweet: data });
}