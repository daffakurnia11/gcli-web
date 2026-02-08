import { prisma } from "@/lib/prisma";
import { resolveCitizenIdForAccount } from "@/lib/userCitizenId";
import { requireAccountId } from "@/services/api-guards";
import { apiFromLegacy, apiMethodNotAllowed } from "@/services/api-response";
import { parseJson } from "@/services/json";
import { logger } from "@/services/logger";

const ASSETS_BASE_URL = (
  process.env.FIVEM_ASSETS_URL || "https://assets.gclindonesia.com"
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
    const accountId = authz.accountId;

    const resolved = await resolveCitizenIdForAccount(accountId);

    if (!resolved?.citizenId) {
      return apiFromLegacy(
        null,
        { status: 400 },
      );
    }

    const player = await prisma.players.findUnique({
      where: { citizenid: resolved.citizenId },
      select: {
        id: true,
        userId: true,
        citizenid: true,
        cid: true,
        license: true,
        name: true,
        money: true,
        charinfo: true,
        job: true,
        gang: true,
        position: true,
        metadata: true,
        inventory: true,
        phone_number: true,
        last_updated: true,
        last_logged_out: true,
      },
    });

    if (!player) {
      return apiFromLegacy(
        null,
        { status: 400 },
      );
    }

    // Parse JSON fields
    const money = parseJson(player.money, {});
    const charinfo = parseJson(player.charinfo, {});
    const job = parseJson(player.job, {});
    const gang = parseJson(player.gang, null);
    const position = parseJson(player.position, {});
    const metadata = parseJson(player.metadata, {});
    const inventoryRaw = parseJson<unknown[]>(player.inventory, []);
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
        id: player.id,
        userId: player.userId,
        citizenid: player.citizenid,
        cid: player.cid,
        license: player.license,
        name: player.name,
        money,
        charinfo,
        job,
        gang,
        position,
        metadata,
        inventory,
        phone_number: player.phone_number,
        last_updated: player.last_updated,
        last_logged_out: player.last_logged_out,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Character data fetch error:", error);
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
