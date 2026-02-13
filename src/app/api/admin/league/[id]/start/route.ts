import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/services/api-guards";
import { apiFromLegacy, apiMethodNotAllowed } from "@/services/api-response";
import { logger } from "@/services/logger";

const parseLeagueId = async (
  params: Promise<{ id: string }>,
): Promise<number | null> => {
  const id = Number.parseInt((await params).id, 10);
  if (!Number.isInteger(id) || id < 1) {
    return null;
  }
  return id;
};

const shuffleInPlace = <T>(items: T[]) => {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const buildScheduledAt = (baseDate: Date, index: number) => {
  // One scheduling window per "day": 18:00, 20:00, 22:00, 00:00 (next calendar day)
  // Each slot is 2 hours, so window effectively runs until 02:00.
  const slotsPerWindow = 4;
  const windowIndex = Math.floor(index / slotsPerWindow);
  const slotIndex = index % slotsPerWindow;
  const sessionDate = addDays(baseDate, windowIndex);

  if (slotIndex === 3) {
    const midnightSlot = addDays(sessionDate, 1);
    midnightSlot.setHours(0, 0, 0, 0);
    return midnightSlot;
  }

  const slotHour = 18 + slotIndex * 2; // 18, 20, 22
  const slotDate = new Date(sessionDate);
  slotDate.setHours(slotHour, 0, 0, 0);
  return slotDate;
};

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdminSession();
    if (!admin.ok) {
      return admin.response;
    }

    const leagueId = await parseLeagueId(params);
    if (!leagueId) {
      return apiFromLegacy({ error: "Invalid league id." }, { status: 400 });
    }

    const league = await prisma.leagues.findUnique({
      where: { id: leagueId },
      select: { id: true, status: true },
    });

    if (!league) {
      return apiFromLegacy({ error: "League not found." }, { status: 404 });
    }

    if (league.status !== "upcoming") {
      return apiFromLegacy(
        { error: "Only upcoming league can be started." },
        { status: 409 },
      );
    }

    const teams = await prisma.league_teams.findMany({
      where: {
        league_id: leagueId,
        status: "active",
      },
      select: { id: true },
      orderBy: { id: "asc" },
    });

    if (teams.length < 2) {
      return apiFromLegacy(
        { error: "At least 2 active teams are required to start league." },
        { status: 400 },
      );
    }

    const existingMatchCount = await prisma.league_matches.count({
      where: { league_id: leagueId },
    });
    if (existingMatchCount > 0) {
      return apiFromLegacy(
        { error: "League already has generated matches." },
        { status: 409 },
      );
    }

    const matches: Prisma.league_matchesCreateManyInput[] = [];
    const teamIds = teams.map((team) => team.id);
    let round = 1;
    for (let i = 0; i < teamIds.length; i += 1) {
      for (let j = i + 1; j < teamIds.length; j += 1) {
        const a = teamIds[i];
        const b = teamIds[j];
        matches.push({
          league_id: leagueId,
          home_team_id: a,
          away_team_id: b,
          round,
          stage: "regular",
          status: "scheduled",
        });
        round += 1;
        matches.push({
          league_id: leagueId,
          home_team_id: b,
          away_team_id: a,
          round,
          stage: "regular",
          status: "scheduled",
        });
        round += 1;
      }
    }

    shuffleInPlace(matches);
    matches.forEach((item, index) => {
      item.round = index + 1;
    });

    const firstMatchBaseDate = addDays(new Date(), 1);
    firstMatchBaseDate.setHours(18, 0, 0, 0);
    matches.forEach((item, index) => {
      item.scheduled_at = buildScheduledAt(firstMatchBaseDate, index);
    });

    const startedAt = new Date();
    await prisma.$transaction([
      prisma.league_matches.createMany({
        data: matches,
      }),
      prisma.leagues.update({
        where: { id: leagueId },
        data: {
          status: "active",
          start_at: startedAt,
        },
      }),
    ]);

    return apiFromLegacy(
      {
        message: "League started successfully.",
        leagueId,
        status: "active",
        startAt: startedAt.toISOString(),
        totalTeams: teamIds.length,
        totalMatches: matches.length,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Admin league start error:", error);
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
