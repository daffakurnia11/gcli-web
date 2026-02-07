import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.optin !== true) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const gangs = await prisma.tl_gangs.findMany({
      where: {
        name: {
          not: "none",
        },
      },
      select: {
        name: true,
        label: true,
      },
      orderBy: { label: "asc" },
    });

    return NextResponse.json({ gangs }, { status: 200 });
  } catch (error) {
    console.error("Admin gangs fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
