import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { requireAccountId } from "@/services/api-guards";
import { apiFromLegacy, apiMethodNotAllowed } from "@/services/api-response";
import { logger } from "@/services/logger";

export async function GET(request: Request) {
  try {
    const authz = await requireAccountId(request);
    if (!authz.ok) {
      return authz.response;
    }
    const accountId = authz.accountId;

    // Get current session token
    const cookieStore = await cookies();
    const currentSessionToken =
      cookieStore.get("next-auth.session-token")?.value ||
      cookieStore.get("__Secure-next-auth.session-token")?.value;

    const sessions = await prisma.web_sessions.findMany({
      where: { user_id: accountId },
      select: {
        id: true,
        session_token: true,
        expires: true,
      },
      orderBy: { expires: "desc" },
    });

    // Mark current session
    const sessionsWithCurrent = sessions.map((s) => ({
      ...s,
      isCurrent: s.session_token === currentSessionToken,
      device: "Web Browser",
      browser: "Unknown",
    }));

    return apiFromLegacy(sessionsWithCurrent, { status: 200 });
  } catch (error) {
    logger.error("Sessions fetch error:", error);
    return apiFromLegacy(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// AUTO_METHOD_NOT_ALLOWED
export function POST() {
  return apiMethodNotAllowed();
}

export function PUT() {
  return apiMethodNotAllowed();
}

export function PATCH() {
  return apiMethodNotAllowed();
}

export function DELETE() {
  return apiMethodNotAllowed();
}

export function OPTIONS() {
  return apiMethodNotAllowed();
}

export function HEAD() {
  return apiMethodNotAllowed();
}
