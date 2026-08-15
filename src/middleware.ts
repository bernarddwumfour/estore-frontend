import { NextRequest, NextResponse } from "next/server";

const STAFF_ROLES = ["staff", "admin"];
const AUTH_COOKIE_KEY = "auth_data";
const STAFF_LOGIN_PATH = "/admin/login";

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get(AUTH_COOKIE_KEY)?.value;

  const redirectToStaffLogin = () =>
    NextResponse.redirect(new URL(STAFF_LOGIN_PATH, request.url));

  if (!authCookie) {
    return redirectToStaffLogin();
  }

  try {
    const authData = JSON.parse(decodeURIComponent(authCookie));
    const role = authData?.user?.role;
    if (!STAFF_ROLES.includes(role)) {
      return redirectToStaffLogin();
    }
  } catch {
    return redirectToStaffLogin();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
