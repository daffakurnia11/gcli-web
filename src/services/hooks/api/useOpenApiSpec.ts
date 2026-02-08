"use client";

import { useApiSWR } from "@/services/swr";

export function useOpenApiSpec(specUrl = "/api/openapi") {
  return useApiSWR<Record<string, unknown>>(specUrl, undefined, {
    shouldRetryOnError: false,
  });
}
