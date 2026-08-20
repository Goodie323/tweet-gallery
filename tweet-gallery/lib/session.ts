import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "gallery_admin_session";

function sign(value: string) {
  const secret = process.env.SESSION_SECRET!;
  const hmac = crypto.createHmac("sha256", secret).update(value).digest("hex");
  return `${value}.${hmac}`;
}

function verify(signed: string): boolean {
  const secret = process.env.SESSION_SECRET!;
  const [value, hmac] = signed.split(".");
  if (!value || !hmac) return false;
  const expected = crypto.createHmac("sha256", secret).update(value).digest("hex");
  
  try {
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function createAdminSession() {
  const token = sign("admin");
  const cookieStore = await cookies();
  
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verify(token);
}

export { COOKIE_NAME, verify };