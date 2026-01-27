"use client";

import useSWR, {
  type BareFetcher,
  type SWRConfiguration,
  type SWRKey,
  type SWRResponse,
} from "swr";

export type ApiError = Error & {
  status?: number;
  payload?: unknown;
};

export const apiFetcher = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (payload &&
        typeof payload === "object" &&
        "error" in payload &&
        typeof (payload as { error?: unknown }).error === "string" &&
        (payload as { error: string }).error) ||
      "Request failed";
    const error = new Error(message) as ApiError;
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload as T;
};

const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: false,
};

export function useApiSWR<T, K extends SWRKey = SWRKey>(
  key: K,
  fetcher?: BareFetcher<T> | null,
  config?: SWRConfiguration<T, ApiError>,
): SWRResponse<T, ApiError> {
  const resolvedFetcher = fetcher ?? (apiFetcher as BareFetcher<T>);
  return useSWR<T, ApiError>(key, resolvedFetcher, {
    ...defaultConfig,
    ...config,
  });
}
