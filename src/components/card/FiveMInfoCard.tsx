"use client";

import { SiFivem } from "@icons-pack/react-simple-icons";
import { motion } from "framer-motion";
import Link from "next/link";

import { Button } from "@/components/button";
import { Typography } from "@/components/typography";
import type { FiveMInfoCardProps } from "@/types/components/Cards";

export function FiveMInfoCard({
  serverName,
  connectUrl,
  onlinePlayers,
  totalPlayers,
}: FiveMInfoCardProps) {
  const progressPercentage =
    totalPlayers > 0 ? Math.max((onlinePlayers / totalPlayers) * 100, 2) : 2;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="border border-[#F40552] py-4 px-6 w-full max-w-md bg-primary-900/50 backdrop-blur-lg"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-primary-700 bg-primary-900">
          <SiFivem className="text-[#F40552]" />
        </div>
        <div className="flex flex-col">
          <Typography.Heading type="display" level={6} as={"p"}>
            FiveM Server
          </Typography.Heading>
          <Typography.Small className="text-primary-300 -mt-1">
            {serverName || "GCL Indonesia"}
          </Typography.Small>
        </div>
      </div>
      <div className="flex justify-between items-end">
        <div className="flex flex-col">
          <Typography.Small as={"p"} className="text-primary-300 mt-4">
            Current Players:
          </Typography.Small>
          <Typography.Heading type="display" level={6} as={"p"}>
            <span className="text-3xl">{onlinePlayers}</span> /{" "}
            <span className="text-primary-300">{totalPlayers}</span>
          </Typography.Heading>
        </div>
        {connectUrl ? (
          <Link
            href={`fivem://connect/${connectUrl}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button.Secondary variant="outline" size="sm">
              Connect
            </Button.Secondary>
          </Link>
        ) : (
          <Button.Secondary variant="outline" size="sm" disabled>
            Connect
          </Button.Secondary>
        )}
      </div>
      {/* Progress Bar */}
      <div className="w-full h-1 bg-primary-900/50 rounded-full mt-3 mb-3">
        <div
          className="h-full bg-[#F40552] rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </motion.div>
  );
}
