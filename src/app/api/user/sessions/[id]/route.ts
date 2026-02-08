import { prisma } from "@/lib/prisma";
import { requireAccountId } from "@/services/api-guards";
import { apiFromLegacy, apiMethodNotAllowed } from "@/services/api-response";
import { logger } from "@/services/logger";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authz = await requireAccountId(request);
    if (!authz.ok) {
      return authz.response;
    }
    const accountId = authz.accountId;

    const sessionId = Number.parseInt((await params).id, 10);

    if (Number.isNaN(accountId) || Number.isNaN(sessionId)) {
      return apiFromLegacy(
        { error: "Invalid account or session ID" },
        { status: 400 },
      );
    }

    // Verify the session belongs to the user
    const targetSession = await prisma.web_sessions.findFirst({
      where: {
        id: sessionId,
        user_id: accountId,
      },
    });

    if (!targetSession) {
      return apiFromLegacy({ error: "Session not found" }, { status: 404 });
    }

    // Delete the session
    await prisma.web_sessions.delete({
      where: { id: sessionId },
    });

    return apiFromLegacy(
      { message: "Session revoked successfully" },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Revoke session error:", error);
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

export function POST() {
  return apiMethodNotAllowed();
}

export function PUT() {
  return apiMethodNotAllowed();
}

export function PATCH() {
  return apiMethodNotAllowed();
}

export function OPTIONS() {
  return apiMethodNotAllowed();
}

export function HEAD() {
  return apiMethodNotAllowed();
}
