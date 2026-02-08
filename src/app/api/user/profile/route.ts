import { prisma } from "@/lib/prisma";
import { requireAccountId } from "@/services/api-guards";
import { apiFromLegacy, apiMethodNotAllowed } from "@/services/api-response";
import { logger } from "@/services/logger";

export async function PUT(request: Request) {
  try {
    const authz = await requireAccountId(request);
    if (!authz.ok) {
      return authz.response;
    }
    const accountId = authz.accountId;

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
      return apiFromLegacy(
        { error: "Invalid birth date" },
        { status: 400 },
      );
    }
    if (gender && gender !== "male" && gender !== "female") {
      return apiFromLegacy({ error: "Invalid gender" }, { status: 400 });
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

    return apiFromLegacy(
      { message: "Profile updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Profile update error:", error);
    return apiFromLegacy(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// AUTO_METHOD_NOT_ALLOWED
export function GET() {
  return apiMethodNotAllowed();
}

export function POST() {
  return apiMethodNotAllowed();
}

export function PATCH() {
  return apiMethodNotAllowed();
}

export function DELETE() {
  return apiMethodNotAllowed();
}

export function OPTIONS() {
  return apiMethodNotAllowed();
}

export function HEAD() {
  return apiMethodNotAllowed();
}
