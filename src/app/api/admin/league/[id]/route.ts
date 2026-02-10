import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { leagueUpdateSchema } from "@/schemas/league";
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

const mapCreatorUsername = async (creator: string) => {
  const userId = Number.parseInt(creator, 10);
  if (!Number.isInteger(userId) || userId < 1) {
    return creator;
  }

  const user = await prisma.users.findUnique({
    where: { userId },
    select: { username: true },
  });

  return user?.username ?? creator;
};

export async function GET(
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
    });

    if (!league) {
      return apiFromLegacy({ error: "League not found." }, { status: 404 });
    }

    const [teamCount, matchCount] = await Promise.all([
      prisma.league_teams.count({ where: { league_id: league.id } }),
      prisma.league_matches.count({ where: { league_id: league.id } }),
    ]);

    const creatorUsername = await mapCreatorUsername(league.creator);

    return apiFromLegacy(
      {
        item: {
          id: league.id,
          name: league.name,
          status: league.status,
          startAt: league.start_at?.toISOString() ?? null,
          endAt: league.end_at?.toISOString() ?? null,
          creator: league.creator,
          creatorUsername,
          price: league.price,
          maxTeam: league.max_team,
          totalTeams: teamCount,
          totalMatches: matchCount,
          rulesJson: league.rules_json,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Admin league detail fetch error:", error);
    return apiFromLegacy({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
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

    const rawBody = await request.json().catch(() => null);
    const parsed = leagueUpdateSchema.safeParse(rawBody);

    if (!parsed.success) {
      return apiFromLegacy(
        { error: parsed.error.issues[0]?.message ?? "Invalid payload." },
        { status: 400 },
      );
    }

    const existingLeague = await prisma.leagues.findUnique({
      where: { id: leagueId },
      select: { start_at: true, end_at: true },
    });

    if (!existingLeague) {
      return apiFromLegacy({ error: "League not found." }, { status: 404 });
    }

    const payload = parsed.data;
    const startAt = payload.startAt !== undefined
      ? (payload.startAt ? new Date(payload.startAt) : null)
      : existingLeague.start_at;
    const endAt = payload.endAt !== undefined
      ? (payload.endAt ? new Date(payload.endAt) : null)
      : existingLeague.end_at;

    if (startAt && endAt && endAt < startAt) {
      return apiFromLegacy(
        { error: "endAt must be greater than or equal to startAt." },
        { status: 400 },
      );
    }

    const updateData: Prisma.leaguesUpdateInput = {
      ...(payload.name !== undefined ? { name: payload.name } : {}),
      ...(payload.status !== undefined ? { status: payload.status } : {}),
      ...(payload.price !== undefined ? { price: payload.price } : {}),
      ...(payload.maxTeam !== undefined ? { max_team: payload.maxTeam } : {}),
      ...(payload.startAt !== undefined ? { start_at: startAt } : {}),
      ...(payload.endAt !== undefined ? { end_at: endAt } : {}),
      ...(payload.rulesJson !== undefined
        ? {
            rules_json:
              payload.rulesJson === null
                ? Prisma.DbNull
                : (payload.rulesJson as Prisma.InputJsonValue),
          }
        : {}),
    };

    const updated = await prisma.leagues.update({
      where: { id: leagueId },
      data: updateData,
    });

    const [teamCount, matchCount] = await Promise.all([
      prisma.league_teams.count({ where: { league_id: updated.id } }),
      prisma.league_matches.count({ where: { league_id: updated.id } }),
    ]);

    const creatorUsername = await mapCreatorUsername(updated.creator);

    return apiFromLegacy(
      {
        item: {
          id: updated.id,
          name: updated.name,
          status: updated.status,
          startAt: updated.start_at?.toISOString() ?? null,
          endAt: updated.end_at?.toISOString() ?? null,
          creator: updated.creator,
          creatorUsername,
          price: updated.price,
          maxTeam: updated.max_team,
          totalTeams: teamCount,
          totalMatches: matchCount,
          rulesJson: updated.rules_json,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Admin league update error:", error);
    return apiFromLegacy({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
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

    const existing = await prisma.leagues.findUnique({
      where: { id: leagueId },
      select: { id: true },
    });

    if (!existing) {
      return apiFromLegacy({ error: "League not found." }, { status: 404 });
    }

    await prisma.leagues.delete({ where: { id: leagueId } });

    return apiFromLegacy({ message: "League deleted successfully." }, { status: 200 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return apiFromLegacy(
        { error: "Cannot delete league due to related records." },
        { status: 409 },
      );
    }
    logger.error("Admin league delete error:", error);
    return apiFromLegacy({ error: "Internal server error" }, { status: 500 });
  }
}

// AUTO_METHOD_NOT_ALLOWED
export function POST() {
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
