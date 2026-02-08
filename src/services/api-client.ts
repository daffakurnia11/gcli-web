import type { ApiErrorResponse, ApiResponseEnvelope } from "@/services/api-response";

export type ApiClientError = Error & {
  status?: number;
  code?: number;
  data?: unknown;
  payload?: unknown;
};

const isEnvelope = <T>(payload: unknown): payload is ApiResponseEnvelope<T> => {
  return Boolean(
    payload &&
      typeof payload === "object" &&
      "success" in payload &&
      "code" in payload &&
      "message" in payload,
  );
};

const extractLegacyErrorMessage = (payload: unknown) => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const legacy = payload as { message?: unknown; error?: unknown };
  if (typeof legacy.message === "string" && legacy.message.length > 0) {
    return legacy.message;
  }

  if (typeof legacy.error === "string" && legacy.error.length > 0) {
    return legacy.error;
  }

  return null;
};

const buildError = (
  payload: unknown,
  fallbackMessage: string,
  status: number,
): ApiClientError => {
  if (isEnvelope<never>(payload) && payload.success === false) {
    const envelope = payload as ApiErrorResponse;
    const error = new Error(envelope.message) as ApiClientError;
    error.status = status;
    error.code = envelope.code;
    error.data = envelope.data;
    error.payload = payload;
    return error;
  }

  const legacyMessage = extractLegacyErrorMessage(payload);
  const error = new Error(legacyMessage ?? fallbackMessage) as ApiClientError;
  error.status = status;
  error.payload = payload;
  return error;
};

export const parseApiResponse = async <T>(response: Response): Promise<T> => {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw buildError(payload, "Request failed", response.status);
  }

  if (isEnvelope<T>(payload)) {
    if (!payload.success) {
      throw buildError(payload, "Request failed", response.status);
    }
    return payload.data;
  }

  return payload as T;
};

export const apiRequest = async <T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> => {
  const response = await fetch(input, init);
  return parseApiResponse<T>(response);
};
