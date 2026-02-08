"use client";

import { apiRequest } from "@/services/api-client";

export function useAccountApi() {
  const deleteAccount = async () => {
    return apiRequest<unknown>("/api/user/account", {
      method: "DELETE",
    });
  };

  const updateEmail = async (payload: UpdateEmailPayload) => {
    return apiRequest<unknown>("/api/user/email", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  };

  const updatePassword = async (payload: UpdatePasswordPayload) => {
    return apiRequest<unknown>("/api/user/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  };

  const updateProfile = async (payload: UpdateProfilePayload) => {
    return apiRequest<unknown>("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  };

  const connectDiscord = async (payload: ConnectDiscordPayload | null) => {
    return apiRequest<{ message?: string }>("/api/user/discord/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  };

  const disconnectDiscord = async () => {
    return apiRequest<unknown>("/api/user/discord/disconnect", {
      method: "POST",
    });
  };

  return {
    deleteAccount,
    updateEmail,
    updatePassword,
    updateProfile,
    connectDiscord,
    disconnectDiscord,
  };
}
