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

const updateEmailSchema = z.object({
  newEmail: z.string().email(),
  password: z.string().min(1),
});

export async function PUT(request: Request) {
  try {
    const rateLimited = await checkRateLimit(request, {
      keyPrefix: "api:user-email",
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
    const parsed = updateEmailSchema.safeParse(body);
    if (!parsed.success) {
      return apiUnprocessable("Invalid email payload", parsed.error.flatten());
    }
    const { newEmail, password } = parsed.data;

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

    // Verify password
    const isValid = await bcrypt.compare(password, account.password);
    if (!isValid) {
      return apiFromLegacy(
        { error: "Incorrect password" },
        { status: 401 },
      );
    }

    // Check if new email is already taken
    const existingAccount = await prisma.web_accounts.findUnique({
      where: { email: newEmail },
    });

    if (existingAccount && existingAccount.id !== accountId) {
      return apiFromLegacy(
        { error: "Email already in use" },
        { status: 409 },
      );
    }

    // Update email
    await prisma.web_accounts.update({
      where: { id: accountId },
      data: { email: newEmail, email_verified: false },
    });

    return apiFromLegacy(
      { message: "Email updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Email update error:", error);
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
