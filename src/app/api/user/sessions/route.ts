import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getAccountIdFromRequest } from "@/lib/apiAuth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const accountId = await getAccountIdFromRequest(request);
    if (!accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current session token
    const cookieStore = await cookies();
    const currentSessionToken =
      cookieStore.get("next-auth.session-token")?.value ||
      cookieStore.get("__Secure-next-auth.session-token")?.value;

    const sessions = await prisma.web_sessions.findMany({
      where: { user_id: accountId },
      select: {
        id: true,
        session_token: true,
        expires: true,
      },
      orderBy: { expires: "desc" },
    });

    // Mark current session
    const sessionsWithCurrent = sessions.map((s) => ({
      ...s,
      isCurrent: s.session_token === currentSessionToken,
      device: "Web Browser",
      browser: "Unknown",
    }));

    return NextResponse.json(sessionsWithCurrent, { status: 200 });
  } catch (error) {
    console.error("Sessions fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
