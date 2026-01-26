import { cookies } from "next/headers";
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

    // Get current session token
    const cookieStore = await cookies();
    const currentSessionToken =
      cookieStore.get("next-auth.session-token")?.value ||
      cookieStore.get("__Secure-next-auth.session-token")?.value;

    // Delete all sessions except current
    await prisma.web_sessions.deleteMany({
      where: {
        user_id: accountId,
        NOT: {
          session_token: currentSessionToken || "",
        },
      },
    });

    return NextResponse.json(
      { message: "All other sessions revoked successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Revoke all sessions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
