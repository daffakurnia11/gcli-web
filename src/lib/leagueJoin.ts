import { prisma } from "@/lib/prisma";

const LEAGUE_INVOICE_REGEX = /^LEAGUE-(\d+)-(.+)-(\d+)$/i;

export const isLeagueJoinPaidStatus = (status: string | null | undefined) => {
  if (!status) {
    return false;
  }

  const normalized = status.trim().toUpperCase();
  return normalized === "SUCCESS" || normalized === "PAID";
};

export const parseLeagueJoinInvoice = (invoiceNumber: string) => {
  const match = LEAGUE_INVOICE_REGEX.exec(invoiceNumber.trim());
  if (!match) {
    return null;
  }

  const leagueId = Number.parseInt(match[1], 10);
  const gangCode = match[2]?.trim().toLowerCase();
  if (!Number.isInteger(leagueId) || leagueId < 1 || !gangCode) {
    return null;
  }

  return { leagueId, gangCode };
};

export const insertLeagueTeamFromInvoice = async (invoiceNumber: string) => {
  const parsed = parseLeagueJoinInvoice(invoiceNumber);
  if (!parsed) {
    return { ok: false as const, reason: "invalid_invoice" };
  }

  const [league, gang] = await Promise.all([
    prisma.leagues.findUnique({
      where: { id: parsed.leagueId },
      select: { id: true },
    }),
    prisma.tl_gangs.findUnique({
      where: { name: parsed.gangCode },
      select: { label: true },
    }),
  ]);

  if (!league) {
    return { ok: false as const, reason: "league_not_found" };
  }

  const existingEntry = await prisma.league_teams.findFirst({
    where: {
      league_id: parsed.leagueId,
      code: parsed.gangCode,
    },
    select: { id: true },
  });

  if (existingEntry) {
    return { ok: true as const, inserted: false as const };
  }

  await prisma.league_teams.create({
    data: {
      league_id: parsed.leagueId,
      code: parsed.gangCode,
      name: gang?.label?.trim() || parsed.gangCode.toUpperCase(),
      status: "active",
      joined_at: new Date(),
    },
  });

  return { ok: true as const, inserted: true as const };
};

const readFromObjectPath = (value: unknown, path: string[]) => {
  let current: unknown = value;

  for (const key of path) {
    if (!current || typeof current !== "object" || !(key in current)) {
      return null;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return typeof current === "string" ? current : null;
};

export const extractPaymentStatus = (payload: unknown) => {
  const candidates = [
    readFromObjectPath(payload, ["transaction", "status"]),
    readFromObjectPath(payload, ["status"]),
    readFromObjectPath(payload, ["order", "status"]),
    readFromObjectPath(payload, ["payment", "status"]),
    readFromObjectPath(payload, ["data", "transaction", "status"]),
    readFromObjectPath(payload, ["data", "status"]),
  ];

  for (const value of candidates) {
    if (value && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
};
