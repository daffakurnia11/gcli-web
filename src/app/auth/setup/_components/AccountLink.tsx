"use client";

import { SiDiscord } from "@icons-pack/react-simple-icons";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/button";
import { Typography } from "@/components/typography";
import {
  clearAuthSetupPayload,
  readAuthSetupPayload,
  updateAuthSetupPayload,
} from "@/lib/authSetupPayload";
import type { AccountInfoFormData } from "@/schemas/authSetup";

import Stepper from "./Stepper";

type AccountLinkProps = {
  showStepper?: boolean;
  discordInfo: {
    id: string;
    username: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    connected: boolean;
  } | null;
};

export default function AccountLink({ showStepper = true, discordInfo }: AccountLinkProps) {
  const router = useRouter();
  const [submissionError, setSubmissionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountInfo] = useState<AccountInfoFormData | null>(() => {
    const payload = readAuthSetupPayload() as {
      accountInfo?: {
        name?: string;
        username?: string;
        realName?: string;
        fivemName?: string;
        age?: string;
        birthDate?: string;
        province?: { id?: number | string; name?: string } | string;
        city?: { id?: number | string; name?: string } | string;
      };
      provinceName?: string;
      cityName?: string;
    };

    if (!payload.accountInfo) {
      return null;
    }

    const raw = payload.accountInfo;
    return {
      name: raw.name ?? raw.realName ?? "",
      username: raw.username ?? raw.fivemName ?? "",
      age: raw.age ?? "",
      birthDate: raw.birthDate ?? "",
      province:
        typeof raw.province === "object" && raw.province !== null
          ? {
              id: Number(raw.province.id ?? 0),
              name: raw.province.name ?? payload.provinceName ?? "",
            }
          : {
              id: Number.parseInt(raw.province ?? "0", 10),
              name: payload.provinceName ?? "",
            },
      city:
        typeof raw.city === "object" && raw.city !== null
          ? {
              id: Number(raw.city.id ?? 0),
              name: raw.city.name ?? payload.cityName ?? "",
            }
          : {
              id: Number.parseInt(raw.city ?? "0", 10),
              name: payload.cityName ?? "",
            },
    };
  });
  const [credentials] = useState<{
    email: string;
    password: string;
  } | null>(() => {
    const payload = readAuthSetupPayload();
    if (!payload.credentials) {
      return null;
    }
    return {
      email: payload.credentials.email,
      password: payload.credentials.password,
    };
  });

  const isAccountInfoComplete = useMemo(() => {
    if (!accountInfo) {
      return false;
    }
    return Boolean(
      accountInfo.name &&
        accountInfo.username &&
        accountInfo.age &&
        accountInfo.birthDate &&
        accountInfo.province.id &&
        accountInfo.city.id,
    );
  }, [accountInfo]);

  const isCredentialsComplete = useMemo(() => {
    return Boolean(credentials?.email && credentials?.password);
  }, [credentials]);

  const isConnectedToDiscord = Boolean(discordInfo?.connected);

  const isJoinDisabled =
    !isAccountInfoComplete ||
    !isCredentialsComplete ||
    !isConnectedToDiscord ||
    isSubmitting;

  // Handle Discord connection
  const handleDiscordConnect = async () => {
    if (isConnectedToDiscord) {
      return;
    }
    // Clear error when attempting to connect
    setSubmissionError("");
    // Redirect to Discord OAuth (connect only)
    const callbackUrl = encodeURIComponent("/auth/setup?step=3");
    window.location.href = `/api/auth/connect/discord?callbackUrl=${callbackUrl}`;
  };

  // Handle back navigation
  const handleBack = () => {
    router.push("/auth/setup?step=2");
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous error
    setSubmissionError("");

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
      setSubmissionError("Please connect your Discord account to continue");
      return;
    }

    if (!accountInfo || !credentials || !discordInfo) {
      setSubmissionError("Please complete the previous steps first.");
      return;
    }

    const payload = {
      accountInfo: {
        name: accountInfo.name,
        username: accountInfo.username,
        age: accountInfo.age,
        birthDate: accountInfo.birthDate,
        province: accountInfo.province,
        city: accountInfo.city,
      },
      credentials: {
        email: credentials.email,
        password: credentials.password,
      },
      socialConnections: {
        discord: {
          id: discordInfo.id,
          username: discordInfo.username,
          name: discordInfo.name,
          email: discordInfo.email,
          image: discordInfo.image,
          connected: discordInfo.connected,
        },
      },
    };

    if (process.env.NODE_ENV !== "production") {
      console.warn("Account Setup Payload:", payload);
    }

    // Submit to API
    setIsSubmitting(true);

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
        setSubmissionError(data.error ?? "Registration failed");
        return;
      }

      if (data.success) {
        clearAuthSetupPayload();
        // Redirect to auth page
        window.location.href = "/auth/";
        return;
      }
    } catch {
      setSubmissionError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!discordInfo) {
      return;
    }
    updateAuthSetupPayload({ discord: discordInfo });
  }, [discordInfo]);

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
        </div>
      </motion.div>
    </>
  );
}
