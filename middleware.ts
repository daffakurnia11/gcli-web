import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: Request) {
  const nextUrl = new URL(request.url);
  const token = await getToken({ req: request });
  const isAuthenticated = Boolean(token);
  const isRegistered = Boolean(token?.isRegistered);
  const isAuthPage = nextUrl.pathname === "/auth" || nextUrl.pathname === "/auth/";
  const isSetupPage = nextUrl.pathname.startsWith("/auth/setup");
  const isApiRoute = nextUrl.pathname.startsWith("/api");

  if (nextUrl.pathname.startsWith("/auth")) {
    if (isAuthenticated && isRegistered) {
      return NextResponse.redirect(new URL("/", nextUrl));
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
  matcher: ["/((?!_next|.*\\..*).*)"],
};
