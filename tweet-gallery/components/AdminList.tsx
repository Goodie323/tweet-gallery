"use client";

import { useRouter } from "next/navigation";
import type { TweetEntry } from "@/lib/supabase";

export default function AdminList({ tweets }: { tweets: TweetEntry[] }) {
  const router = useRouter();

  async function toggleFeatured(t: TweetEntry) {
    await fetch(`/api/tweets/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !t.featured }),
    });
    router.refresh();
  }

  async function remove(t: TweetEntry) {
    if (!confirm("Remove this entry from the archive?")) return;
    await fetch(`/api/tweets/${t.id}`, { method: "DELETE" });
    router.refresh();
  }

  if (tweets.length === 0) {
    return <p className="text-muted text-sm">No entries yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {tweets.map((t) => (
        <div
          key={t.id}
          className="card-hairline bg-surface rounded-sm px-4 py-3 flex items-center justify-between gap-4 text-sm"
        >
          <div className="min-w-0">
            <p className="truncate text-paper">{t.url}</p>
            <p className="text-xs text-muted">
              {t.category || "Uncategorized"} ·{" "}
              {new Date(t.added_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => toggleFeatured(t)}
              className={`text-xs px-2 py-1 rounded-sm border ${
                t.featured
                  ? "border-gold text-gold"
                  : "border-line text-muted hover:text-paper"
              }`}
            >
              ★
            </button>
            <button
              onClick={() => remove(t)}
              className="text-xs px-2 py-1 rounded-sm border border-line text-muted hover:text-red-400 hover:border-red-400"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
