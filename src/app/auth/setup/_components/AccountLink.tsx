"use client";

import { SiDiscord, SiSteam } from "@icons-pack/react-simple-icons";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

import { Button } from "@/components/button";
import { Typography } from "@/components/typography";
import {
  resetAuthSetup,
  setIsSubmitting,
  setSubmissionError,
  useAppDispatch,
  useAppSelector,
} from "@/store";

import Stepper from "./Stepper";

type AccountLinkProps = {
  showStepper?: boolean;
};

export default function AccountLink({ showStepper = true }: AccountLinkProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isMounted, setIsMounted] = useState(false);

  // Select state from Redux store
  const accountInfo = useAppSelector((state) => state.authSetup.accountInfo);
  const provinceName = useAppSelector((state) => state.authSetup.provinceName);
  const cityName = useAppSelector((state) => state.authSetup.cityName);
  const password = useAppSelector((state) => state.authSetup.password);
  const isConnectedToDiscord = useAppSelector(
    (state) => state.authSetup.isConnectedToDiscord,
  );
  const isConnectedToSteam = useAppSelector(
    (state) => state.authSetup.isConnectedToSteam,
  );
  const discordUsername = useAppSelector(
    (state) => state.authSetup.discordUsername,
  );
  const steamUsername = useAppSelector(
    (state) => state.authSetup.steamUsername,
  );
  const steamImage = useAppSelector((state) => state.authSetup.steamImage);
  const steamId64 = useAppSelector((state) => state.authSetup.steamId64);
  const steamHex = useAppSelector((state) => state.authSetup.steamHex);
  const discordId = useAppSelector((state) => state.authSetup.discordId);
  const discordName = useAppSelector((state) => state.authSetup.discordName);
  const discordEmail = useAppSelector((state) => state.authSetup.discordEmail);
  const discordImage = useAppSelector((state) => state.authSetup.discordImage);
  const submissionError = useAppSelector((state) => state.authSetup.submissionError);
  const isSubmitting = useAppSelector((state) => state.authSetup.isSubmitting);
  const isAccountInfoComplete = Boolean(
    accountInfo.realName &&
      accountInfo.fivemName &&
      accountInfo.age &&
      accountInfo.birthDate &&
      accountInfo.province &&
      accountInfo.city,
  );

  const isCredentialsComplete = Boolean(password.email && password.password);

  const isJoinDisabled =
    !isAccountInfoComplete ||
    !isCredentialsComplete ||
    !isConnectedToDiscord ||
    !isConnectedToSteam ||
    isSubmitting;

  // Handle Discord connection
  const handleDiscordConnect = async () => {
    if (isConnectedToDiscord) {
      return;
    }
    // Clear error when attempting to connect
    dispatch(setSubmissionError(""));
    // Redirect to Discord OAuth
    await signIn("discord", { callbackUrl: "/auth/setup?step=3" });
  };

  // Handle Steam connection
  const handleSteamConnect = () => {
    if (isConnectedToSteam) {
      return;
    }
    // Clear error when attempting to connect
    dispatch(setSubmissionError(""));
    // Redirect to Steam OpenID login
    window.location.href = `${window.location.origin}/api/auth/signin/steam?callbackUrl=${encodeURIComponent("/auth/setup?step=3")}`;
  };

  // Handle back navigation
  const handleBack = () => {
    router.push("/auth/setup?step=2");
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous error
    dispatch(setSubmissionError(""));

    if (!isAccountInfoComplete) {
      router.push("/auth/setup?step=1");
      return;
    }

    if (!isCredentialsComplete) {
      router.push("/auth/setup?step=2");
      return;
    }

    // Require Discord connection to proceed
    if (!isConnectedToDiscord) {
      dispatch(setSubmissionError("Please connect your Discord account to continue"));
      return;
    }

    if (!isConnectedToSteam) {
      dispatch(setSubmissionError("Please connect your Steam account to continue"));
      return;
    }

    // Prepare payload data
    const cachedSteam = (() => {
      if (typeof window === "undefined") {
        return null;
      }
      try {
        const raw = sessionStorage.getItem("steam_data");
        if (!raw) {
          return null;
        }
        return JSON.parse(raw) as {
          steamId64?: string;
          steamHex?: string;
          username?: string;
          image?: string;
        };
      } catch {
        return null;
      }
    })();

    const resolvedSteamId64 = steamId64 || cachedSteam?.steamId64 || null;
    const resolvedSteamHex = steamHex || cachedSteam?.steamHex || null;
    const resolvedSteamUsername = steamUsername || cachedSteam?.username || null;
    const resolvedSteamImage = steamImage || cachedSteam?.image || null;

    const payload = {
      accountInfo: {
        ...accountInfo,
        province: {
          id: accountInfo.province,
          name: provinceName,
        },
        city: {
          id: accountInfo.city,
          name: cityName,
        },
      },
      credentials: {
        email: password.email,
        password: password.password,
      },
      socialConnections: {
        discord: {
          id: discordId,
          username: discordUsername,
          name: discordName,
          email: discordEmail,
          image: discordImage,
          connected: isConnectedToDiscord,
        },
        steam: {
          id: resolvedSteamId64,
          steamHex: resolvedSteamHex,
          username: resolvedSteamUsername,
          image: resolvedSteamImage,
          connected: isConnectedToSteam || Boolean(resolvedSteamHex),
        },
      },
    };

    if (process.env.NODE_ENV !== "production") {
      console.warn("Account Setup Payload:", payload);
    }

    // Submit to API
    dispatch(setIsSubmitting(true));

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        success?: boolean;
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        dispatch(setSubmissionError(data.error ?? "Registration failed"));
        return;
      }

      if (data.success) {
        // Sign out from NextAuth to clear session cookies FIRST
        await signOut({ redirect: false });

        // Clear ALL storage BEFORE resetting Redux state
        try {
          sessionStorage.clear();
          localStorage.clear();
        } catch {
          // Ignore storage failures.
        }

        // Now reset Redux state (with storage cleared, nothing will be re-persisted)
        dispatch(resetAuthSetup());

        // Redirect to auth page
        window.location.href = "/auth/";
        return;
      }
    } catch {
      dispatch(setSubmissionError("Network error. Please try again."));
    } finally {
      dispatch(setIsSubmitting(false));
    }
  };

  useEffect(() => {
     
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      {showStepper && <Stepper currentStep={3} />}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 container mx-auto flex flex-col items-center justify-center bg-primary-900/50 backdrop-blur-lg w-fit p-10 rounded border border-secondary-500"
      >
        <Typography.Heading
          type="display"
          level={3}
          className="text-primary-100 uppercase tracking-widest text-center"
        >
          Account Link
        </Typography.Heading>
        <div className="h-1 w-24 bg-secondary-700 mt-6 mb-10 content-none mx-auto" />

        {/* Error Message */}
        {submissionError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-sm mb-4 p-3 bg-tertiary-red/20 border border-tertiary-red rounded"
          >
            <Typography.Small className="text-tertiary-red text-center">
              {submissionError}
            </Typography.Small>
          </motion.div>
        )}

        {/* Connection Buttons */}
        <div className="w-sm flex flex-col gap-4">
          <Button.Primary
            size="lg"
            fullWidth
            className="bg-[#5865F2]! border-[#5865F2]! cursor-pointer"
            prefix={<SiDiscord className="text-tertiary-white" />}
            onClick={handleDiscordConnect}
            disabled={isConnectedToDiscord}
          >
            {isConnectedToDiscord ? "Connected to Discord" : "Continue with Discord"}
          </Button.Primary>

          <Button.Primary
            size="lg"
            fullWidth
            className="bg-[#000000]! border-[#000000]! text-tertiary-white cursor-pointer"
            prefix={<SiSteam className="text-tertiary-white" />}
            onClick={handleSteamConnect}
            disabled={isConnectedToSteam}
          >
            {isConnectedToSteam ? "Connected to Steam" : "Continue with Steam"}
          </Button.Primary>
        </div>

        {/* Action Buttons */}
        <div className="w-sm mt-6 flex gap-4">
          <Button.Secondary
            variant="outline"
            size="lg"
            fullWidth
            type="button"
            onClick={handleBack}
          >
            Back
          </Button.Secondary>
          <Button.Primary
            size="lg"
            fullWidth
            type="submit"
            onClick={handleSubmit}
            disabled={isJoinDisabled}
          >
            {isSubmitting ? "Creating..." : "Create Now"}
          </Button.Primary>
        </div>

        {/* Helper Text */}
        <div className="mt-10 flex flex-col space-y-2">
          <Typography.Small className="text-primary-300 text-center">
            Connecting your accounts allows us to verify your identity and link your
            in-game progress.
          </Typography.Small>
          <Typography.Small className="text-primary-300 text-center">
            Discord and Steam are required to join GCLI Server via FiveM.
          </Typography.Small>
        </div>
      </motion.div>
    </>
  );
}
