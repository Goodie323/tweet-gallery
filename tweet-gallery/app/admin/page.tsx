import { supabase } from "@/lib/supabase";
import AdminForm from "@/components/AdminForm";
import AdminList from "@/components/AdminList";
import SignOutButton from "@/components/SignOutButton";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { data: tweets } = await supabase
    .from("tweets")
    .select("*")
    .order("added_at", { ascending: false });

  const categories = Array.from(
    new Set((tweets ?? []).map((t) => t.category).filter(Boolean))
  ) as string[];

  return (
    <main className="min-h-screen bg-ink px-6 py-16 md:px-16">
      <header className="mb-10 flex items-center justify-between max-w-4xl">
        <div>
          <p className="stamp inline-block mb-3">Curator Panel</p>
          <h1 className="font-display italic text-3xl text-paper">
            Manage the archive
          </h1>
        </div>
        <SignOutButton />
      </header>

      <div className="grid md:grid-cols-[380px_1fr] gap-8 max-w-4xl">
        <AdminForm existingCategories={categories} />
        <div className="flex flex-col gap-3">
          <p className="text-xs text-muted uppercase tracking-wide">
            {tweets?.length ?? 0} entries
          </p>
          <AdminList tweets={tweets ?? []} />
        </div>
      </div>
    </main>
  );
}
