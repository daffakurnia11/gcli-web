"use client";

import { apiRequest } from "@/services/api-client";

export function useTeamCreateApi() {
  const createTeam = async (payload: CreateTeamPayload) => {
    return apiRequest<{ message?: string; team?: TeamInfoResponse["team"] }>(
      "/api/user/gang",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
  };

  return {
    createTeam,
  };
}
