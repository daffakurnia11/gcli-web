import { apiFromLegacy, apiMethodNotAllowed } from "@/services/api-response";
import { logger } from "@/services/logger";

const PAYMENT_SERVICE_BASE_URL =
  process.env.PAYMENT_SERVICE_BASE_URL ?? "http://localhost:3001";

const parseResponsePayload = async (response: Response) => {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json().catch(() => null);
  }

  const text = await response.text().catch(() => "");
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text };
  }
};

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null);
    if (!payload || typeof payload !== "object") {
      return apiFromLegacy({ error: "Invalid payload." }, { status: 400 });
    }

    const upstream = await fetch(`${PAYMENT_SERVICE_BASE_URL}/api/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const upstreamPayload = await parseResponsePayload(upstream);

    if (!upstream.ok) {
      return apiFromLegacy(
        {
          error: "Payment gateway request failed.",
          data: upstreamPayload,
        },
        { status: upstream.status || 500 },
      );
    }

    return apiFromLegacy(
      {
        result: upstreamPayload,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Payment checkout proxy error:", error);
    return apiFromLegacy({ error: "Internal server error" }, { status: 500 });
  }
}

// AUTO_METHOD_NOT_ALLOWED
export function GET() {
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
