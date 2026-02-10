"use client";

import { apiRequest } from "@/services/api-client";

export function useAdminLeagueApi() {
  const createLeague = async (payload: AdminLeagueUpsertPayload) => {
    return apiRequest<unknown>("/api/admin/league", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  };

  const updateLeague = async (
    id: number,
    payload: Partial<AdminLeagueUpsertPayload>,
  ) => {
    return apiRequest<unknown>(`/api/admin/league/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  };

  const deleteLeague = async (id: number) => {
    return apiRequest<unknown>(`/api/admin/league/${id}`, {
      method: "DELETE",
    });
  };

  return {
    createLeague,
    updateLeague,
    deleteLeague,
  };
}
