import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const LEAGUE_INVOICE_REGEX = /^LEAGUE-(\d+)-(.+)-(\d+)$/i;
const LEAGUE_JOIN_PURPOSE_REF_REGEX = /^(\d+):(.+)$/;

export const LEAGUE_JOIN_PURPOSE_TYPE = "league_join";

export const isLeagueJoinPaidStatus = (status: string | null | undefined) => {
  if (!status) {
    return false;
  }

  const normalized = status.trim().toUpperCase();
  return normalized === "SUCCESS" || normalized === "PAID";
};

export const parseLeagueJoinInvoice = (invoiceNumber: string) => {
  const match = LEAGUE_INVOICE_REGEX.exec(invoiceNumber.trim());
  if (!match) {
    return null;
  }

  const leagueId = Number.parseInt(match[1], 10);
  const gangCode = match[2]?.trim().toLowerCase();
  if (!Number.isInteger(leagueId) || leagueId < 1 || !gangCode) {
    return null;
  }

  return { leagueId, gangCode };
};

type LeagueJoinContext = {
  leagueId: number;
  gangCode: string;
  gangName: string;
};

type LeagueJoinPaymentMetadata = {
  leagueId?: unknown;
  gangCode?: unknown;
  gangName?: unknown;
};

const parseLeagueJoinPurposeRef = (purposeRef: string | null) => {
  if (!purposeRef) {
    return null;
  }

  const matched = LEAGUE_JOIN_PURPOSE_REF_REGEX.exec(purposeRef.trim());
  if (!matched) {
    return null;
  }

  const leagueId = Number.parseInt(matched[1], 10);
  const gangCode = matched[2]?.trim().toLowerCase();

  if (!Number.isInteger(leagueId) || leagueId < 1 || !gangCode) {
    return null;
  }

  return { leagueId, gangCode };
};

const parseLeagueJoinMetadata = (metadata: unknown) => {
  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  const safe = metadata as LeagueJoinPaymentMetadata;
  const leagueId = Number.parseInt(String(safe.leagueId ?? ""), 10);
  const gangCode = String(safe.gangCode ?? "").trim().toLowerCase();
  const gangName = String(safe.gangName ?? "").trim();

  if (!Number.isInteger(leagueId) || leagueId < 1 || !gangCode) {
    return null;
  }

  return { leagueId, gangCode, gangName };
};

const mapProviderStatusToPaymentStatus = (status: string | null | undefined) => {
  if (!status) {
    return "pending";
  }

  const normalized = status.trim().toUpperCase();
  if (normalized === "SUCCESS" || normalized === "PAID") {
    return "paid";
  }
  if (normalized === "FAILED" || normalized === "FAIL") {
    return "failed";
  }
  if (normalized === "EXPIRED" || normalized === "TIMEOUT") {
    return "expired";
  }
  if (
    normalized === "CANCELED" ||
    normalized === "CANCELLED" ||
    normalized === "VOID"
  ) {
    return "canceled";
  }

  return "pending";
};

const toNullableJsonInput = (value: unknown) => {
  return value === null
    ? Prisma.JsonNull
    : (value as Prisma.InputJsonValue);
};

const resolveLeagueJoinContextFromPayment = (params: {
  purposeRef: string | null;
  metadata: unknown;
  invoiceNumber: string;
}) => {
  const fromMetadata = parseLeagueJoinMetadata(params.metadata);
  if (fromMetadata) {
    return fromMetadata;
  }

  const fromPurposeRef = parseLeagueJoinPurposeRef(params.purposeRef);
  if (fromPurposeRef) {
    return {
      ...fromPurposeRef,
      gangName: fromPurposeRef.gangCode.toUpperCase(),
    };
  }

  const fromInvoice = parseLeagueJoinInvoice(params.invoiceNumber);
  if (!fromInvoice) {
    return null;
  }

  return {
    ...fromInvoice,
    gangName: fromInvoice.gangCode.toUpperCase(),
  };
};

export const syncLeagueJoinPaymentStatus = async (params: {
  invoiceNumber: string;
  providerStatus: string | null;
  providerPayload?: unknown;
}) => {
  const payment = await prisma.payments.findUnique({
    where: { invoice_number: params.invoiceNumber },
    select: {
      id: true,
      status: true,
      purpose_type: true,
    },
  });

  if (!payment) {
    return { ok: false as const, reason: "payment_not_found" as const };
  }

  if (payment.purpose_type !== LEAGUE_JOIN_PURPOSE_TYPE) {
    return { ok: false as const, reason: "invalid_purpose" as const };
  }

  const nextStatus = mapProviderStatusToPaymentStatus(params.providerStatus);
  const nextChannel = extractPaymentChannel(params.providerPayload);
  await prisma.payments.update({
    where: { id: payment.id },
    data: {
      status: nextStatus,
      ...(params.providerPayload !== undefined
        ? {
            provider_payload_json:
              toNullableJsonInput(params.providerPayload),
          }
        : {}),
      ...(nextChannel ? { channel: nextChannel } : {}),
      ...(nextStatus === "paid" ? { paid_at: new Date() } : {}),
    },
  });

  return {
    ok: true as const,
    status: nextStatus,
    paid: nextStatus === "paid",
  };
};

const insertLeagueTeamWithContext = async (context: LeagueJoinContext) => {
  const [league, gang] = await Promise.all([
    prisma.leagues.findUnique({
      where: { id: context.leagueId },
      select: { id: true },
    }),
    prisma.tl_gangs.findUnique({
      where: { name: context.gangCode },
      select: { label: true },
    }),
  ]);

  if (!league) {
    return { ok: false as const, reason: "league_not_found" };
  }

  const existingEntry = await prisma.league_teams.findFirst({
    where: {
      league_id: context.leagueId,
      code: context.gangCode,
    },
    select: { id: true },
  });

  if (existingEntry) {
    return { ok: true as const, inserted: false as const };
  }

  await prisma.league_teams.create({
    data: {
      league_id: context.leagueId,
      code: context.gangCode,
      name: context.gangName || gang?.label?.trim() || context.gangCode.toUpperCase(),
      status: "active",
      joined_at: new Date(),
    },
  });

  return { ok: true as const, inserted: true as const };
};

export const finalizeLeagueJoinFromInvoice = async (invoiceNumber: string) => {
  const payment = await prisma.payments.findUnique({
    where: { invoice_number: invoiceNumber },
    select: {
      id: true,
      status: true,
      purpose_type: true,
      purpose_ref: true,
      metadata_json: true,
    },
  });

  if (!payment) {
    // Backward compatibility for previously-created invoices before payment table integration.
    const parsed = parseLeagueJoinInvoice(invoiceNumber);
    if (!parsed) {
      return { ok: false as const, reason: "payment_not_found" as const };
    }

    const fallbackContext: LeagueJoinContext = {
      leagueId: parsed.leagueId,
      gangCode: parsed.gangCode,
      gangName: parsed.gangCode.toUpperCase(),
    };
    return insertLeagueTeamWithContext(fallbackContext);
  }

  if (payment.purpose_type !== LEAGUE_JOIN_PURPOSE_TYPE) {
    return { ok: false as const, reason: "invalid_purpose" as const };
  }

  if (payment.status !== "paid") {
    return { ok: false as const, reason: "payment_not_paid" as const };
  }

  const context = resolveLeagueJoinContextFromPayment({
    purposeRef: payment.purpose_ref,
    metadata: payment.metadata_json,
    invoiceNumber,
  });

  if (!context) {
    return { ok: false as const, reason: "invalid_payment_context" as const };
  }

  const inserted = await insertLeagueTeamWithContext(context);
  if (!inserted.ok) {
    return inserted;
  }

  return inserted;
};

const readFromObjectPath = (value: unknown, path: string[]) => {
  let current: unknown = value;

  for (const key of path) {
    if (!current || typeof current !== "object" || !(key in current)) {
      return null;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return typeof current === "string" ? current : null;
};

export const extractPaymentChannel = (payload: unknown) => {
  const candidates = [
    readFromObjectPath(payload, ["channel", "id"]),
    readFromObjectPath(payload, ["channel"]),
    readFromObjectPath(payload, ["service", "id"]),
    readFromObjectPath(payload, ["service"]),
    readFromObjectPath(payload, ["acquirer", "id"]),
    readFromObjectPath(payload, ["payment", "channel"]),
    readFromObjectPath(payload, ["data", "channel", "id"]),
    readFromObjectPath(payload, ["data", "service", "id"]),
  ];

  for (const value of candidates) {
    if (value && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
};

export const extractPaymentStatus = (payload: unknown) => {
  const candidates = [
    readFromObjectPath(payload, ["transaction", "status"]),
    readFromObjectPath(payload, ["status"]),
    readFromObjectPath(payload, ["order", "status"]),
    readFromObjectPath(payload, ["payment", "status"]),
    readFromObjectPath(payload, ["data", "transaction", "status"]),
    readFromObjectPath(payload, ["data", "status"]),
  ];

  for (const value of candidates) {
    if (value && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
};
