"use client";

import { apiRequest } from "@/services/api-client";

export function useTeamMembersApi() {
  const updateMemberGrade = async (citizenId: string, gradeLevel: number) => {
    return apiRequest<unknown>(`/api/user/gang/members/${citizenId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gradeLevel }),
    });
  };

  const removeMember = async (citizenId: string) => {
    return apiRequest<unknown>(`/api/user/gang/members/${citizenId}`, {
      method: "DELETE",
    });
  };

  return {
    updateMemberGrade,
    removeMember,
  };
}
