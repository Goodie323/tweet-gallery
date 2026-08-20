import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "gallery_admin_session";

async function verify(signed: string, secret: string): Promise<boolean> {
  const [value, hmac] = signed.split(".");
  if (!value || !hmac) return false;

  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(value);

    // Import secret key for HMAC SHA-256
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    // Generate expected HMAC signature
    const signature = await crypto.subtle.sign("HMAC", key, messageData);
    const expected = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Constant-time length check
    if (hmac.length !== expected.length) return false;

    // Constant-time string comparison (replaces timingSafeEqual)
    let result = 0;
    for (let i = 0; i < hmac.length; i++) {
      result |= hmac.charCodeAt(i) ^ expected.charCodeAt(i);
    }

    return result === 0;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Let the login page itself through untouched.
  if (pathname === "/admin/login") return NextResponse.next();

  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    const secret = process.env.SESSION_SECRET || "";

    if (!token || !(await verify(token, secret))) {
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};