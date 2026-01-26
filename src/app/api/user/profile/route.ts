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
      return NextResponse.json(
        { error: "Invalid account ID" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const {
      realName,
      fivemName,
      gender,
      birthDate,
      provinceId,
      provinceName,
      cityId,
      cityName,
    } = body as {
      realName?: string;
      fivemName?: string;
      gender?: "male" | "female" | null;
      birthDate?: string | null;
      provinceId?: string | null;
      provinceName?: string | null;
      cityId?: string | null;
      cityName?: string | null;
    };

    const parsedBirthDate = birthDate ? new Date(birthDate) : null;
    if (birthDate && Number.isNaN(parsedBirthDate?.getTime())) {
      return NextResponse.json(
        { error: "Invalid birth date" },
        { status: 400 },
      );
    }
    if (gender && gender !== "male" && gender !== "female") {
      return NextResponse.json({ error: "Invalid gender" }, { status: 400 });
    }
    const profileData = {
      ...(realName !== undefined && { real_name: realName }),
      ...(fivemName !== undefined && { fivem_name: fivemName }),
      ...(gender !== undefined && { gender }),
      ...(birthDate !== undefined && { birth_date: parsedBirthDate }),
      ...(provinceId !== undefined && { province_id: provinceId || null }),
      ...(provinceName !== undefined && {
        province_name: provinceName || null,
      }),
      ...(cityId !== undefined && { city_id: cityId || null }),
      ...(cityName !== undefined && { city_name: cityName || null }),
    };

    // Check if profile exists, if not create it
    const existingProfile = await prisma.web_profiles.findUnique({
      where: { account_id: accountId },
    });

    if (existingProfile) {
      // Update existing profile
      await prisma.web_profiles.update({
        where: { account_id: accountId },
        data: profileData,
      });
    } else {
      // Create new profile
      await prisma.web_profiles.create({
        data: {
          account_id: accountId,
          real_name: realName || null,
          fivem_name: fivemName || null,
          gender: gender || null,
          birth_date: parsedBirthDate,
          province_id: provinceId || null,
          province_name: provinceName || null,
          city_id: cityId || null,
          city_name: cityName || null,
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
