"use client";

import useSWR from "swr";

import type { CitiesResponse, ProvincesResponse } from "@/types/api/Indonesia";

const fetcher = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data?.message === "string" ? data.message : "Request failed";
    throw new Error(message);
  }

  return data as T;
};

export function useProvinces() {
  return useSWR<ProvincesResponse>("/api/indonesia/provinces", fetcher);
}

export function useCities(provinceId?: string) {
  const key = provinceId ? `/api/indonesia/cities/${provinceId}` : null;
  return useSWR<CitiesResponse>(key, fetcher);
}
