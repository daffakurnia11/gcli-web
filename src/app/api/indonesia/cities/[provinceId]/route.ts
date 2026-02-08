import axios from "axios";

import { apiFromLegacy, apiMethodNotAllowed } from "@/services/api-response";
import { logger } from "@/services/logger";

const INDONESIA_REGIONAL_API =
  process.env.INDONESIA_REGIONAL_API_BASE_URL ||
  "https://api-regional-indonesia.vercel.app";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ provinceId: string }> },
) {
  try {
    const { provinceId } = await params;

    const response = await axios.get(
      `${INDONESIA_REGIONAL_API}/api/cities/${provinceId}`,
    );

    // Return the data directly from the external API
    return apiFromLegacy(response.data, { status: 200 });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const data = error.response?.data || {
        error: "Failed to fetch cities",
      };

      return apiFromLegacy(data, { status });
    }

    logger.error("Cities API error:", error);
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
