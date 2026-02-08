import axios from "axios";

import { apiFromLegacy, apiMethodNotAllowed } from "@/services/api-response";
import { logger } from "@/services/logger";

const FIVEM_API_BASE = process.env.FIVEM_API_BASE_URL;
const FIVEM_CONNECT_ADDRESS = process.env.FIVEM_CONNECT_ADDRESS;

export async function GET() {
  try {
    if (!FIVEM_API_BASE) {
      return apiFromLegacy(
        { error: "FiveM API base URL not configured" },
        { status: 500 },
      );
    }

    // Fetch both info.json and players.json in parallel
    const [infoResponse, playersResponse] = await Promise.all([
      axios.get<FiveMInfoResponse>(`${FIVEM_API_BASE}/info.json`),
      axios.get<FiveMPlayersResponse>(`${FIVEM_API_BASE}/players.json`),
    ]);

    const infoData = infoResponse.data;
    const playersData = playersResponse.data;

    // Transform the response to the desired format
    const transformedResponse: FiveMProxyData = {
      server: {
        name: infoData.vars?.sv_projectName || null,
        desc: infoData.vars?.sv_projectDesc || null,
        connect_url: FIVEM_CONNECT_ADDRESS || null,
      },
      member: {
        total: parseInt(infoData.vars?.sv_maxClients || "0", 10),
        online: Array.isArray(playersData) ? playersData.length : 0,
      },
    };

    // Return both original FiveM API responses and transformed data
    const proxyResponse: FiveMProxyResponse = {
      status: 200,
      message: "FiveM server info fetched successfully",
      raw: {
        info: infoData,
        players: playersData,
      },
      data: transformedResponse,
    };

    return apiFromLegacy(proxyResponse, { status: 200 });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const data = error.response?.data || {
        error: "FiveM API request failed",
      };

      return apiFromLegacy(data, { status });
    }

    logger.error("FiveM info proxy error:", error);
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
