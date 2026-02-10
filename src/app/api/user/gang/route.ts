import { prisma } from "@/lib/prisma";
import { resolveCitizenIdForAccount } from "@/lib/userCitizenId";
import { createTeamSchema } from "@/schemas/teamCreate";
import { updateTeamNameSchema } from "@/schemas/teamOptions";
import { requireAccountId } from "@/services/api-guards";
import { apiFromLegacy, apiMethodNotAllowed } from "@/services/api-response";
import { parseJson } from "@/services/json";
import { logger } from "@/services/logger";

const formatInitials = (value: string) => {
  const words = value
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "TM";
  }

  return words
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 4);
};

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

type ParsedCharinfo = {
  firstname?: string;
  lastname?: string;
};

const defaultGangGrades = [
  {
    grade: 0,
    name: "Member",
    payment: 1000,
    isboss: false,
    bankauth: false,
  },
  {
    grade: 1,
    name: "Captain",
    payment: 1500,
    isboss: false,
    bankauth: false,
  },
  {
    grade: 2,
    name: "Manager",
    payment: 2000,
    isboss: false,
    bankauth: false,
  },
  {
    grade: 3,
    name: "Boss",
    payment: 2500,
    isboss: true,
    bankauth: true,
  },
] as const;

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

async function getBossGangContext(request: Request) {
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

  const player = await prisma.players.findUnique({
    where: { citizenid: resolved.citizenId },
    select: { gang: true },
  });

  const parsedGang = parseJson<ParsedGang | null>(player?.gang, null);
  const gangName = parsedGang?.name?.toLowerCase();

  if (!gangName || gangName === "none") {
    return {
      error: "You are not currently assigned to a team.",
      status: 403 as const,
    };
  }

  if (!parsedGang?.isboss) {
    return {
      error: "Only team boss can manage team options.",
      status: 403 as const,
    };
  }

  return {
    citizenId: resolved.citizenId,
    gangName,
  };
}

export async function GET(request: Request) {
  try {
    const authz = await requireAccountId(request);
    if (!authz.ok) {
      return authz.response;
    }
    const accountId = authz.accountId;

    const resolved = await resolveCitizenIdForAccount(accountId);
    if (!resolved?.citizenId) {
      return apiFromLegacy(
        {
          team: null,
          grades: [],
          stats: null,
          currentMember: null,
          message: "No linked character was found for this account.",
        },
        { status: 200 },
      );
    }

    const [account, player] = await Promise.all([
      prisma.web_accounts.findUnique({
        where: { id: accountId },
        select: {
          user: {
            select: {
              username: true,
            },
          },
        },
      }),
      prisma.players.findUnique({
        where: { citizenid: resolved.citizenId },
        select: { gang: true, charinfo: true },
      }),
    ]);

    const parsedCharinfo = parseJson<ParsedCharinfo | null>(player?.charinfo, null);

    const characterName = [parsedCharinfo?.firstname, parsedCharinfo?.lastname]
      .filter((value): value is string => Boolean(value && value.trim()))
      .join(" ")
      .trim();

    const parsedGang = parseJson<ParsedGang | null>(player?.gang, null);

    const gangName = parsedGang?.name?.toLowerCase();
    if (!gangName || gangName === "none") {
      return apiFromLegacy(
        {
          team: null,
          grades: [],
          stats: null,
          currentMember: null,
          message: "You are not currently assigned to a team.",
        },
        { status: 200 },
      );
    }

    const [team, grades, gradeMemberCounts] = await Promise.all([
      prisma.tl_gangs.findUnique({
        where: { name: gangName },
      }),
      prisma.tl_gang_grades.findMany({
        where: { gang_name: gangName },
        orderBy: { grade: "asc" },
      }),
      prisma.player_groups.groupBy({
        by: ["grade"],
        where: {
          type: "gang",
          group: gangName,
        },
        _count: {
          _all: true,
        },
      }),
    ]);

    if (!team) {
      return apiFromLegacy(
        {
          team: null,
          grades: [],
          stats: null,
          currentMember: null,
          message: `Team "${gangName}" was not found in tl_gangs.`,
        },
        { status: 200 },
      );
    }

    const bossGradeLevels = grades.filter((g) => g.isboss).map((g) => g.grade);

    const [memberCount, bossCount] = await Promise.all([
      prisma.player_groups.count({
        where: {
          type: "gang",
          group: gangName,
        },
      }),
      bossGradeLevels.length > 0
        ? prisma.player_groups.count({
            where: {
              type: "gang",
              group: gangName,
              grade: { in: bossGradeLevels },
            },
          })
        : Promise.resolve(0),
    ]);

    const payments = grades.map((grade) => grade.payment ?? 0);
    const minPayment = payments.length > 0 ? Math.min(...payments) : 0;
    const maxPayment = payments.length > 0 ? Math.max(...payments) : 0;
    const gradeCountMap = new Map<number, number>();
    gradeMemberCounts.forEach((item) => {
      gradeCountMap.set(item.grade, item._count._all);
    });

    return apiFromLegacy(
      {
        team: {
          code: team.name,
          name: team.label,
          initials: formatInitials(team.label || team.name),
          offDutyPay: team.off_duty_pay,
          createdAt: team.created_at,
          updatedAt: team.updated_at,
        },
        currentMember: {
          username: account?.user?.username ?? null,
          citizenId: resolved.citizenId,
          playerName: resolved.playerName,
          characterName: characterName || resolved.playerName,
          gradeLevel: parsedGang?.grade?.level ?? null,
          gradeName: parsedGang?.grade?.name ?? null,
          isBoss: parsedGang?.isboss ?? false,
          bankAuth: parsedGang?.bankAuth ?? false,
        },
        stats: {
          memberCount,
          rankCount: grades.length,
          bossCount,
          salaryRange: {
            min: minPayment,
            max: maxPayment,
          },
        },
        grades: grades.map((grade) => ({
          id: grade.id,
          level: grade.grade,
          name: grade.name,
          salary: grade.payment,
          isBoss: grade.isboss,
          bankAuth: grade.bankauth,
          totalMembers: gradeCountMap.get(grade.grade) ?? 0,
        })),
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Team info fetch error:", error);
    return apiFromLegacy({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authz = await requireAccountId(request);
    if (!authz.ok) {
      return authz.response;
    }
    const accountId = authz.accountId;

    const resolved = await resolveCitizenIdForAccount(accountId);
    if (!resolved?.citizenId) {
      return apiFromLegacy(
        { error: "No linked character was found for this account." },
        { status: 400 },
      );
    }

    const rawBody = await request.json().catch(() => null);
    const parsedBody = createTeamSchema.safeParse(rawBody);
    if (!parsedBody.success) {
      return apiFromLegacy(
        { error: parsedBody.error.issues[0]?.message ?? "Invalid payload." },
        { status: 400 },
      );
    }

    const gangLabel = parsedBody.data.gangName.trim();
    const gangName = parsedBody.data.gangShortName.trim().toLowerCase();

    const player = await prisma.players.findUnique({
      where: { citizenid: resolved.citizenId },
      select: { gang: true },
    });

    const parsedGang = parseJson<ParsedGang | null>(player?.gang, null);
    const currentGangName = parsedGang?.name?.toLowerCase();
    if (currentGangName && currentGangName !== "none") {
      return apiFromLegacy(
        { error: "You are already assigned to a team." },
        { status: 400 },
      );
    }

    const existingGang = await prisma.tl_gangs.findUnique({
      where: { name: gangName },
      select: { id: true },
    });
    if (existingGang) {
      return apiFromLegacy(
        { error: `Gang "${gangName}" already exists.` },
        { status: 409 },
      );
    }

    const bossGrade = defaultGangGrades.find((grade) => grade.isboss);
    if (!bossGrade) {
      return apiFromLegacy(
        { error: "Gang default grade configuration is invalid." },
        { status: 500 },
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.tl_gangs.create({
        data: {
          name: gangName,
          label: gangLabel,
          off_duty_pay: false,
        },
      });

      await tx.tl_gang_grades.createMany({
        data: defaultGangGrades.map((grade) => ({
          gang_name: gangName,
          grade: grade.grade,
          name: grade.name,
          payment: grade.payment,
          isboss: grade.isboss,
          bankauth: grade.bankauth,
        })),
      });

      await tx.$executeRaw`
        INSERT INTO player_groups (citizenid, type, \`group\`, grade)
        VALUES (${resolved.citizenId}, ${"gang"}, ${gangName}, ${bossGrade.grade})
        ON DUPLICATE KEY UPDATE grade = ${bossGrade.grade}
      `;

      const payload = buildGangPayload(
        gangName,
        gangLabel,
        bossGrade.grade,
        bossGrade.name,
        bossGrade.isboss,
        bossGrade.bankauth,
      );

      await tx.players.update({
        where: { citizenid: resolved.citizenId },
        data: { gang: JSON.stringify(payload) },
      });
    });

    return apiFromLegacy(
      {
        message: "Team created successfully.",
        team: {
          code: gangName,
          name: gangLabel,
          initials: formatInitials(gangLabel),
          offDutyPay: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error("Team create error:", error);
    return apiFromLegacy({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const context = await getBossGangContext(request);
    if ("error" in context) {
      return apiFromLegacy({ error: context.error }, { status: context.status });
    }

    const rawBody = await request.json().catch(() => null);
    const parsedBody = updateTeamNameSchema.safeParse(rawBody);
    if (!parsedBody.success) {
      return apiFromLegacy(
        { error: parsedBody.error.issues[0]?.message ?? "Invalid payload." },
        { status: 400 },
      );
    }

    const team = await prisma.tl_gangs.findUnique({
      where: { name: context.gangName },
      select: { name: true, label: true, off_duty_pay: true, created_at: true, updated_at: true },
    });

    if (!team) {
      return apiFromLegacy({ error: "Team not found." }, { status: 404 });
    }

    const nextName = parsedBody.data.name.trim();
    if (team.label === nextName) {
      return apiFromLegacy(
        {
          message: "Team name is unchanged.",
          team: {
            code: team.name,
            name: team.label,
            initials: formatInitials(team.label || team.name),
            offDutyPay: team.off_duty_pay,
            createdAt: team.created_at,
            updatedAt: team.updated_at,
          },
        },
        { status: 200 },
      );
    }

    const memberRows = await prisma.player_groups.findMany({
      where: {
        type: "gang",
        group: context.gangName,
      },
      select: { citizenid: true },
    });

    const memberIds = memberRows.map((member) => member.citizenid);

    const updatedTeam = await prisma.$transaction(async (tx) => {
      const updated = await tx.tl_gangs.update({
        where: { name: context.gangName },
        data: { label: nextName },
      });

      if (memberIds.length > 0) {
        const memberPlayers = await tx.players.findMany({
          where: { citizenid: { in: memberIds } },
          select: { citizenid: true, gang: true },
        });

        await Promise.all(
          memberPlayers.map(async (member) => {
            const memberGang = parseJson<ParsedGang | null>(member.gang, null);
            if (memberGang?.name?.toLowerCase() !== context.gangName) {
              return;
            }

            const payload = {
              ...memberGang,
              label: nextName,
            };

            await tx.players.update({
              where: { citizenid: member.citizenid },
              data: { gang: JSON.stringify(payload) },
            });
          }),
        );
      }

      return updated;
    });

    return apiFromLegacy(
      {
        message: "Team name updated successfully.",
        team: {
          code: updatedTeam.name,
          name: updatedTeam.label,
          initials: formatInitials(updatedTeam.label || updatedTeam.name),
          offDutyPay: updatedTeam.off_duty_pay,
          createdAt: updatedTeam.created_at,
          updatedAt: updatedTeam.updated_at,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Team update error:", error);
    return apiFromLegacy({ error: "Internal server error" }, { status: 500 });
  }
}

export function PATCH() {
  return apiMethodNotAllowed();
}

export async function DELETE(request: Request) {
  try {
    const context = await getBossGangContext(request);
    if ("error" in context) {
      return apiFromLegacy({ error: context.error }, { status: context.status });
    }

    const [team, noneGang, noneGrade] = await Promise.all([
      prisma.tl_gangs.findUnique({
        where: { name: context.gangName },
        select: { name: true },
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

    if (!team) {
      return apiFromLegacy({ error: "Team not found." }, { status: 404 });
    }

    const nonePayload = buildGangPayload(
      "none",
      noneGang?.label ?? "No Gang",
      0,
      noneGrade?.name ?? "Civilian",
      false,
      false,
    );

    await prisma.$transaction(async (tx) => {
      const memberRows = await tx.player_groups.findMany({
        where: {
          type: "gang",
          group: context.gangName,
        },
        select: { citizenid: true },
      });
      const memberIds = memberRows.map((member) => member.citizenid);

      await tx.player_groups.deleteMany({
        where: {
          type: "gang",
          group: context.gangName,
        },
      });

      if (memberIds.length > 0) {
        await tx.players.updateMany({
          where: {
            OR: [
              { citizenid: { in: memberIds } },
              { gang: { contains: `"name":"${context.gangName}"` } },
            ],
          },
          data: { gang: JSON.stringify(nonePayload) },
        });
      } else {
        await tx.players.updateMany({
          where: {
            gang: { contains: `"name":"${context.gangName}"` },
          },
          data: { gang: JSON.stringify(nonePayload) },
        });
      }

      await tx.tl_gangs.delete({
        where: { name: context.gangName },
      });
    });

    return apiFromLegacy({ message: "Team deleted successfully." }, { status: 200 });
  } catch (error) {
    logger.error("Team delete error:", error);
    return apiFromLegacy({ error: "Internal server error" }, { status: 500 });
  }
}

export function OPTIONS() {
  return apiMethodNotAllowed();
}

export function HEAD() {
  return apiMethodNotAllowed();
}
