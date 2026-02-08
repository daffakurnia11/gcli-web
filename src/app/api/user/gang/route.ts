import { prisma } from "@/lib/prisma";
import { resolveCitizenIdForAccount } from "@/lib/userCitizenId";
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
