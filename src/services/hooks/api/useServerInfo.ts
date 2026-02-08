"use client";

import { useApiSWR } from "@/services/swr";

export function useDiscordInfo() {
  return useApiSWR<DiscordProxyResponse>("/api/info/discord", undefined, {
    shouldRetryOnError: false,
  });
}

export function useFiveMInfo() {
  return useApiSWR<FiveMProxyResponse>("/api/info/fivem", undefined, {
    shouldRetryOnError: false,
  });
}

export function useServerInfo() {
  const discord = useDiscordInfo();
  const fivem = useFiveMInfo();

  return {
    discord,
    fivem,
    isLoading: discord.isLoading || fivem.isLoading,
    error: discord.error ?? fivem.error,
  };
}
