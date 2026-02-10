"use client";

import { apiRequest } from "@/services/api-client";

export function useLeagueJoinApi() {
  const createLeagueJoinCheckout = async (payload: LeagueJoinCheckoutPayload) => {
    return apiRequest<LeagueJoinCheckoutResponse>("/api/user/league/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  };

  return {
    createLeagueJoinCheckout,
  };
}
