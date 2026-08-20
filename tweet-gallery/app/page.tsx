import { supabase } from "@/lib/supabase";
import GalleryGrid from "@/components/GalleryGrid";

export const revalidate = 60; // re-fetch at most once a minute

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
      </header>

      <GalleryGrid tweets={tweets ?? []} />

      <footer className="mt-20 pt-6 border-t border-line text-xs text-muted flex justify-between">
        <span>Curated by hand. No bots, no auto-scraping.</span>
        <a href="/admin" className="hover:text-gold">
          Curator access →
        </a>
      </footer>
    </main>
  );
}
