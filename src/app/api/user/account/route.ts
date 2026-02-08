import { prisma } from "@/lib/prisma";
import { requireAccountId } from "@/services/api-guards";
import { apiFromLegacy, apiMethodNotAllowed } from "@/services/api-response";
import { logger } from "@/services/logger";
import { checkRateLimit } from "@/services/rate-limit";

export async function GET(request: Request) {
  try {
    const authz = await requireAccountId(request);
    if (!authz.ok) {
      return authz.response;
    }
    const accountId = authz.accountId;

    const account = await prisma.web_accounts.findUnique({
      where: { id: accountId },
      select: {
        id: true,
        email: true,
        created_at: true,
        discord_id: true,
        profile: {
          select: {
            real_name: true,
            fivem_name: true,
            gender: true,
            birth_date: true,
            province_id: true,
            province_name: true,
            city_id: true,
            city_name: true,
          },
        },
        discord: {
          select: {
            username: true,
            email: true,
            image: true,
          },
        },
        user: {
          select: {
            username: true,
            fivem: true,
            license: true,
            license2: true,
          },
        },
      },
    });

    return apiFromLegacy(
      {
        ...account,
        featureFlags: {
          allowFivemChange: process.env.ALLOW_FIVEM_CHANGE === "true",
          allowDiscordChange: process.env.ALLOW_DISCORD_CHANGE === "true",
        },
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Account fetch error:", error);
    return apiFromLegacy({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const rateLimited = await checkRateLimit(request, {
      keyPrefix: "api:user-account-delete",
      limit: 5,
      windowMs: 60_000,
    });
    if (rateLimited) {
      return rateLimited;
    }

    const authz = await requireAccountId(request);
    if (!authz.ok) {
      return authz.response;
    }
    const accountId = authz.accountId;

    const account = await prisma.web_accounts.findUnique({
      where: { id: accountId },
      select: { user_id: true },
    });

    const userId = account?.user_id ?? null;
    // Delete related records first (due to foreign key constraints)
    const deletes = [
      // Delete Discord account linkage
      prisma.web_discord_accounts.deleteMany({
        where: { account_id: accountId },
      }),
      // Delete profile
      prisma.web_profiles.deleteMany({
        where: { account_id: accountId },
      }),
      // Delete sessions
      prisma.web_sessions.deleteMany({
        where: { user_id: accountId },
      }),
      // Finally delete the account
      prisma.web_accounts.delete({
        where: { id: accountId },
      }),
      ...(userId
        ? [
            prisma.users.delete({
              where: { userId },
            }),
          ]
        : []),
    ];

    await prisma.$transaction(deletes);

    return apiFromLegacy(
      { message: "Account deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Account deletion error:", error);
    return apiFromLegacy(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
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
