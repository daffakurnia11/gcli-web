"use client";

import { useEffect } from "react";

import { clearAuthSetupPayload } from "@/lib/authSetupPayload";

export function RegistrationCleanup() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const completed = sessionStorage.getItem("auth_setup_completed");
    if (!completed) {
      return;
    }
    sessionStorage.removeItem("auth_setup_completed");
    clearAuthSetupPayload();
  }, []);

  return null;
}
