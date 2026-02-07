import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type CategoryRow = {
  category: string;
  total: bigint | number;
};

const formatCategoryLabel = (category: string) =>
  category
    .split("_")
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
    .join(" ");

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.optin !== true) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const groupedCategories = await prisma.$queryRaw<CategoryRow[]>`
      SELECT category, COUNT(*) AS total
      FROM tl_businesses
      GROUP BY category
      ORDER BY category ASC
    `;

    const categories = groupedCategories.map((entry) => ({
      key: entry.category,
      label: formatCategoryLabel(entry.category),
      count: Number(entry.total),
    }));

    return NextResponse.json(
      {
        categories,
        totalBusinesses: categories.reduce((sum, category) => sum + category.count, 0),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin investment categories fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
