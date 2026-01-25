import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = Number.parseInt(session.user.id, 10);
    if (Number.isNaN(accountId)) {
      return NextResponse.json({ error: "Invalid account ID" }, { status: 400 });
    }

    const body = await request.json();
    const { realName, fivemName } = body as {
      realName?: string;
      fivemName?: string;
    };

    // Check if profile exists, if not create it
    const existingProfile = await prisma.web_profiles.findUnique({
      where: { account_id: accountId },
    });

    if (existingProfile) {
      // Update existing profile
      await prisma.web_profiles.update({
        where: { account_id: accountId },
        data: {
          ...(realName !== undefined && { real_name: realName }),
          ...(fivemName !== undefined && { fivem_name: fivemName }),
        },
      });
    } else {
      // Create new profile
      await prisma.web_profiles.create({
        data: {
          account_id: accountId,
          real_name: realName || null,
          fivem_name: fivemName || null,
        },
      });
    }

    return NextResponse.json(
      { message: "Profile updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
