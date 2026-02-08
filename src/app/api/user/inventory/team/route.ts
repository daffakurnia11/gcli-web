import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { resolveCitizenIdForAccount } from "@/lib/userCitizenId";
import { requireAccountId } from "@/services/api-guards";
import { apiFromLegacy, apiMethodNotAllowed } from "@/services/api-response";
import { parseJson } from "@/services/json";
import { logger } from "@/services/logger";

type ParsedGang = {
  name?: string;
  label?: string;
};

type TeamInventoryRow = {
  data: string | null;
};

const ASSETS_BASE_URL = (
  process.env.FIVEM_ASSETS_URL || "http://assets.gclindonesia.com:8080"
).replace(/\/+$/, "");

function withImageUrl(item: InventoryItem): InventoryItem {
  return {
    ...item,
    imageUrl: `${ASSETS_BASE_URL}/items/${encodeURIComponent(item.name)}.png`,
  };
}

export async function GET(request: Request) {
  try {
    const authz = await requireAccountId(request);
    if (!authz.ok) {
      return authz.response;
    }

    const resolved = await resolveCitizenIdForAccount(authz.accountId);
    if (!resolved?.citizenId) {
      return apiFromLegacy(
        { team: null, inventory: [], message: "No linked character was found for this account." },
        { status: 200 },
      );
    }

    const player = await prisma.players.findUnique({
      where: { citizenid: resolved.citizenId },
      select: { gang: true },
    });

    const parsedGang = parseJson<ParsedGang | null>(player?.gang, null);
    const gangName = parsedGang?.name?.toLowerCase();

    if (!gangName || gangName === "none") {
      return apiFromLegacy(
        { team: null, inventory: [], message: "You are not currently assigned to a team." },
        { status: 200 },
      );
    }

    const rows = await prisma.$queryRaw<TeamInventoryRow[]>(
      Prisma.sql`
        SELECT data
        FROM ox_inventory
        WHERE owner = ${gangName}
          AND name = ${gangName}
        LIMIT 1
      `,
    );

    const inventoryRaw = parseJson<unknown[]>(rows[0]?.data ?? null, []);
    const inventory = inventoryRaw
      .filter((item): item is InventoryItem => {
        if (!item || typeof item !== "object") return false;
        const candidate = item as Partial<InventoryItem>;
        return (
          typeof candidate.slot === "number" &&
          typeof candidate.name === "string" &&
          typeof candidate.count === "number"
        );
      })
      .map(withImageUrl);

    return apiFromLegacy(
      {
        team: {
          name: gangName,
          label: parsedGang?.label || gangName,
        },
        inventory,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Team inventory fetch error:", error);
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
