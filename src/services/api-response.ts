import { NextResponse } from "next/server";

export type ApiResponseMetadata = {
  page: number;
  limit: number;
  count: number;
  total: number;
};

export type ApiSuccessResponse<T> = {
  success: true;
  code: number;
  message: string;
  metadata?: ApiResponseMetadata;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  code: number;
  message: string;
  data?: unknown;
};

export type ApiResponseEnvelope<T> = ApiSuccessResponse<T> | ApiErrorResponse;

const defaultSuccessMessage = (status: number) =>
  status === 201 ? "Successfully create data" : "Successfully fetch data";

const defaultErrorMessage = (status: number) => {
  if (status === 400) return "Bad Request";
  if (status === 401) return "Unauthorized";
  if (status === 403) return "Forbidden";
  if (status === 404) return "Not Found";
  if (status === 405) return "Method not allowed";
  if (status === 409) return "Conflict";
  if (status === 422) return "Unprocessable entity";
  if (status === 429) return "Too many requests";
  return "Internal server error";
};

type SuccessParams<T> = {
  status?: number;
  message?: string;
  metadata?: ApiResponseMetadata;
  data: T;
};

type ErrorParams = {
  status: number;
  message?: string;
  data?: unknown;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const tryExtractMetadata = (payload: Record<string, unknown>) => {
  const pagination = payload.pagination;
  if (!isObject(pagination)) {
    return null;
  }

  const currentPage = pagination.currentPage;
  const itemsPerPage = pagination.itemsPerPage;
  const totalItems = pagination.totalItems;

  if (
    typeof currentPage !== "number" ||
    typeof itemsPerPage !== "number" ||
    typeof totalItems !== "number"
  ) {
    return null;
  }

  const count = Array.isArray(payload.records)
    ? payload.records.length
    : Array.isArray(payload.transactions)
      ? payload.transactions.length
      : Array.isArray(payload.items)
        ? payload.items.length
        : Array.isArray(payload.members)
          ? payload.members.length
          : itemsPerPage;

  return {
    page: currentPage,
    limit: itemsPerPage,
    count,
    total: totalItems,
  } satisfies ApiResponseMetadata;
};

export const apiSuccess = <T>({
  status = 200,
  message,
  metadata,
  data,
}: SuccessParams<T>) =>
  NextResponse.json<ApiSuccessResponse<T>>(
    {
      success: true,
      code: status,
      message: message ?? defaultSuccessMessage(status),
      ...(metadata ? { metadata } : {}),
      data,
    },
    { status },
  );

export const apiCreated = <T>(data: T, message = "Successfully create data") =>
  apiSuccess({ status: 201, message, data });

export const apiError = ({ status, message, data }: ErrorParams) => {
  const showErrorData = process.env.NODE_ENV !== "production";
  return NextResponse.json<ApiErrorResponse>(
    {
      success: false,
      code: status,
      message: message ?? defaultErrorMessage(status),
      ...(showErrorData && data !== undefined ? { data } : {}),
    },
    { status },
  );
};

export const apiBadRequest = (message = "Bad Request", data?: unknown) =>
  apiError({ status: 400, message, data: data ?? null });
export const apiUnauthorized = (message = "Unauthorized") =>
  apiError({ status: 401, message });
export const apiForbidden = (message = "Forbidden") =>
  apiError({ status: 403, message });
export const apiNotFound = (message = "Not Found") =>
  apiError({ status: 404, message });
export const apiMethodNotAllowed = (message = "Method not allowed") =>
  apiError({ status: 405, message });
export const apiConflict = (message = "Conflict", data?: unknown) =>
  apiError({ status: 409, message, data: data ?? null });
export const apiUnprocessable = (message = "Unprocessable entity", data?: unknown) =>
  apiError({ status: 422, message, data: data ?? null });
export const apiTooManyRequests = (message = "Too many requests") =>
  apiError({ status: 429, message });
export const apiInternalServerError = (data?: unknown) =>
  apiError({ status: 500, message: "Internal server error", data: data ?? [] });

export const apiMethodNotAllowedHandlers = <
  T extends Partial<Record<"GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD", unknown>>,
>(implemented: T) => {
  const all = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"] as const;
  const out: Partial<
    Record<(typeof all)[number], () => ReturnType<typeof apiMethodNotAllowed>>
  > = {};

  for (const method of all) {
    if (!(method in implemented)) {
      out[method] = () => apiMethodNotAllowed();
    }
  }

  return out;
};

export const apiFromLegacy = (body: unknown, init?: ResponseInit) => {
  const status = init?.status ?? 200;

  if (isObject(body)) {
    const alreadyEnvelope =
      typeof body.success === "boolean" &&
      typeof body.code === "number" &&
      typeof body.message === "string";

    if (alreadyEnvelope) {
      return NextResponse.json(body, init);
    }
  }

  if (status >= 400) {
    const message =
      isObject(body) && typeof body.message === "string"
        ? body.message
        : isObject(body) && typeof body.error === "string"
          ? body.error
          : defaultErrorMessage(status);

    const errorData =
      status === 500
        ? isObject(body) && "data" in body
          ? body.data
          : []
        : status === 400
          ? isObject(body) && "data" in body
            ? body.data
            : null
          : undefined;

    return apiError({ status, message, data: errorData });
  }

  if (status === 201) {
    return apiCreated(body);
  }

  if (isObject(body)) {
    const metadata = tryExtractMetadata(body) ?? undefined;
    const message =
      typeof body.message === "string" && body.message.length > 0
        ? body.message
        : undefined;
    const data = { ...body };
    delete data.message;
    delete data.metadata;

    return apiSuccess({ status, message, metadata, data });
  }

  return apiSuccess({ status, data: body });
};
