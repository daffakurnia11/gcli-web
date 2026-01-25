"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  readAuthSetupPayload,
  updateAuthSetupPayload,
  type AuthSetupPayload,
} from "@/lib/authSetupPayload";

import AccountLink from "./AccountLink";

type AccountLinkWrapperProps = {
  showStepper?: boolean;
};

export default function AccountLinkWrapper({
  showStepper = true,
}: AccountLinkWrapperProps) {
  const searchParams = useSearchParams();
  const [discordInfo, setDiscordInfo] = useState<AuthSetupPayload["discord"] | null>(
    null,
  );

  useEffect(() => {
    const payload = readAuthSetupPayload();
    if (payload.discord) {
      setDiscordInfo(payload.discord);
    }
  }, []);

  useEffect(() => {
    const discordDataParam = searchParams.get("discord_data");
    if (!discordDataParam) {
      return;
    }

    try {
      const normalized = discordDataParam
        .replace(/ /g, "+")
        .replace(/-/g, "+")
        .replace(/_/g, "/");
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
      const data = JSON.parse(atob(padded)) as {
        id?: string;
        username?: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
      };

      if (data.id) {
        const payload = {
          id: data.id,
          username: data.username || "Discord User",
          name: data.name ?? null,
          email: data.email ?? null,
          image: data.image ?? null,
          connected: true,
        };
        updateAuthSetupPayload({ discord: payload });
        setDiscordInfo(payload);
      }

      const url = new URL(window.location.href);
      url.searchParams.delete("discord_data");
      window.history.replaceState({}, "", url.toString());
    } catch (error) {
      console.error("Error parsing discord data from URL:", error);
    }
  }, [searchParams]);

  return <AccountLink showStepper={showStepper} discordInfo={discordInfo} />;
}
