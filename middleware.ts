import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import { getEnv } from "@/services/env";

export async function middleware(request: NextRequest) {
  getEnv();

  const nextUrl = request.nextUrl;
  const pathname = nextUrl.pathname;
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  const withRequestId = (response: NextResponse) => {
    response.headers.set("x-request-id", requestId);
    return response;
  };

  if (pathname === "/api/v1" || pathname.startsWith("/api/v1/")) {
    const rewrittenPath = pathname.replace(/^\/api\/v1/, "/api");
    const url = new URL(rewrittenPath + nextUrl.search, nextUrl.origin);
    return withRequestId(NextResponse.rewrite(url));
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    /\.[^/]+$/.test(pathname)
  ) {
    return withRequestId(
      NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      }),
    );
  }

  const token =
    (await getToken({
      req: request,
      secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
      cookieName: "__Secure-authjs.session-token",
    })) ??
    (await getToken({
      req: request,
      secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
      cookieName: "authjs.session-token",
    }));

  const isAuthenticated = Boolean(token);
  const isRegistered = Boolean(token?.isRegistered);
  const isAuthPage = pathname === "/auth" || pathname === "/auth/";
  const isSetupPage = pathname.startsWith("/auth/setup");
  const isDashboardPage =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");
  const isApiRoute = pathname.startsWith("/api");
  const hasAdminAccess = token?.optin === true;

  if ((isDashboardPage || isAdminPage) && !isAuthenticated) {
    return withRequestId(NextResponse.redirect(new URL("/auth", nextUrl)));
  }

  if (isAdminPage && !hasAdminAccess) {
    return withRequestId(NextResponse.redirect(new URL("/dashboard", nextUrl)));
  }

  if (pathname.startsWith("/auth")) {
    if (isAuthenticated && isRegistered) {
      return withRequestId(NextResponse.redirect(new URL("/dashboard", nextUrl)));
    }

    if (isAuthenticated && !isRegistered) {
      if (isSetupPage) {
        return NextResponse.next();
      }
      if (isAuthPage) {
        return withRequestId(
          NextResponse.redirect(new URL("/auth/setup?step=1", nextUrl)),
        );
      }
    }
  }

  if (isAuthenticated && !isRegistered && !isSetupPage && !isApiRoute) {
    return withRequestId(
      NextResponse.redirect(new URL("/auth/setup?step=1", nextUrl)),
    );
  }

  return withRequestId(
    NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    }),
  );
}

export const config = {
  matcher: ["/:path*"],
};
