import { NextRequest, NextResponse } from "next/server";
import { sessionCookieName } from "@/lib/auth/cookie";

// Optimistic redirect only. The server layout and every API request validate identity.
export function middleware(request: NextRequest) {
  const name = sessionCookieName();
  if (!request.cookies.get(name)?.value) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  return NextResponse.next();
}
export const config = { matcher: ['/dashboard/:path*'] };
