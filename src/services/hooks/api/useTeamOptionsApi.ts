"use client";

import { apiRequest } from "@/services/api-client";

export function useTeamOptionsApi() {
  const updateTeamName = async (payload: UpdateTeamNamePayload) => {
    return apiRequest<{ message?: string; team?: TeamInfoResponse["team"] }>(
      "/api/user/gang",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
  };

  const deleteTeam = async () => {
    return apiRequest<{ message?: string }>("/api/user/gang", {
      method: "DELETE",
    });
  };

  return {
    updateTeamName,
    deleteTeam,
  };
}
