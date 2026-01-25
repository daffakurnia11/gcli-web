"use client";

import { SiDiscord } from "@icons-pack/react-simple-icons";
import { Check, Link2, Loader2, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";

import { Button } from "@/components/button";
import { Typography } from "@/components/typography";

import { Alert, DashboardCard, DashboardSection } from "./index";

export interface AccountLinkageProps {
  isDiscordLinked: boolean;
  discordUsername?: string | null;
  discordEmail?: string | null;
  discordImage?: string | null;
  allowDiscordChange?: boolean;
}

export function AccountLinkage({
  isDiscordLinked,
  discordUsername,
  discordEmail,
  allowDiscordChange = true,
}: AccountLinkageProps) {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [linkAlert, setLinkAlert] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const discordPayload = useMemo(() => {
    const discordDataParam = searchParams.get("discord_data");
    if (!discordDataParam) {
      return null;
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
      return data.id ? data : null;
    } catch {
      return null;
    }
  }, [searchParams]);

  const { isLoading: isLinking } = useSWR(
    discordPayload ? ["discord-link", discordPayload.id] : null,
    async () => {
      const response = await fetch("/api/user/discord/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(discordPayload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to link Discord");
      }
      return data as { message?: string };
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      onSuccess: (data) => {
        setLinkAlert({
          type: "success",
          text: data.message || "Discord account connected successfully",
        });
      },
      onError: (error) => {
        setLinkAlert({
          type: "error",
          text:
            error instanceof Error ? error.message : "Failed to link Discord",
        });
      },
    },
  );

  const handleConnectDiscord = async () => {
    setIsLoading(true);
    setMessage(null);
    setLinkAlert(null);
    try {
      const callbackUrl = encodeURIComponent("/dashboard/profile");
      window.location.href = `/api/auth/connect/discord?callbackUrl=${callbackUrl}`;
    } catch {
      setMessage({
        type: "error",
        text: "Failed to connect Discord account",
      });
      setIsLoading(false);
    }
  };

  const handleDisconnectDiscord = async () => {
    if (!confirm("Are you sure you want to disconnect your Discord account?")) {
      return;
    }

    setIsLoading(true);
    setMessage(null);
    setLinkAlert(null);

    try {
      const response = await fetch("/api/user/discord/disconnect", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to disconnect Discord");
      }

      setMessage({
        type: "success",
        text: "Discord account disconnected successfully",
      });
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err instanceof Error ? err.message : "Failed to disconnect Discord",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!discordPayload) {
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.delete("discord_data");
    window.history.replaceState({}, "", url.toString());
  }, [discordPayload]);

  return (
    <DashboardSection title="Linked Accounts">
      {message && (
        <Alert variant={message.type} onDismiss={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}
      {linkAlert && (
        <Alert variant={linkAlert.type} onDismiss={() => setLinkAlert(null)}>
          {linkAlert.text}
        </Alert>
      )}

      <DashboardCard>
        <div className="space-y-4">
          {/* Discord Linkage */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-primary-700 bg-primary-800/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#5865F2]/20 flex items-center justify-center">
                <SiDiscord className="text-[#5865F2]" size={24} />
              </div>
              <div>
                <Typography.Heading level={6} type="display" as="p">
                  Discord
                </Typography.Heading>
                {isDiscordLinked ? (
                  <div className="flex items-center gap-2 mt-0.5">
                    <Check size={14} className="text-green-400" />
                    <Typography.Small className="text-green-400">
                      Connected as {discordUsername || discordEmail}
                    </Typography.Small>
                  </div>
                ) : (
                  <Typography.Small className="text-primary-300">
                    Not connected
                  </Typography.Small>
                )}
              </div>
            </div>

            {isLoading || isLinking ? (
              <Button.Secondary variant="outline" size="sm" disabled>
                <Loader2 size={16} className="animate-spin" />
              </Button.Secondary>
            ) : isDiscordLinked ? (
              <div className="flex items-center gap-3">
                <Button.Secondary
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnectDiscord}
                  className="border-tertiary-red text-tertiary-red"
                  disabled={!allowDiscordChange}
                >
                  <X size={14} className="mr-1" />
                  Disconnect
                </Button.Secondary>
              </div>
            ) : (
              <Button.Secondary
                variant="outline"
                size="sm"
                onClick={handleConnectDiscord}
                disabled={!allowDiscordChange}
              >
                <Link2 size={14} className="mr-1" />
                Connect
              </Button.Secondary>
            )}
          </div>

          {/* FiveM Linkage Info */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-primary-700 bg-primary-800/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#F40552]/20 flex items-center justify-center">
                <span className="text-[#F40552] font-display font-bold text-sm">
                  FiveM
                </span>
              </div>
              <div>
                <Typography.Heading level={6} type="display" as="p">
                  FiveM
                </Typography.Heading>
                <Typography.Small className="text-primary-300">
                  Linked through game server
                </Typography.Small>
              </div>
            </div>
            <div className="flex items-center gap-2 text-primary-400">
              <Check size={16} />
              <Typography.Small>Auto-linked</Typography.Small>
            </div>
          </div>
        </div>
      </DashboardCard>
    </DashboardSection>
  );
}
