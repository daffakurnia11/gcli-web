import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TOTAL_TEAMS = 19;

const parseArgs = () => {
  const args = process.argv.slice(2);
  let leagueId = null;
  let dryRun = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }

    if (arg.startsWith("--league-id=")) {
      const parsed = Number.parseInt(arg.split("=")[1] ?? "", 10);
      if (Number.isInteger(parsed) && parsed > 0) {
        leagueId = parsed;
      }
      continue;
    }

    if (arg === "--league-id") {
      const next = args[index + 1] ?? "";
      const parsed = Number.parseInt(next, 10);
      if (Number.isInteger(parsed) && parsed > 0) {
        leagueId = parsed;
      }
      index += 1;
    }
  }

  return { leagueId, dryRun };
};

const toFallbackTeam = (index) => {
  const padded = String(index + 1).padStart(2, "0");
  return {
    code: `seedteam${padded}`,
    name: `Seed Team ${padded}`,
  };
};

const pickTargetLeagueId = async (leagueIdFromArg) => {
  if (leagueIdFromArg) {
    const league = await prisma.leagues.findUnique({
      where: { id: leagueIdFromArg },
      select: { id: true, name: true },
    });
    if (!league) {
      throw new Error(`League id ${leagueIdFromArg} was not found.`);
    }
    return league.id;
  }

  const fallbackLeague = await prisma.leagues.findFirst({
    orderBy: [{ created_at: "desc" }, { id: "desc" }],
    select: { id: true, name: true },
  });

  if (!fallbackLeague) {
    throw new Error("No league found. Create at least one league first.");
  }

  return fallbackLeague.id;
};

const buildTeams = async () => {
  const gangs = await prisma.tl_gangs.findMany({
    orderBy: [{ name: "asc" }],
    select: {
      name: true,
      label: true,
    },
  });

  const teams = [];
  const seenCodes = new Set();

  for (const gang of gangs) {
    const code = (gang.name ?? "").trim().toLowerCase();
    const name = (gang.label ?? "").trim() || code.toUpperCase();
    if (!code || seenCodes.has(code)) {
      continue;
    }
    teams.push({ code, name });
    seenCodes.add(code);
    if (teams.length === TOTAL_TEAMS) {
      break;
    }
  }

  for (let index = teams.length; index < TOTAL_TEAMS; index += 1) {
    const fallback = toFallbackTeam(index);
    if (seenCodes.has(fallback.code)) {
      continue;
    }
    teams.push(fallback);
    seenCodes.add(fallback.code);
  }

  return teams.slice(0, TOTAL_TEAMS);
};

const seedLeagueTeams = async ({ leagueId, dryRun }) => {
  const teams = await buildTeams();

  let created = 0;
  let updated = 0;

  for (let index = 0; index < teams.length; index += 1) {
    const team = teams[index];
    const joinedAt = new Date(Date.now() - index * 60_000);

    const existing = await prisma.league_teams.findFirst({
      where: {
        league_id: leagueId,
        code: team.code,
      },
      select: { id: true },
    });

    if (dryRun) {
      if (existing) {
        updated += 1;
      } else {
        created += 1;
      }
      continue;
    }

    if (existing) {
      await prisma.league_teams.update({
        where: { id: existing.id },
        data: {
          name: team.name,
          status: "active",
          joined_at: joinedAt,
        },
      });
      updated += 1;
      continue;
    }

    await prisma.league_teams.create({
      data: {
        league_id: leagueId,
        code: team.code,
        name: team.name,
        status: "active",
        joined_at: joinedAt,
      },
    });
    created += 1;
  }

  return {
    targetLeagueId: leagueId,
    total: teams.length,
    created,
    updated,
  };
};

const main = async () => {
  const { leagueId: leagueIdArg, dryRun } = parseArgs();
  const leagueId = await pickTargetLeagueId(leagueIdArg);

  console.warn(
    `[league-team-seeder] Start (${dryRun ? "dry-run" : "apply"}) league_id=${leagueId}`,
  );

  const result = await seedLeagueTeams({ leagueId, dryRun });

  console.warn(
    `[league-team-seeder] Done. total=${result.total}, created=${result.created}, updated=${result.updated}, league_id=${result.targetLeagueId}`,
  );
};

main()
  .catch((error) => {
    console.error("[league-team-seeder] Failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
