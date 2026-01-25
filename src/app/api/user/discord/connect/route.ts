import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = Number.parseInt(session.user.id, 10);
    if (Number.isNaN(accountId)) {
      return NextResponse.json({ error: "Invalid account ID" }, { status: 400 });
    }

    const body = (await request.json()) as {
      id?: string;
      username?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };

    if (!body.id) {
      return NextResponse.json({ error: "Missing Discord ID" }, { status: 400 });
    }

    const discordId = body.id.startsWith("discord:") ? body.id : `discord:${body.id}`;

    await prisma.web_accounts.update({
      where: { id: accountId },
      data: { discord_id: discordId },
    });

    await prisma.web_discord_accounts.upsert({
      where: { account_id: accountId },
      create: {
        account_id: accountId,
        discord_id: discordId,
        username: body.username || "Discord User",
        global_name: body.name ?? null,
        email: body.email ?? null,
        image: body.image ?? null,
      },
      update: {
        discord_id: discordId,
        username: body.username || "Discord User",
        global_name: body.name ?? null,
        email: body.email ?? null,
        image: body.image ?? null,
      },
    });

    return NextResponse.json(
      { message: "Discord account connected successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Discord connect error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
