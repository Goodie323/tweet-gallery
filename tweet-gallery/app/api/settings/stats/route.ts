import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { isAdminSession } from "@/lib/session";

export async function GET() {
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "weekly_stats")
    .maybeSingle();

  return NextResponse.json({ value: data?.value ?? "" });
}

export async function PATCH(req: NextRequest) {
  if (!isAdminSession()) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { value } = await req.json();
  const admin = supabaseAdmin();
  const { error } = await admin
    .from("settings")
    .upsert({ key: "weekly_stats", value, updated_at: new Date().toISOString() });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}