import { prisma } from "@/lib/prisma";

export type ResolvedCitizen = {
  citizenId: string;
  playerName: string | null;
  license: string | null;
};

export async function resolveCitizenIdForAccount(
  accountId: number,
): Promise<ResolvedCitizen | null> {
  const account = await prisma.web_accounts.findUnique({
    where: { id: accountId },
    select: {
      user: {
        select: {
          license: true,
          license2: true,
        },
      },
    },
  });

  const licenses = [account?.user?.license, account?.user?.license2].filter(
    (value): value is string => Boolean(value && value.trim().length > 0),
  );

  if (licenses.length === 0) {
    return null;
  }

  const player = await prisma.players.findFirst({
    where: {
      license: { in: licenses },
    },
    orderBy: { last_updated: "desc" },
    select: {
      citizenid: true,
      name: true,
      license: true,
    },
  });

  if (!player?.citizenid) {
    return null;
  }

  return {
    citizenId: player.citizenid,
    playerName: player.name ?? null,
    license: player.license ?? null,
  };
}

