import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type GangOwnershipRow = {
  gangCode: string;
  gangLabel: string;
  ownershipCount: bigint | number;
};

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.optin !== true) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const rows = await prisma.$queryRaw<GangOwnershipRow[]>`
      SELECT
        g.name AS gangCode,
        g.label AS gangLabel,
        COUNT(tb.id) AS ownershipCount
      FROM tl_gangs g
      LEFT JOIN tl_businesses tb
        ON tb.owner = g.name
       AND tb.is_owned = 1
      WHERE LOWER(g.name) <> 'none'
      GROUP BY g.name, g.label
      ORDER BY ownershipCount DESC, g.label ASC
    `;

    const gangs = rows.map((row) => ({
      gangCode: row.gangCode,
      gangLabel: row.gangLabel,
      ownershipCount: Number(row.ownershipCount),
    }));

    return NextResponse.json({ gangs }, { status: 200 });
  } catch (error) {
    console.error("Admin gang ownership fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
