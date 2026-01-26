import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = Number.parseInt(session.user.id, 10);
    if (Number.isNaN(accountId)) {
      return NextResponse.json(
        { error: "Invalid account ID" },
        { status: 400 },
      );
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
