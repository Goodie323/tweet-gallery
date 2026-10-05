"use client";

import { useState } from "react";

export default function AdminStatsForm({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(false);

  async function save() {
    await fetch("/api/settings/stats", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="card-hairline bg-surface rounded-sm p-6 flex flex-col gap-3 mb-8 max-w-4xl">
      <p className="stamp w-fit">This Week's Numbers</p>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={5}
        placeholder={"86.4% of tracked RWA perp volume priced by Pyth\n1,881 price feeds on Hermes\n..."}
        className="bg-ink border border-line rounded-sm px-3 py-2 text-paper text-sm font-mono focus:outline-none focus:border-gold resize-y"
      />
      <button
        onClick={save}
        className="self-start bg-gold text-ink font-medium text-sm px-4 py-1.5 rounded-sm hover:opacity-90"
      >
        {saved ? "Saved ✓" : "Save for this week's recap"}
      </button>
    </div>
  );
}