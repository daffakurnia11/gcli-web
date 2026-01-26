import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = Number.parseInt(session.user.id, 10);
    const sessionId = Number.parseInt((await params).id, 10);

    if (Number.isNaN(accountId) || Number.isNaN(sessionId)) {
      return NextResponse.json(
        { error: "Invalid account or session ID" },
        { status: 400 },
      );
    }

    // Verify the session belongs to the user
    const targetSession = await prisma.web_sessions.findFirst({
      where: {
        id: sessionId,
        user_id: accountId,
      },
    });

    if (!targetSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Delete the session
    await prisma.web_sessions.delete({
      where: { id: sessionId },
    });

    return NextResponse.json(
      { message: "Session revoked successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Revoke session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
