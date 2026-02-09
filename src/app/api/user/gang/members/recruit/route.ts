import { prisma } from "@/lib/prisma";
import { resolveCitizenIdForAccount } from "@/lib/userCitizenId";
import { requireAccountId } from "@/services/api-guards";
import { apiFromLegacy, apiMethodNotAllowed } from "@/services/api-response";
import { parseJson } from "@/services/json";
import { logger } from "@/services/logger";
import { canManageGangMembers, canModifySelf } from "@/services/policies/gang-members.policy";

type ParsedGang = {
  name?: string;
  label?: string;
  isboss?: boolean;
  bankAuth?: boolean;
  grade?: {
    level?: number;
    name?: string;
  };
};

type FiveMPlayer = {
  identifiers?: string[];
};

const FIVEM_API_BASE =
  process.env.FIVEM_API_BASE ?? process.env.FIVEM_API_BASE_URL ?? null;

const normalizeLicense = (value: string | null | undefined) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/^license:/, "");

const buildGangPayload = (
  gangName: string,
  gangLabel: string,
  gradeLevel: number,
  gradeName: string,
  isBoss: boolean,
  bankAuth: boolean,
) => ({
  name: gangName,
  label: gangLabel,
  isboss: isBoss,
  bankAuth,
  grade: {
    name: gradeName,
    level: gradeLevel,
  },
});

async function getActorContext(request: Request) {
  const authz = await requireAccountId(request);
  if (!authz.ok) {
    return { error: "Unauthorized", status: 401 as const };
  }
  const accountId = authz.accountId;

  const resolved = await resolveCitizenIdForAccount(accountId);
  if (!resolved?.citizenId) {
    return {
      error: "No linked character was found for this account.",
      status: 400 as const,
    };
  }

  const actor = await prisma.players.findUnique({
    where: { citizenid: resolved.citizenId },
    select: { citizenid: true, gang: true },
  });
  const parsedGang = parseJson<ParsedGang | null>(actor?.gang, null);
  const gangName = parsedGang?.name?.toLowerCase();

  if (!gangName || gangName === "none") {
    return {
      error: "You are not currently assigned to a team.",
      status: 403 as const,
    };
  }

  const actorIsBoss = Boolean(parsedGang?.isboss);
  if (!canManageGangMembers(actorIsBoss)) {
    return {
      error: "Only team boss can recruit members.",
      status: 403 as const,
    };
  }

  return {
    actorCitizenId: resolved.citizenId,
    gangName,
  };
}

async function isPlayerOnlineByLicense(license: string) {
  if (!FIVEM_API_BASE) {
    return false;
  }

  const liveResponse = await fetch(`${FIVEM_API_BASE}/players.json`, {
    cache: "no-store",
  });
  if (!liveResponse.ok) {
    return false;
  }

  const livePlayers = (await liveResponse.json()) as FiveMPlayer[];
  const target = normalizeLicense(license);

  return livePlayers.some((player) =>
    (player.identifiers ?? []).some((identifier) => normalizeLicense(identifier) === target),
  );
}

export async function POST(request: Request) {
  try {
    const context = await getActorContext(request);
    if ("error" in context) {
      return apiFromLegacy({ error: context.error }, { status: context.status });
    }

    const body = (await request.json().catch(() => null)) as
      | { citizenId?: string }
      | null;
    const targetCitizenId = String(body?.citizenId ?? "").trim();

    if (!targetCitizenId) {
      return apiFromLegacy({ error: "Citizen ID is required." }, { status: 400 });
    }

    if (!canModifySelf(context.actorCitizenId, targetCitizenId)) {
      return apiFromLegacy({ error: "You cannot recruit yourself." }, { status: 400 });
    }

    const [targetPlayer, team, gradeZero] = await Promise.all([
      prisma.players.findUnique({
        where: { citizenid: targetCitizenId },
        select: { citizenid: true, license: true, gang: true },
      }),
      prisma.tl_gangs.findUnique({
        where: { name: context.gangName },
        select: { label: true },
      }),
      prisma.tl_gang_grades.findFirst({
        where: { gang_name: context.gangName, grade: 0 },
        select: { name: true, isboss: true, bankauth: true },
      }),
    ]);

    if (!targetPlayer) {
      return apiFromLegacy({ error: "Player not found." }, { status: 404 });
    }

    const targetGang = parseJson<ParsedGang | null>(targetPlayer.gang, null);
    if (targetGang?.name?.toLowerCase() === context.gangName) {
      return apiFromLegacy({ error: "Player is already in your gang." }, { status: 400 });
    }

    if (!team || !gradeZero) {
      return apiFromLegacy({ error: "Gang configuration is missing." }, { status: 400 });
    }

    const online = await isPlayerOnlineByLicense(targetPlayer.license);
    if (online) {
      return apiFromLegacy(
        { error: "Player is online. Recruit them in-game instead." },
        { status: 400 },
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        INSERT INTO player_groups (citizenid, type, \`group\`, grade)
        VALUES (${targetCitizenId}, ${"gang"}, ${context.gangName}, ${0})
        ON DUPLICATE KEY UPDATE grade = ${0}
      `;

      const payload = buildGangPayload(
        context.gangName,
        team.label ?? context.gangName,
        0,
        gradeZero.name,
        Boolean(gradeZero.isboss),
        Boolean(gradeZero.bankauth),
      );

      await tx.players.update({
        where: { citizenid: targetCitizenId },
        data: { gang: JSON.stringify(payload) },
      });
    });

    return apiFromLegacy({ message: "Member recruited successfully." }, { status: 200 });
  } catch (error) {
    logger.error("Recruit member error:", error);
    return apiFromLegacy({ error: "Internal server error" }, { status: 500 });
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
