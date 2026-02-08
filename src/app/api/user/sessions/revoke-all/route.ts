import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { requireAccountId } from "@/services/api-guards";
import { apiFromLegacy, apiMethodNotAllowed } from "@/services/api-response";
import { logger } from "@/services/logger";

export async function POST(request: Request) {
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

    // Delete all sessions except current
    await prisma.web_sessions.deleteMany({
      where: {
        user_id: accountId,
        NOT: {
          session_token: currentSessionToken || "",
        },
      },
    });

    return apiFromLegacy(
      { message: "All other sessions revoked successfully" },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Revoke all sessions error:", error);
    return apiFromLegacy(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// AUTO_METHOD_NOT_ALLOWED
export function GET() {
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
