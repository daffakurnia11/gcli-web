import { NextResponse } from "next/server";

import { getAccountIdFromRequest } from "@/lib/apiAuth";
import { prisma } from "@/lib/prisma";
import { resolveCitizenIdForAccount } from "@/lib/userCitizenId";

type KillLogType = "kill" | "dead";

const parseType = (value: string | null): KillLogType => {
  return value === "dead" ? "dead" : "kill";
};

export async function GET(request: Request) {
  try {
    const accountId = await getAccountIdFromRequest(request);
    if (!accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const type = parseType(url.searchParams.get("type"));
    const resolved = await resolveCitizenIdForAccount(accountId);

    if (!resolved?.citizenId) {
      return NextResponse.json(
        {
          type,
          citizenId: null,
          playerName: null,
          records: [],
          message: "No linked player record found for this account.",
        },
        { status: 200 },
      );
    }

    const where =
      type === "kill"
        ? { killer_citizenid: resolved.citizenId }
        : { victim_citizenid: resolved.citizenId };

    const logs = await prisma.tl_kill_logs.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: 100,
      select: {
        id: true,
        killer_citizenid: true,
        killer_name: true,
        victim_citizenid: true,
        victim_name: true,
        weapon: true,
        created_at: true,
      },
    });

    return NextResponse.json(
      {
        type,
        citizenId: resolved.citizenId,
        playerName: resolved.playerName,
        records: logs.map((log) => ({
          id: log.id,
          killerCitizenId: log.killer_citizenid,
          killerName: log.killer_name,
          victimCitizenId: log.victim_citizenid,
          victimName: log.victim_name,
          weapon: log.weapon,
          createdAt: log.created_at,
        })),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Kill log fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

