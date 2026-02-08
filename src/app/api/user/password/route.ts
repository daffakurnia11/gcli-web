import bcrypt from "bcrypt";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireAccountId } from "@/services/api-guards";
import {
  apiFromLegacy,
  apiMethodNotAllowed,
  apiUnprocessable,
} from "@/services/api-response";
import { logger } from "@/services/logger";
import { checkRateLimit } from "@/services/rate-limit";

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function PUT(request: Request) {
  try {
    const rateLimited = await checkRateLimit(request, {
      keyPrefix: "api:user-password",
      limit: 20,
      windowMs: 60_000,
    });
    if (rateLimited) {
      return rateLimited;
    }

    const authz = await requireAccountId(request);
    if (!authz.ok) {
      return authz.response;
    }
    const accountId = authz.accountId;

    const body = await request.json();
    const parsed = updatePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return apiUnprocessable("Invalid password payload", parsed.error.flatten());
    }
    const { currentPassword, newPassword } = parsed.data;

    // Get current account with password
    const account = await prisma.web_accounts.findUnique({
      where: { id: accountId },
      select: { password: true },
    });

    if (!account?.password) {
      return apiFromLegacy(
        { error: "Password not set for account" },
        { status: 400 },
      );
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, account.password);
    if (!isValid) {
      return apiFromLegacy(
        { error: "Incorrect password" },
        { status: 401 },
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.web_accounts.update({
      where: { id: accountId },
      data: { password: hashedPassword },
    });

    return apiFromLegacy(
      { message: "Password updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Password update error:", error);
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
