import { requireAdminSession } from "@/services/api-guards";
import { apiFromLegacy, apiMethodNotAllowed } from "@/services/api-response";
import { logger } from "@/services/logger";
import { adminInvestmentRepository } from "@/services/repositories/admin-investment.repository";

const formatCategoryLabel = (category: string) =>
  category
    .split("_")
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
    .join(" ");

export async function GET() {
  try {
    const admin = await requireAdminSession();
    if (!admin.ok) {
      return admin.response;
    }

    const groupedCategories = await adminInvestmentRepository.listCategories();

    const categories = groupedCategories.map((entry) => ({
      key: entry.category,
      label: formatCategoryLabel(entry.category),
      count: Number(entry.total),
    }));

    return apiFromLegacy(
      {
        categories,
        totalBusinesses: categories.reduce((sum, category) => sum + category.count, 0),
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Admin investment categories fetch error:", error);
    return apiFromLegacy(
      { error: "Internal server error" },
      { status: 500 },
    );
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
