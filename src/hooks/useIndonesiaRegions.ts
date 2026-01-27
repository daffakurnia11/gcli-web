"use client";

import { useApiSWR } from "@/lib/swr";
import type { CitiesResponse, ProvincesResponse } from "@/types/api/Indonesia";

export function useProvinces() {
  return useApiSWR<ProvincesResponse>("/api/indonesia/provinces");
}

export function useCities(provinceId?: string) {
  const key = provinceId ? `/api/indonesia/cities/${provinceId}` : null;
  return useApiSWR<CitiesResponse>(key);
}
