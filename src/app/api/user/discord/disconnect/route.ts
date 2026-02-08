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

    // Delete the Discord account linkage
    await prisma.web_discord_accounts.deleteMany({
      where: { account_id: accountId },
    });

    // Clear the discord_id from web_accounts
    await prisma.web_accounts.update({
      where: { id: accountId },
      data: { discord_id: null },
    });

    return apiFromLegacy(
      { message: "Discord account disconnected successfully" },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Discord disconnect error:", error);
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
