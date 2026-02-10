import { prisma } from "@/lib/prisma";
import { resolveCitizenIdForAccount } from "@/lib/userCitizenId";
import { leagueJoinCheckoutSchema } from "@/schemas/leagueJoin";
import { requireAccountId } from "@/services/api-guards";
import { apiFromLegacy, apiMethodNotAllowed } from "@/services/api-response";
import { parseJson } from "@/services/json";
import { logger } from "@/services/logger";

type ParsedGang = {
  name?: string;
  label?: string;
  isboss?: boolean;
};

const PAYMENT_SERVICE_BASE_URL =
  process.env.PAYMENT_SERVICE_BASE_URL ?? "http://localhost:3001";

const resolveBossGangContext = async (request: Request) => {
  const authz = await requireAccountId(request);
  if (!authz.ok) {
    return { error: "Unauthorized", status: 401 as const };
  }
  const accountId = authz.accountId;

  const resolved = await resolveCitizenIdForAccount(accountId);
  if (!resolved?.citizenId) {
    return {
      error: "No linked character was found for this account.",
      status: 400 as const,
    };
  }

  const [account, player] = await Promise.all([
    prisma.web_accounts.findUnique({
      where: { id: accountId },
      select: {
        id: true,
        email: true,
        user: { select: { username: true } },
      },
    }),
    prisma.players.findUnique({
      where: { citizenid: resolved.citizenId },
      select: { gang: true },
    }),
  ]);

  const parsedGang = parseJson<ParsedGang | null>(player?.gang, null);
  const gangName = parsedGang?.name?.toLowerCase();
  const gangLabel = parsedGang?.label?.trim() || parsedGang?.name?.trim() || "Team";

  if (!gangName || gangName === "none") {
    return {
      error: "You are not currently assigned to a team.",
      status: 403 as const,
    };
  }

  if (!parsedGang?.isboss) {
    return {
      error: "Only team boss can join the league.",
      status: 403 as const,
    };
  }

  return {
    accountId,
    accountEmail: account?.email ?? null,
    accountUsername: account?.user?.username ?? null,
    gangName,
    gangLabel,
  };
};

const extractCheckoutUrl = (payload: unknown): string | null => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const safe = payload as Record<string, unknown>;
  const candidates: unknown[] = [
    safe.url,
    safe.redirect_url,
    (safe.checkout as Record<string, unknown> | undefined)?.url,
    (safe.payment as Record<string, unknown> | undefined)?.url,
    (safe.payment as Record<string, unknown> | undefined)?.payment_url,
    (safe.response as Record<string, unknown> | undefined)?.url,
    ((safe.response as Record<string, unknown> | undefined)?.payment as
      | Record<string, unknown>
      | undefined)?.url,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.length > 0) {
      return candidate;
    }
  }

  return null;
};

export async function GET(request: Request) {
  try {
    const context = await resolveBossGangContext(request);
    if ("error" in context) {
      return apiFromLegacy({ error: context.error }, { status: context.status });
    }

    const leagues = await prisma.leagues.findMany({
      where: {
        status: "upcoming",
      },
      orderBy: [{ start_at: "asc" }, { id: "desc" }],
    });

    const joined = await prisma.league_teams.findMany({
      where: {
        league_id: { in: leagues.map((league) => league.id) },
        code: context.gangName,
      },
      select: {
        league_id: true,
      },
    });
    const joinedSet = new Set(joined.map((entry) => entry.league_id));

    return apiFromLegacy(
      {
        teamCode: context.gangName,
        teamName: context.gangLabel,
        leagues: leagues.map((league) => ({
          id: league.id,
          name: league.name,
          status: league.status,
          startAt: league.start_at?.toISOString() ?? null,
          endAt: league.end_at?.toISOString() ?? null,
          price: league.price,
          maxTeam: league.max_team,
          rulesJson: league.rules_json,
          alreadyJoined: joinedSet.has(league.id),
        })),
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("League join list fetch error:", error);
    return apiFromLegacy({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const context = await resolveBossGangContext(request);
    if ("error" in context) {
      return apiFromLegacy({ error: context.error }, { status: context.status });
    }

    const rawBody = await request.json().catch(() => null);
    const parsedBody = leagueJoinCheckoutSchema.safeParse(rawBody);
    if (!parsedBody.success) {
      return apiFromLegacy(
        { error: parsedBody.error.issues[0]?.message ?? "Invalid payload." },
        { status: 400 },
      );
    }

    const league = await prisma.leagues.findUnique({
      where: { id: parsedBody.data.leagueId },
      select: {
        id: true,
        name: true,
        status: true,
        price: true,
      },
    });

    if (!league) {
      return apiFromLegacy({ error: "League not found." }, { status: 404 });
    }

    if (league.status !== "upcoming") {
      return apiFromLegacy(
        { error: "Selected league is not open for joining." },
        { status: 400 },
      );
    }

    const existingEntry = await prisma.league_teams.findFirst({
      where: {
        league_id: league.id,
        code: context.gangName,
      },
      select: { id: true },
    });

    if (existingEntry) {
      return apiFromLegacy(
        { error: "Your team has already joined this league." },
        { status: 409 },
      );
    }

    const invoiceNumber = `LEAGUE-${league.id}-${context.gangName}-${Date.now()}`;
    const successRedirectUrl = new URL(
      `/api/user/league/join/complete?invoiceNumber=${encodeURIComponent(invoiceNumber)}`,
      request.url,
    ).toString();
    const customerName =
      context.accountUsername ?? context.gangLabel ?? `ACC-${context.accountId}`;

    const paymentPayload = {
      // callback_url: successRedirectUrl,
      callback_url: 'https://webhook.site/bf0c8542-8975-485f-ad11-885706aff769',
      return_url: successRedirectUrl,
      order: {
        amount: league.price,
        invoice_number: invoiceNumber,
        currency: "IDR",
        callback_url: successRedirectUrl,
      },
      payment: {
        payment_due_date: 60,
      },
      customer: {
        id: `ACC-${context.accountId}`,
        name: customerName,
        ...(context.accountEmail ? { email: context.accountEmail } : {}),
      },
      metadata: {
        type: "league_join",
        league_id: league.id,
        league_name: league.name,
        gang_code: context.gangName,
        gang_name: context.gangLabel,
      },
    };

    const paymentResponse = await fetch(
      `${PAYMENT_SERVICE_BASE_URL}/api/payments`,
      {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentPayload),
      cache: "no-store",
      },
    );

    const paymentResult = (await paymentResponse.json().catch(() => null)) as
      | { message?: string; error?: string }
      | null;

    if (!paymentResponse.ok) {
      const errorMessage =
        paymentResult?.message ||
        paymentResult?.error ||
        "Failed to initiate QRIS payment.";
      return apiFromLegacy(
        { error: errorMessage },
        { status: paymentResponse.status },
      );
    }

    const upstreamData = paymentResult;
    const checkoutUrl = extractCheckoutUrl(upstreamData);

    return apiFromLegacy(
      {
        message: "League join payment created successfully.",
        invoiceNumber,
        checkoutUrl,
        league: {
          id: league.id,
          name: league.name,
          price: league.price,
        },
        paymentGatewayResponse: upstreamData,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("League join checkout error:", error);
    return apiFromLegacy({ error: "Internal server error" }, { status: 500 });
  }
}

// AUTO_METHOD_NOT_ALLOWED
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
