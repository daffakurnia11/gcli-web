"use client";

import { apiRequest } from "@/services/api-client";

export function useAuthSetupApi() {
  const registerAccount = async (payload: RegisterAccountPayload) => {
    return apiRequest<{
      success?: boolean;
      message?: string;
    }>("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  };

  return {
    registerAccount,
  };
}
