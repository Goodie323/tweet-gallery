"use client";

import { useEffect, useMemo, useState } from "react";
import type { TweetEntry } from "@/lib/supabase";
import TweetCard from "./TweetCard";

type SortOption = "newest" | "oldest" | "featured";

export default function GalleryGrid({ tweets }: { tweets: TweetEntry[] }) {
  const [category, setCategory] = useState<string>("All");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");

  // Debounce the search input so filtering doesn't run on every keystroke.
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 200);
    return () => clearTimeout(handle);
  }, [query]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    tweets.forEach((t) => t.category && set.add(t.category));
    return ["All", ...Array.from(set)];
  }, [tweets]);

  const filtered = useMemo(() => {
    let result = tweets.filter((t) => {
      if (featuredOnly && !t.featured) return false;
      if (category !== "All" && t.category !== category) return false;
      if (debouncedQuery) {
        const haystack = `${t.author_handle ?? ""} ${t.notes ?? ""} ${t.category ?? ""}`.toLowerCase();
        if (!haystack.includes(debouncedQuery)) return false;
      }
      return true;
    });

    result = [...result].sort((a, b) => {
      if (sort === "featured") {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return new Date(b.added_at).getTime() - new Date(a.added_at).getTime();
      }
      const diff = new Date(a.added_at).getTime() - new Date(b.added_at).getTime();
      return sort === "oldest" ? diff : -diff;
    });

    return result;
  }, [tweets, category, featuredOnly, debouncedQuery, sort]);

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
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by handle, note, or category…"
            className="flex-1 min-w-[220px] bg-surface border border-line rounded-sm px-3 py-1.5 text-sm text-paper placeholder:text-muted focus:outline-none focus:border-gold"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="bg-surface border border-line rounded-sm px-3 py-1.5 text-xs text-paper focus:outline-none focus:border-gold"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="featured">Featured first</option>
          </select>
        </div>

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