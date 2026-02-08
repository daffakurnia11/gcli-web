import { prisma } from "@/lib/prisma";
import { apiFromLegacy, apiMethodNotAllowed } from "@/services/api-response";
import { checkRateLimit } from "@/services/rate-limit";

export async function GET(request: Request) {
  const rateLimited = await checkRateLimit(request, {
    keyPrefix: "api:unique-check",
    limit: 60,
    windowMs: 60_000,
  });
  if (rateLimited) {
    return rateLimited;
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const value = searchParams.get("value")?.trim() ?? "";

  if (!type || !value) {
    return apiFromLegacy(
      { error: "Missing query params" },
      { status: 400 },
    );
  }

  if (type !== "username" && type !== "email" && type !== "discord") {
    return apiFromLegacy({ error: "Invalid type" }, { status: 400 });
  }

  if (type === "email") {
    const existing = await prisma.web_accounts.findUnique({
      where: { email: value },
      select: { id: true },
    });
    return apiFromLegacy({ exists: Boolean(existing) });
  }

  if (type === "discord") {
    const discordId = value.startsWith("discord:") ? value : `discord:${value}`;
    const existing = await prisma.web_accounts.findUnique({
      where: { discord_id: discordId },
      select: { id: true, password: true, profile: { select: { id: true } } },
    });
    const isTaken = Boolean(existing?.password || existing?.profile);
    return apiFromLegacy({ exists: isTaken });
  }

  const [userMatch, profileMatch] = await Promise.all([
    prisma.users.findFirst({
      where: { username: value },
      select: { userId: true },
    }),
    prisma.web_profiles.findFirst({
      where: { fivem_name: value },
      select: { id: true },
    }),
  ]);

  return apiFromLegacy({ exists: Boolean(userMatch || profileMatch) });
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
