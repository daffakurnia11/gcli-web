import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const value = searchParams.get("value")?.trim() ?? "";

  if (!type || !value) {
    return NextResponse.json({ error: "Missing query params" }, { status: 400 });
  }

  if (type !== "username" && type !== "email") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  if (type === "email") {
    const existing = await prisma.web_accounts.findUnique({
      where: { email: value },
      select: { id: true },
    });
    return NextResponse.json({ exists: Boolean(existing) });
  }

  const [userMatch, profileMatch] = await Promise.all([
    prisma.users.findFirst({
      where: { username: value },
      select: { userId: true },
    }),
    prisma.web_profiles.findFirst({
      where: { fivem_name: value },
      select: { id: true },
    }),
  ]);

  return NextResponse.json({ exists: Boolean(userMatch || profileMatch) });
}
