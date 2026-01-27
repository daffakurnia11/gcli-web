import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { auth } from "@/lib/auth";

const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

const parseAccountId = (value?: string | null) => {
  if (!value || !/^\d+$/.test(value)) {
    return null;
  }
  const id = Number.parseInt(value, 10);
  return Number.isNaN(id) ? null : id;
};

export async function getAccountIdFromRequest(request: Request) {
  const session = await auth();
  const sessionAccountId = parseAccountId(session?.user?.id);
  if (sessionAccountId) {
    return sessionAccountId;
  }

  if (!authSecret) {
    return null;
  }

  const hasBearerToken = request.headers
    .get("authorization")
    ?.toLowerCase()
    .startsWith("bearer ");

  if (!hasBearerToken) {
    return null;
  }

  const nextRequest = new NextRequest(request.url, {
    headers: request.headers,
  });

  const token =
    (await getToken({ req: nextRequest, secret: authSecret })) ??
    (await getToken({
      req: nextRequest,
      secret: authSecret,
      cookieName: "__Secure-authjs.session-token",
    })) ??
    (await getToken({
      req: nextRequest,
      secret: authSecret,
      cookieName: "authjs.session-token",
    }));

  return parseAccountId(token?.sub);
}

