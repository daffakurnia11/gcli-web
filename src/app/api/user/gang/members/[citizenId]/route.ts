import { prisma } from "@/lib/prisma";
import { resolveCitizenIdForAccount } from "@/lib/userCitizenId";
import { requireAccountId } from "@/services/api-guards";
import { apiFromLegacy, apiMethodNotAllowed } from "@/services/api-response";
import { parseJson } from "@/services/json";
import { logger } from "@/services/logger";
import {
  canAssignGangGrade,
  canManageGangMemberByGrade,
  canManageGangMembers,
  canModifySelf,
} from "@/services/policies/gang-members.policy";

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

  const actorGradeLevel = parsedGang?.grade?.level ?? 0;
  const actorIsBoss = Boolean(parsedGang?.isboss);

  if (!canManageGangMembers(actorIsBoss)) {
    return {
      error: "Only team boss can manage members.",
      status: 403 as const,
    };
  }

  return {
    actorCitizenId: resolved.citizenId,
    gangName,
    actorGradeLevel,
  };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ citizenId: string }> },
) {
  try {
    const context = await getActorContext(request);
    if ("error" in context) {
      return apiFromLegacy({ error: context.error }, { status: context.status });
    }

    const targetCitizenId = (await params).citizenId;
    if (!targetCitizenId) {
      return apiFromLegacy({ error: "Invalid target member." }, { status: 400 });
    }

    if (!canModifySelf(context.actorCitizenId, targetCitizenId)) {
      return apiFromLegacy(
        { error: "You cannot change your own grade." },
        { status: 400 },
      );
    }

    const body = (await request.json().catch(() => null)) as
      | { gradeLevel?: number }
      | null;
    const gradeLevel = Number(body?.gradeLevel);
    if (!Number.isInteger(gradeLevel) || gradeLevel < 0) {
      return apiFromLegacy({ error: "Invalid grade level." }, { status: 400 });
    }

    if (!canAssignGangGrade(context.actorGradeLevel, gradeLevel)) {
      return apiFromLegacy(
        { error: "You cannot assign grade equal or higher than your own." },
        { status: 403 },
      );
    }

    const [targetMembership, targetGrade, team, targetPlayer] = await Promise.all([
      prisma.player_groups.findFirst({
        where: {
          citizenid: targetCitizenId,
          type: "gang",
          group: context.gangName,
        },
        select: {
          citizenid: true,
          grade: true,
        },
      }),
      prisma.tl_gang_grades.findFirst({
        where: {
          gang_name: context.gangName,
          grade: gradeLevel,
        },
        select: {
          name: true,
          isboss: true,
          bankauth: true,
        },
      }),
      prisma.tl_gangs.findUnique({
        where: { name: context.gangName },
        select: { label: true },
      }),
      prisma.players.findUnique({
        where: { citizenid: targetCitizenId },
        select: { gang: true },
      }),
    ]);

    if (!targetMembership) {
      return apiFromLegacy({ error: "Member not found in this team." }, { status: 404 });
    }

    if (
      !canManageGangMemberByGrade(context.actorGradeLevel, targetMembership.grade)
    ) {
      return apiFromLegacy(
        { error: "You cannot manage members with equal or higher grade." },
        { status: 403 },
      );
    }

    if (!targetGrade) {
      return apiFromLegacy(
        { error: "Selected grade does not exist in this team." },
        { status: 400 },
      );
    }

    await prisma.$transaction(async (tx) => {
      // Match qbx_core SQL pattern: upsert into player_groups.
      await tx.$executeRaw`
        INSERT INTO player_groups (citizenid, type, \`group\`, grade)
        VALUES (${targetCitizenId}, ${"gang"}, ${context.gangName}, ${gradeLevel})
        ON DUPLICATE KEY UPDATE grade = ${gradeLevel}
      `;

      const parsedTargetGang = parseJson<ParsedGang | null>(targetPlayer?.gang, null);
      if (parsedTargetGang?.name?.toLowerCase() === context.gangName) {
        const payload = buildGangPayload(
          context.gangName,
          team?.label ?? parsedTargetGang.label ?? context.gangName,
          gradeLevel,
          targetGrade.name,
          Boolean(targetGrade.isboss),
          Boolean(targetGrade.bankauth),
        );

        await tx.players.update({
          where: { citizenid: targetCitizenId },
          data: { gang: JSON.stringify(payload) },
        });
      }
    });

    return apiFromLegacy({ message: "Member grade updated successfully." }, { status: 200 });
  } catch (error) {
    logger.error("Update member grade error:", error);
    return apiFromLegacy({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ citizenId: string }> },
) {
  try {
    const context = await getActorContext(request);
    if ("error" in context) {
      return apiFromLegacy({ error: context.error }, { status: context.status });
    }

    const targetCitizenId = (await params).citizenId;
    if (!targetCitizenId) {
      return apiFromLegacy({ error: "Invalid target member." }, { status: 400 });
    }

    if (!canModifySelf(context.actorCitizenId, targetCitizenId)) {
      return apiFromLegacy(
        { error: "You cannot remove yourself from team." },
        { status: 400 },
      );
    }

    const [targetMembership, targetPlayer, noneGang, noneGrade] = await Promise.all([
      prisma.player_groups.findFirst({
        where: {
          citizenid: targetCitizenId,
          type: "gang",
          group: context.gangName,
        },
        select: {
          citizenid: true,
          grade: true,
        },
      }),
      prisma.players.findUnique({
        where: { citizenid: targetCitizenId },
        select: { gang: true },
      }),
      prisma.tl_gangs.findUnique({
        where: { name: "none" },
        select: { label: true },
      }),
      prisma.tl_gang_grades.findFirst({
        where: { gang_name: "none", grade: 0 },
        select: { name: true },
      }),
    ]);

    if (!targetMembership) {
      return apiFromLegacy({ error: "Member not found in this team." }, { status: 404 });
    }

    if (
      !canManageGangMemberByGrade(context.actorGradeLevel, targetMembership.grade)
    ) {
      return apiFromLegacy(
        { error: "You cannot remove members with equal or higher grade." },
        { status: 403 },
      );
    }

    await prisma.$transaction(async (tx) => {
      // Match qbx_core SQL pattern: delete from player_groups.
      await tx.$executeRaw`
        DELETE FROM player_groups
        WHERE citizenid = ${targetCitizenId} AND type = ${"gang"} AND \`group\` = ${context.gangName}
      `;

      const parsedTargetGang = parseJson<ParsedGang | null>(targetPlayer?.gang, null);
      if (parsedTargetGang?.name?.toLowerCase() === context.gangName) {
        const payload = buildGangPayload(
          "none",
          noneGang?.label ?? "No Gang",
          0,
          noneGrade?.name ?? "Civilian",
          false,
          false,
        );

        await tx.players.update({
          where: { citizenid: targetCitizenId },
          data: { gang: JSON.stringify(payload) },
        });
      }
    });

    return apiFromLegacy({ message: "Member removed successfully." }, { status: 200 });
  } catch (error) {
    logger.error("Remove member error:", error);
    return apiFromLegacy({ error: "Internal server error" }, { status: 500 });
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

export function OPTIONS() {
  return apiMethodNotAllowed();
}

export function HEAD() {
  return apiMethodNotAllowed();
}
