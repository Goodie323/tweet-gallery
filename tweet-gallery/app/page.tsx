import { Suspense } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import GalleryGrid from "@/components/GalleryGrid";

export const revalidate = 60;

export default async function GalleryPage() {
  const { data: tweets } = await supabase
    .from("tweets")
    .select("*")
    .order("added_at", { ascending: false });

  return (
    <main className="min-h-screen bg-ink px-6 py-16 md:px-16">
      <header className="mb-14 max-w-2xl">
        <p className="stamp inline-block mb-4">Community Dispatch</p>
        <h1 className="font-display text-4xl md:text-5xl italic text-paper mb-3">
          The Archive
        </h1>
        <p className="text-muted text-sm leading-relaxed">
          A curated record of the sharpest posts from the community — pulled
          from the content hub, kept here so they don't get lost in the
          scroll.
        </p>
        <Link
          href="/recap"
          className="inline-block mt-4 text-xs text-gold hover:underline"
        >
          Read this week's recap →
        </Link>
      </header>

      <Suspense fallback={<p className="text-muted text-sm">Loading…</p>}>
        <GalleryGrid tweets={tweets ?? []} />
      </Suspense>

      <footer className="mt-20 pt-6 border-t border-line text-xs text-muted flex justify-between">
        <span>Curated by hand. No bots, no auto-scraping.</span>
        <Link href="/admin" className="hover:text-gold">
          Curator access →
        </Link>
      </footer>
    </main>
  );
}