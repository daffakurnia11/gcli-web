"use client";

import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

import {
  disconnectDiscord,
  setDiscordConnection,
  setSteamConnection,
  useAppDispatch,
  useAppSelector,
} from "@/store";

import AccountLink from "./AccountLink";

type AccountLinkWrapperProps = {
  showStepper?: boolean;
};

export default function AccountLinkWrapper({
  showStepper = true,
}: AccountLinkWrapperProps) {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const isRehydrated = useAppSelector(
    (state) => state._persist?.rehydrated ?? false,
  );
  const isConnectedToDiscord = useAppSelector(
    (state) => state.authSetup.isConnectedToDiscord,
  );
  const discordId = useAppSelector((state) => state.authSetup.discordId);

  // Read Steam data from URL parameter and sync to Redux
  useEffect(() => {
    const steamDataParam = searchParams.get("steam_data");

    if (!steamDataParam && !isRehydrated) {
      return;
    }

    const decodeSteamData = (encoded: string) => {
      const normalized = encoded.replace(/ /g, "+").replace(/-/g, "+").replace(/_/g, "/");
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
      return JSON.parse(atob(padded));
    };

    const applySteamData = (data: {
      steamHex?: string;
      id?: string;
      steamId64?: string;
      username?: string;
      avatar?: string;
      image?: string;
    }) => {
      let rawSteamId64 =
        (typeof data.steamId64 === "string" && data.steamId64) ||
        (typeof data.id === "string" && data.id) ||
        null;

      if (rawSteamId64 && !/^\d+$/.test(rawSteamId64)) {
        rawSteamId64 = null;
      }

      let resolvedSteamHex =
        typeof data.steamHex === "string" && data.steamHex.startsWith("steam:")
          ? data.steamHex
          : null;

      if (!resolvedSteamHex && rawSteamId64) {
        try {
          resolvedSteamHex = `steam:${BigInt(rawSteamId64).toString(16)}`;
        } catch {
          resolvedSteamHex = null;
        }
      }

      if (!resolvedSteamHex) {
        return;
      }

      const payload = {
        steamId64: rawSteamId64,
        steamHex: resolvedSteamHex,
        username: typeof data.username === "string" ? data.username : null,
        image:
          typeof data.avatar === "string"
            ? data.avatar
            : typeof data.image === "string"
              ? data.image
              : null,
      };

      try {
        sessionStorage.setItem("steam_data", JSON.stringify(payload));
      } catch {
        // Ignore storage failures (private mode, quota, etc.)
      }
      dispatch(setSteamConnection(payload));
    };

    if (steamDataParam) {
      try {
        const data = decodeSteamData(steamDataParam);
        applySteamData(data);

        // Clean URL by removing steam_data parameter
        const url = new URL(window.location.href);
        url.searchParams.delete("steam_data");
        window.history.replaceState({}, "", url.toString());
      } catch (error) {
        console.error("Error parsing steam data from URL:", error);
      }
      return;
    }

    try {
      const cachedSteam = sessionStorage.getItem("steam_data");
      if (cachedSteam) {
        try {
          applySteamData(JSON.parse(cachedSteam));
        } catch (error) {
          console.error("Error parsing cached steam data:", error);
        }
      }
    } catch {
      // Ignore storage access failures (private mode, quota, etc.)
    }
  }, [isRehydrated, dispatch, searchParams]);

  // Sync OAuth session with Redux state
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const provider = session.provider as string;

      // Handle Discord connection
      if (provider === "discord") {
        const rawDiscordId = session.user.discordId || session.user.id;
        const userDiscordId = `discord:${rawDiscordId}`;

        if (!isConnectedToDiscord || discordId !== userDiscordId) {
          dispatch(
            setDiscordConnection({
              discordId: userDiscordId,
              username: session.user.discordUsername || "Discord User",
              name: session.user.discordName || session.user.name || null,
              email: session.user.discordEmail || session.user.email || null,
              image: session.user.discordImage || session.user.image || null,
            }),
          );
        }
      }

    }
  }, [session, status, dispatch, isConnectedToDiscord, discordId]);

  // Handle session changes (disconnect)
  useEffect(() => {
    if (!isRehydrated) {
      return;
    }

    if (status === "authenticated" && session?.user) {
      const provider = session.provider as string;

      // If Discord is in Redux but not in session, disconnect from Redux
      if (provider !== "discord" && isConnectedToDiscord) {
        dispatch(disconnectDiscord());
      }

      // Note: Steam connection is managed via OpenID redirect data,
      // so we don't auto-disconnect it based on NextAuth provider.
    } else if (status === "unauthenticated") {
      // User signed out, disconnect all
      if (isConnectedToDiscord) {
        dispatch(disconnectDiscord());
      }
    }
  }, [session, status, dispatch, isConnectedToDiscord, isRehydrated]);

  return <AccountLink showStepper={showStepper} />;
}
