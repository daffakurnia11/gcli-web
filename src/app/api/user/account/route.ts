import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
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

    const account = await prisma.web_accounts.findUnique({
      where: { id: accountId },
      select: { user_id: true },
    });

    const userId = account?.user_id ?? null;
    // Delete related records first (due to foreign key constraints)
    const deletes = [
      // Delete Discord account linkage
      prisma.web_discord_accounts.deleteMany({
        where: { account_id: accountId },
      }),
      // Delete profile
      prisma.web_profiles.deleteMany({
        where: { account_id: accountId },
      }),
      // Delete sessions
      prisma.web_sessions.deleteMany({
        where: { user_id: accountId },
      }),
      // Finally delete the account
      prisma.web_accounts.delete({
        where: { id: accountId },
      }),
      ...(userId
        ? [
            prisma.users.delete({
              where: { userId },
            }),
          ]
        : []),
    ];

    await prisma.$transaction(deletes);

    return NextResponse.json(
      { message: "Account deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
