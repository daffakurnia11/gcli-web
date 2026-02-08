"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import {
  readAuthSetupPayload,
  updateAuthSetupPayload,
} from "@/lib/authSetupPayload";

import AccountLinkWrapper from "./_components/AccountLinkWrapper";
import Credentials from "./_components/Credentials";
import Information from "./_components/Information";
import Stepper from "./_components/Stepper";

export default function AuthSetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [isCompleting] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return sessionStorage.getItem("auth_setup_completed") === "true";
  });
  const stepParam = searchParams.get("step") || "1";
  const currentStep = parseInt(stepParam, 10) as 1 | 2 | 3;

  useEffect(() => {
    if (!isCompleting) {
      return;
    }
    sessionStorage.removeItem("auth_setup_completed");
    router.replace("/dashboard");
  }, [isCompleting, router]);

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
        connected?: boolean;
      };

      if (data.id) {
        updateAuthSetupPayload({
          discord: {
            id: data.id,
            username: data.username || "Discord User",
            name: data.name ?? null,
            email: data.email ?? null,
            image: data.image ?? null,
            connected: data.connected ?? true,
          },
        });
      }

      const url = new URL(window.location.href);
      url.searchParams.delete("discord_data");
      window.history.replaceState({}, "", url.toString());
    } catch (error) {
      console.error("Error parsing discord data from URL:", error);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isCompleting) {
      return;
    }
    if (
      status === "authenticated" &&
      session?.user &&
      session.provider === "discord"
    ) {
      const rawDiscordId = session.user.discordId || session.user.id;
      const discordId = rawDiscordId
        ? `discord:${rawDiscordId.replace(/^discord:/, "")}`
        : "";

      if (discordId) {
        updateAuthSetupPayload({
          discord: {
            id: discordId,
            username: session.user.discordUsername || "Discord User",
            name: session.user.discordName || session.user.name || null,
            email: session.user.discordEmail || session.user.email || null,
            image: session.user.discordImage || session.user.image || null,
            connected: true,
          },
        });
      }
    }

    if (status === "authenticated" && session?.provider === "discord") {
      if (session.user?.isRegistered) {
        router.replace("/dashboard");
        return;
      }
    }

    const payload = readAuthSetupPayload();
    const accountInfo = payload.accountInfo;
    const credentials = payload.credentials;

    // Validate step access
    const validateStepAccess = () => {
      switch (currentStep) {
        case 1:
          // Step 1 is always accessible
          return true;

        case 2:
          // Credentials step requires: all Information fields filled
          if (
            !accountInfo?.name ||
            !accountInfo?.username ||
            !accountInfo?.gender ||
            !accountInfo?.birthDate ||
            !accountInfo?.province?.id ||
            !accountInfo?.city?.id
          ) {
            router.replace("/auth/setup?step=1");
            return false;
          }
          return true;

        case 3:
          // Account Link step requires: Information AND Credentials fields filled
          if (
            !accountInfo?.name ||
            !accountInfo?.username ||
            !accountInfo?.gender ||
            !accountInfo?.birthDate ||
            !accountInfo?.province?.id ||
            !accountInfo?.city?.id
          ) {
            router.replace("/auth/setup?step=1");
            return false;
          }
          if (!credentials?.email || !credentials?.password) {
            router.replace("/auth/setup?step=2");
            return false;
          }
          return true;

        default:
          router.replace("/auth/setup?step=1");
          return false;
      }
    };

    validateStepAccess();
  }, [currentStep, isCompleting, router, session, status]);

  if (isCompleting) {
    return null;
  }

  // Render the appropriate step
  let content: React.ReactNode;

  switch (currentStep) {
    case 1:
      content = <Information showStepper={false} />;
      break;
    case 2:
      content = <Credentials showStepper={false} />;
      break;
    case 3:
      content = <AccountLinkWrapper showStepper={false} />;
      break;
    default:
      content = <Information showStepper={false} />;
  }

  return (
    <>
      <Stepper currentStep={currentStep} />
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
