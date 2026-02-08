import { z } from "zod";

import { requireAdminSession } from "@/services/api-guards";
import {
  apiFromLegacy,
  apiMethodNotAllowed,
  apiUnprocessable,
} from "@/services/api-response";
import { logger } from "@/services/logger";
import { adminInvestmentRepository } from "@/services/repositories/admin-investment.repository";

const assignBodySchema = z.object({
  bankAccountId: z.string().min(1),
  gangCode: z.string().min(1),
});

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdminSession();
    if (!admin.ok) {
      return admin.response;
    }

    const raw = await request.json();
    const parsed = assignBodySchema.safeParse(raw);
    if (!parsed.success) {
      return apiUnprocessable("Invalid assign payload", parsed.error.flatten());
    }

    const bankAccountId = parsed.data.bankAccountId.trim();
    const gangCode = parsed.data.gangCode.trim();
    const isUnassign = gangCode === "none";

    if (!isUnassign) {
      const gang = await adminInvestmentRepository.findGangByCode(gangCode);

      if (!gang) {
        return apiFromLegacy({ error: "Invalid gang code" }, { status: 400 });
      }
    }

    const account = await adminInvestmentRepository.findBankAccount(bankAccountId);

    if (!account) {
      return apiFromLegacy({ error: "Bank account not found" }, { status: 404 });
    }

    await adminInvestmentRepository.assignBusiness(bankAccountId, gangCode, isUnassign);

    return apiFromLegacy(
      {
        message: isUnassign
          ? "Business unassigned successfully"
          : "Business assigned successfully",
        bankAccountId,
        gangCode: isUnassign ? null : gangCode,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Admin investment assign error:", error);
    return apiFromLegacy({ error: "Internal server error" }, { status: 500 });
  }
}

// AUTO_METHOD_NOT_ALLOWED
export function GET() {
  return apiMethodNotAllowed();
}

export function POST() {
  return apiMethodNotAllowed();
}

export function PUT() {
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
