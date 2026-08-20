"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TweetEntry } from "@/lib/supabase";

export default function AdminForm({
  existingCategories,
}: {
  existingCategories: string[];
}) {
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [featured, setFeatured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/tweets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, category, notes, featured }),
    });

    setLoading(false);
    if (res.ok) {
      setUrl("");
      setCategory("");
      setNotes("");
      setFeatured(false);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Couldn't add that entry.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card-hairline bg-surface rounded-sm p-6 flex flex-col gap-4"
    >
      <p className="stamp w-fit">New Entry</p>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted uppercase tracking-wide">
          Tweet URL
        </label>
        <input
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://x.com/handle/status/1234567890"
          className="bg-ink border border-line rounded-sm px-3 py-2 text-paper text-sm focus:outline-none focus:border-gold"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted uppercase tracking-wide">
          Category
        </label>
        <input
          list="categories"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g. Architecture, Community, Meme"
          className="bg-ink border border-line rounded-sm px-3 py-2 text-paper text-sm focus:outline-none focus:border-gold"
        />
        <datalist id="categories">
          {existingCategories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted uppercase tracking-wide">
          Curator's note (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Why this one made the cut"
          className="bg-ink border border-line rounded-sm px-3 py-2 text-paper text-sm focus:outline-none focus:border-gold resize-none"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-paper">
        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
          className="accent-gold"
        />
        Mark as featured
      </label>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-gold text-ink font-medium text-sm py-2 rounded-sm hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Adding…" : "Add to archive"}
      </button>
    </form>
  );
}
