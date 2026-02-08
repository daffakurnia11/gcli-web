"use client";

import { apiRequest } from "@/services/api-client";

type AssignInvestmentInput = {
  bankAccountId: string;
  gangCode: string;
};

export function useAdminInvestmentApi() {
  const assignInvestment = async (payload: AssignInvestmentInput) => {
    return apiRequest<unknown>("/api/admin/investment/assign", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  };

  return {
    assignInvestment,
  };
}
