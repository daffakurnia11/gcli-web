import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const nextUrl = request.nextUrl;
  const pathname = nextUrl.pathname;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    /\.[^/]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  });
  const isAuthenticated = Boolean(token);
  const isRegistered = Boolean(token?.isRegistered);
  const isAuthPage = pathname === "/auth" || pathname === "/auth/";
  const isSetupPage = pathname.startsWith("/auth/setup");
  const isDashboardPage =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isApiRoute = pathname.startsWith("/api");

  if (isDashboardPage && !isAuthenticated) {
    return NextResponse.redirect(new URL("/auth", nextUrl));
  }

  if (pathname.startsWith("/auth")) {
    if (isAuthenticated && isRegistered) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }

    if (isAuthenticated && !isRegistered) {
      if (isSetupPage) {
        return NextResponse.next();
      }
      if (isAuthPage) {
        return NextResponse.redirect(new URL("/auth/setup?step=1", nextUrl));
      }
    }
  }

  if (isAuthenticated && !isRegistered && !isSetupPage && !isApiRoute) {
    return NextResponse.redirect(new URL("/auth/setup?step=1", nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
