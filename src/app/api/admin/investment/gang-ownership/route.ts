import { requireAdminSession } from "@/services/api-guards";
import { apiFromLegacy, apiMethodNotAllowed } from "@/services/api-response";
import { logger } from "@/services/logger";
import { adminInvestmentRepository } from "@/services/repositories/admin-investment.repository";

export async function GET() {
  try {
    const admin = await requireAdminSession();
    if (!admin.ok) {
      return admin.response;
    }

    const rows = await adminInvestmentRepository.listGangOwnership();

    const gangs = rows.map((row) => ({
      gangCode: row.gangCode,
      gangLabel: row.gangLabel,
      ownershipCount: Number(row.ownershipCount),
    }));

    return apiFromLegacy({ gangs }, { status: 200 });
  } catch (error) {
    logger.error("Admin gang ownership fetch error:", error);
    return apiFromLegacy({ error: "Internal server error" }, { status: 500 });
  }
}

// AUTO_METHOD_NOT_ALLOWED
export function POST() {
  return apiMethodNotAllowed();
}

export function PUT() {
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
