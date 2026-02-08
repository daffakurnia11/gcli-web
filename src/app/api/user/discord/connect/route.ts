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

    const body = (await request.json()) as {
      id?: string;
      username?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };

    if (!body.id) {
      return apiFromLegacy(
        { error: "Missing Discord ID" },
        { status: 400 },
      );
    }

    const discordId = body.id.startsWith("discord:")
      ? body.id
      : `discord:${body.id}`;

    await prisma.web_accounts.update({
      where: { id: accountId },
      data: { discord_id: discordId },
    });

    await prisma.web_discord_accounts.upsert({
      where: { account_id: accountId },
      create: {
        account_id: accountId,
        discord_id: discordId,
        username: body.username || "Discord User",
        global_name: body.name ?? null,
        email: body.email ?? null,
        image: body.image ?? null,
      },
      update: {
        discord_id: discordId,
        username: body.username || "Discord User",
        global_name: body.name ?? null,
        email: body.email ?? null,
        image: body.image ?? null,
      },
    });

    return apiFromLegacy(
      { message: "Discord account connected successfully" },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Discord connect error:", error);
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
