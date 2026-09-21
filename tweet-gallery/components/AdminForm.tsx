"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "single" | "bulk";

export default function AdminForm({
  existingCategories,
}: {
  existingCategories: string[];
}) {
  const [mode, setMode] = useState<Mode>("single");
  const [url, setUrl] = useState("");
  const [bulkUrls, setBulkUrls] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [featured, setFeatured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function resetFields() {
    setUrl("");
    setBulkUrls("");
    setCategory("");
    setNotes("");
    setFeatured(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    if (mode === "single") {
      const res = await fetch("/api/tweets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, category, notes, featured }),
      });

      setLoading(false);
      if (res.ok) {
        resetFields();
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Couldn't add that entry.");
      }
      return;
    }

    // Bulk mode — one URL per line, shared category/notes/featured applied to all.
    const urls = bulkUrls
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (urls.length === 0) {
      setLoading(false);
      setError("Paste at least one tweet URL.");
      return;
    }

    const res = await fetch("/api/tweets/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls, category, notes, featured }),
    });

    setLoading(false);
    const data = await res.json();

    if (res.ok) {
      resetFields();
      router.refresh();
      const skippedNote =
        data.skipped?.length > 0
          ? ` (${data.skipped.length} skipped — not valid tweet URLs)`
          : "";
      setInfo(`Added ${data.inserted} ${data.inserted === 1 ? "entry" : "entries"}.${skippedNote}`);
    } else {
      setError(data.error ?? "Couldn't add those entries.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card-hairline bg-surface rounded-sm p-6 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <p className="stamp w-fit">New Entry</p>
        <div className="flex gap-1 text-xs">
          <button
            type="button"
            onClick={() => setMode("single")}
            className={`px-2 py-1 rounded-sm border ${
              mode === "single"
                ? "border-gold text-gold"
                : "border-line text-muted hover:text-paper"
            }`}
          >
            Single
          </button>
          <button
            type="button"
            onClick={() => setMode("bulk")}
            className={`px-2 py-1 rounded-sm border ${
              mode === "bulk"
                ? "border-gold text-gold"
                : "border-line text-muted hover:text-paper"
            }`}
          >
            Bulk
          </button>
        </div>
      </div>

      {mode === "single" ? (
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
      ) : (
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted uppercase tracking-wide">
            Tweet URLs (one per line)
          </label>
          <textarea
            required
            value={bulkUrls}
            onChange={(e) => setBulkUrls(e.target.value)}
            rows={6}
            placeholder={"https://x.com/handle/status/111\nhttps://x.com/handle/status/222\nhttps://x.com/handle/status/333"}
            className="bg-ink border border-line rounded-sm px-3 py-2 text-paper text-sm font-mono focus:outline-none focus:border-gold resize-y"
          />
          <p className="text-[0.7rem] text-muted">
            Category, note, and featured below apply to all of these. Up to
            100 at once.
          </p>
        </div>
      )}

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
      {info && <p className="text-xs text-gold">{info}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-gold text-ink font-medium text-sm py-2 rounded-sm hover:opacity-90 disabled:opacity-50"
      >
        {loading
          ? "Adding…"
          : mode === "single"
          ? "Add to archive"
          : "Add all to archive"}
      </button>
    </form>
  );
}
