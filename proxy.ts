import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Edge-safe: only inspect the JWT cookie. We do NOT call auth() here
// (that would require Node APIs). Role is verified again inside each
// protected route handler as defense in depth.
export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isTeacherArea = pathname.startsWith("/teacher-dashboard");
  const isStudentArea = pathname.startsWith("/student-dashboard");

  if (!isTeacherArea && !isStudentArea) {
    return NextResponse.next();
  }

  // next-auth v5 session cookie names. The default secure name is
  // `authjs.session-token` (or `__Secure-authjs.session-token` over HTTPS).
  const sessionToken =
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value ||
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value;

  if (!sessionToken) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // We cannot decode the JWT in the Edge runtime without importing auth,
  // so we let the request through. Pages and API routes re-check role.
  return NextResponse.next();
}

export const config = {
  matcher: ["/teacher-dashboard/:path*", "/student-dashboard/:path*"],
};