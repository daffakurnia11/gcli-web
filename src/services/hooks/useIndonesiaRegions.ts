"use client";

import { useApiSWR } from "@/services/swr";

export function useProvinces() {
  return useApiSWR<ProvincesResponse>("/api/indonesia/provinces");
}

export function useCities(provinceId?: string) {
  const key = provinceId ? `/api/indonesia/cities/${provinceId}` : null;
  return useApiSWR<CitiesResponse>(key);
}
