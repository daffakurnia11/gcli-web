"use client";

import { SiDiscord } from "@icons-pack/react-simple-icons";
import { motion } from "framer-motion";
import Link from "next/link";

import { Button } from "@/components/button";
import { Typography } from "@/components/typography";
import type { DiscordInfoCardProps } from "@/types/components/Cards";

export function DiscordInfoCard({
  serverName,
  inviteLink,
  onlineMembers,
  totalMembers,
}: DiscordInfoCardProps) {
  const progressPercentage =
    totalMembers > 0 ? Math.max((onlineMembers / totalMembers) * 100, 2) : 2;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="border border-[#5865F2] py-4 px-6 w-full max-w-md bg-primary-900/50 backdrop-blur-lg"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-primary-700 bg-primary-900">
          <SiDiscord className="text-[#5865F2]" />
        </div>
        <div className="flex flex-col">
          <Typography.Heading type="display" level={6} as={"p"}>
            Discord
          </Typography.Heading>
          <Typography.Small className="text-primary-300 -mt-1">
            {serverName || "GCL Indonesia"}
          </Typography.Small>
        </div>
      </div>
      <div className="flex justify-between items-end">
        <div className="flex flex-col">
          <Typography.Small as={"p"} className="text-primary-300 mt-4">
            Current Members:
          </Typography.Small>
          <Typography.Heading type="display" level={6} as={"p"}>
            <span className="text-3xl">{onlineMembers}</span> /{" "}
            <span className="text-primary-300">{totalMembers}</span>
          </Typography.Heading>
        </div>
        {inviteLink ? (
          <Link href={inviteLink} target="_blank" rel="noopener noreferrer">
            <Button.Secondary variant="outline" size="sm">
              Join
            </Button.Secondary>
          </Link>
        ) : (
          <Button.Secondary variant="outline" size="sm" disabled>
            Join
          </Button.Secondary>
        )}
      </div>
      {/* Progress Bar */}
      <div className="w-full h-1 bg-primary-900/50 rounded-full mt-3 mb-3">
        <div
          className="h-full bg-[#5865F2] rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </motion.div>
  );
}
