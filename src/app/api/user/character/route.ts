import { NextResponse } from "next/server";

import { getAccountIdFromRequest } from "@/lib/apiAuth";
import { prisma } from "@/lib/prisma";
import { resolveCitizenIdForAccount } from "@/lib/userCitizenId";

export async function GET(request: Request) {
  try {
    const accountId = await getAccountIdFromRequest(request);
    if (!accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolved = await resolveCitizenIdForAccount(accountId);

    if (!resolved?.citizenId) {
      return NextResponse.json(
        null,
        { status: 400 },
      );
    }

    const player = await prisma.players.findUnique({
      where: { citizenid: resolved.citizenId },
      select: {
        id: true,
        userId: true,
        citizenid: true,
        cid: true,
        license: true,
        name: true,
        money: true,
        charinfo: true,
        job: true,
        gang: true,
        position: true,
        metadata: true,
        inventory: true,
        phone_number: true,
        last_updated: true,
        last_logged_out: true,
      },
    });

    if (!player) {
      return NextResponse.json(
        null,
        { status: 400 },
      );
    }

    // Parse JSON fields
    const money = JSON.parse(player.money as string);
    const charinfo = JSON.parse(player.charinfo as string);
    const job = JSON.parse(player.job as string);
    const gang = player.gang ? JSON.parse(player.gang) : null;
    const position = JSON.parse(player.position as string);
    const metadata = JSON.parse(player.metadata as string);
    const inventory = player.inventory ? JSON.parse(player.inventory) : [];

    return NextResponse.json(
      {
        id: player.id,
        userId: player.userId,
        citizenid: player.citizenid,
        cid: player.cid,
        license: player.license,
        name: player.name,
        money,
        charinfo,
        job,
        gang,
        position,
        metadata,
        inventory,
        phone_number: player.phone_number,
        last_updated: player.last_updated,
        last_logged_out: player.last_logged_out,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Character data fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
