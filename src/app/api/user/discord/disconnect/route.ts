import { NextResponse } from "next/server";

import { getAccountIdFromRequest } from "@/lib/apiAuth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const accountId = await getAccountIdFromRequest(request);
    if (!accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete the Discord account linkage
    await prisma.web_discord_accounts.deleteMany({
      where: { account_id: accountId },
    });

    // Clear the discord_id from web_accounts
    await prisma.web_accounts.update({
      where: { id: accountId },
      data: { discord_id: null },
    });

    return NextResponse.json(
      { message: "Discord account disconnected successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Discord disconnect error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
