"use client";

import useSWR, {
  type BareFetcher,
  type Key,
  type SWRConfiguration,
  type SWRResponse,
} from "swr";

import { type ApiClientError,parseApiResponse } from "@/services/api-client";

export type ApiError = ApiClientError;

export const apiFetcher = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  return parseApiResponse<T>(response);
};

const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: false,
};

export function useApiSWR<T, K extends Key = Key>(
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
