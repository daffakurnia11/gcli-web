import { NextResponse } from "next/server";

import { getAccountIdFromRequest } from "@/lib/apiAuth";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: Request) {
  try {
    const accountId = await getAccountIdFromRequest(request);
    if (!accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
