import { NextRequest, NextResponse } from "next/server";
import { createAdminSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "That password doesn't match." },
      { status: 401 }
    );
  }

  createAdminSession();
  return NextResponse.json({ ok: true });
}
