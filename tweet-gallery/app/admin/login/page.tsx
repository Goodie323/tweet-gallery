"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Something went wrong.");
    }
  }

  return (
    <main className="min-h-screen bg-ink flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="card-hairline bg-surface rounded-sm p-8 w-full max-w-sm flex flex-col gap-4"
      >
        <p className="stamp w-fit">Curator Access</p>
        <h1 className="font-display italic text-2xl text-paper">
          Enter the archive
        </h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          className="bg-ink border border-line rounded-sm px-3 py-2 text-paper text-sm focus:outline-none focus:border-gold"
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-gold text-ink font-medium text-sm py-2 rounded-sm hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Checking…" : "Enter"}
        </button>
      </form>
    </main>
  );
}
