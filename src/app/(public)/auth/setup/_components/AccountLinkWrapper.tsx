"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

import {
  type AuthSetupPayload,
  readAuthSetupPayload,
  updateAuthSetupPayload,
} from "@/lib/authSetupPayload";

import AccountLink from "./AccountLink";

type AccountLinkWrapperProps = {
  showStepper?: boolean;
};

export default function AccountLinkWrapper({
  showStepper = true,
}: AccountLinkWrapperProps) {
  const searchParams = useSearchParams();
  const storedDiscord = useMemo(
    () => readAuthSetupPayload().discord ?? null,
    [],
  );
  const discordDataParam = searchParams.get("discord_data");
  const parsedDiscord = useMemo(() => {
    if (!discordDataParam) {
      return null;
    }

    try {
      const normalized = discordDataParam
        .replace(/ /g, "+")
        .replace(/-/g, "+")
        .replace(/_/g, "/");
      const padded = normalized.padEnd(
        Math.ceil(normalized.length / 4) * 4,
        "=",
      );
      const data = JSON.parse(atob(padded)) as {
        id?: string;
        username?: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
      };

      if (!data.id) {
        return null;
      }

      return {
        id: data.id,
        username: data.username || "Discord User",
        name: data.name ?? null,
        email: data.email ?? null,
        image: data.image ?? null,
        connected: true,
      };
    } catch (error) {
      console.error("Error parsing discord data from URL:", error);
      return null;
    }
  }, [discordDataParam]);
  const discordInfo: AuthSetupPayload["discord"] | null =
    parsedDiscord ?? storedDiscord;

  useEffect(() => {
    if (!parsedDiscord) {
      return;
    }

    updateAuthSetupPayload({ discord: parsedDiscord });

    const url = new URL(window.location.href);
    url.searchParams.delete("discord_data");
    window.history.replaceState({}, "", url.toString());
  }, [parsedDiscord]);

  return <AccountLink showStepper={showStepper} discordInfo={discordInfo} />;
}
