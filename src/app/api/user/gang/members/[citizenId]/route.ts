import { NextResponse } from "next/server";

import { getAccountIdFromRequest } from "@/lib/apiAuth";
import { prisma } from "@/lib/prisma";
import { resolveCitizenIdForAccount } from "@/lib/userCitizenId";

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

const parseJson = <T>(value: string | null): T | null => {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
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
  const accountId = await getAccountIdFromRequest(request);
  if (!accountId) {
    return { error: "Unauthorized", status: 401 as const };
  }

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
  const parsedGang = parseJson<ParsedGang>(actor?.gang ?? null);
  const gangName = parsedGang?.name?.toLowerCase();

  if (!gangName || gangName === "none") {
    return {
      error: "You are not currently assigned to a team.",
      status: 403 as const,
    };
  }

  const actorGradeLevel = parsedGang?.grade?.level ?? 0;
  const actorIsBoss = Boolean(parsedGang?.isboss);

  if (!actorIsBoss) {
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
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const targetCitizenId = (await params).citizenId;
    if (!targetCitizenId) {
      return NextResponse.json({ error: "Invalid target member." }, { status: 400 });
    }

    if (targetCitizenId === context.actorCitizenId) {
      return NextResponse.json(
        { error: "You cannot change your own grade." },
        { status: 400 },
      );
    }

    const body = (await request.json().catch(() => null)) as
      | { gradeLevel?: number }
      | null;
    const gradeLevel = Number(body?.gradeLevel);
    if (!Number.isInteger(gradeLevel) || gradeLevel < 0) {
      return NextResponse.json({ error: "Invalid grade level." }, { status: 400 });
    }

    if (gradeLevel >= context.actorGradeLevel) {
      return NextResponse.json(
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
      return NextResponse.json({ error: "Member not found in this team." }, { status: 404 });
    }

    if (targetMembership.grade >= context.actorGradeLevel) {
      return NextResponse.json(
        { error: "You cannot manage members with equal or higher grade." },
        { status: 403 },
      );
    }

    if (!targetGrade) {
      return NextResponse.json(
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

      const parsedTargetGang = parseJson<ParsedGang>(targetPlayer?.gang ?? null);
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

    return NextResponse.json({ message: "Member grade updated successfully." }, { status: 200 });
  } catch (error) {
    console.error("Update member grade error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ citizenId: string }> },
) {
  try {
    const context = await getActorContext(request);
    if ("error" in context) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const targetCitizenId = (await params).citizenId;
    if (!targetCitizenId) {
      return NextResponse.json({ error: "Invalid target member." }, { status: 400 });
    }

    if (targetCitizenId === context.actorCitizenId) {
      return NextResponse.json(
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
      return NextResponse.json({ error: "Member not found in this team." }, { status: 404 });
    }

    if (targetMembership.grade >= context.actorGradeLevel) {
      return NextResponse.json(
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

      const parsedTargetGang = parseJson<ParsedGang>(targetPlayer?.gang ?? null);
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

    return NextResponse.json({ message: "Member removed successfully." }, { status: 200 });
  } catch (error) {
    console.error("Remove member error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
