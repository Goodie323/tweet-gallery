import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const COOKIE_NAME = "gallery_admin_session";

function verify(signed: string, secret: string): boolean {
  const [value, hmac] = signed.split(".");
  if (!value || !hmac) return false;
  const expected = crypto.createHmac("sha256", secret).update(value).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Let the login page itself through untouched.
  if (pathname === "/admin/login") return NextResponse.next();

  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    const secret = process.env.SESSION_SECRET!;
    if (!token || !verify(token, secret)) {
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
