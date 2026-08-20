"use client";

import { useMemo, useState } from "react";
import type { TweetEntry } from "@/lib/supabase";
import TweetCard from "./TweetCard";

export default function GalleryGrid({ tweets }: { tweets: TweetEntry[] }) {
  const [category, setCategory] = useState<string>("All");
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const categories = useMemo(() => {
    const set = new Set<string>();
    tweets.forEach((t) => t.category && set.add(t.category));
    return ["All", ...Array.from(set)];
  }, [tweets]);

  const filtered = useMemo(() => {
    return tweets.filter((t) => {
      if (featuredOnly && !t.featured) return false;
      if (category !== "All" && t.category !== category) return false;
      return true;
    });
  }, [tweets, category, featuredOnly]);

  if (tweets.length === 0) {
    return (
      <p className="text-muted text-sm">
        The archive is empty. Add the first entry from{" "}
        <a href="/admin" className="text-gold underline">
          /admin
        </a>
        .
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1 rounded-sm border transition-colors ${
              category === c
                ? "border-gold text-gold"
                : "border-line text-muted hover:text-paper"
            }`}
          >
            {c}
          </button>
        ))}
        <button
          onClick={() => setFeaturedOnly((v) => !v)}
          className={`px-3 py-1 rounded-sm border transition-colors ${
            featuredOnly
              ? "border-gold text-gold"
              : "border-line text-muted hover:text-paper"
          }`}
        >
          ★ Featured only
        </button>
        <span className="ml-auto text-muted">
          {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted text-sm">No entries match that filter.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((t, i) => (
            <TweetCard key={t.id} entry={t} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
