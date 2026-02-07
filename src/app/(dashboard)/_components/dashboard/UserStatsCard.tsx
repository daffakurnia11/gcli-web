"use client";

import {
  SiDiscord,
  SiFivem,
  SiRockstargames,
} from "@icons-pack/react-simple-icons";
import classNames from "classnames";
import { motion } from "framer-motion";
import { Calendar, Home, IdCard, Mail, User } from "lucide-react";
import Image from "next/image";

import { Typography } from "@/components/typography";

import { DashboardCard } from "./DashboardCard";

export interface UserStatsCardProps {
  username?: string | null;
  realName?: string | null;
  fivemName?: string | null;
  email?: string | null;
  birthDate?: Date | string | null;
  address?: string | null;
  gender?: "male" | "female" | null;
  connectUrl?: string | null;
  accountStatus?: "active" | "inactive" | "pending";
  registrationDate?: Date | string | null;
  discordId?: string | null;
  discordUsername?: string | null;
  fivemId?: string | null;
  licenseId?: string | null;
  license2Id?: string | null;
  className?: string;
  avatarUrl?: string | null;
}

export function UserStatsCard({
  username,
  realName,
  fivemName,
  email,
  birthDate,
  address,
  gender,
  connectUrl,
  registrationDate,
  discordId,
  fivemId,
  licenseId,
  license2Id,
  className = "",
  avatarUrl,
}: UserStatsCardProps) {
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const hasDiscord = Boolean(discordId);
  const genderLabel = gender
    ? `${gender[0].toUpperCase()}${gender.slice(1)}`
    : "N/A";
  const connectLink =
    connectUrl && !connectUrl.startsWith("fivem://connect/")
      ? `fivem://connect/${connectUrl}`
      : connectUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <DashboardCard>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-primary-700 flex items-center justify-center overflow-hidden border-2 border-secondary-700">
            {avatarUrl ? (
              <Image
                width={80}
                height={80}
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="text-primary-300" size={36} />
            )}
          </div>
          <div>
            {/* Username or Fivem Username */}
            <Typography.Heading level={6} type="display" className="uppercase">
              {username || fivemName || "Guest"}
            </Typography.Heading>
            {/* Real Name */}
            <Typography.Paragraph className="text-primary-300">
              {realName || "No name yet"}
            </Typography.Paragraph>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail size={18} className="text-primary-300 shrink-0" />
              <span className="text-primary-300 shrink-0">Email:</span>
              <span className="text-primary-100 truncate block max-w-full">{email || "N/A"}</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Calendar size={18} className="text-primary-300 shrink-0" />
              <span className="text-primary-300 shrink-0">Joined:</span>
              <span className="text-primary-100">
                {formatDate(registrationDate)}
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <IdCard size={18} className="text-primary-300 shrink-0" />
              <span className="text-primary-300 shrink-0">Birth Date:</span>
              <span className="text-primary-100">{formatDate(birthDate)}</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <User size={18} className="text-primary-300 shrink-0" />
              <span className="text-primary-300 shrink-0">Gender:</span>
              <span className="text-primary-100">{genderLabel}</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Home size={18} className="text-primary-300 shrink-0" />
              <span className="text-primary-300 shrink-0">Address:</span>
              <span className="text-primary-100 truncate block max-w-full">
                {address || "N/A"}
              </span>
            </div>
          </div>
          <div className="space-y-4">
            {/* Discord Connected (Show ID) */}
            <div className="flex items-center gap-3 text-sm">
              <SiDiscord
                size={18}
                className={classNames(
                  "shrink-0",
                  hasDiscord ? "text-[#5865F2]" : "text-primary-300",
                )}
              />
              <span className="text-primary-300 shrink-0">Discord ID:</span>
              <span
                className={classNames(
                  discordId ? "text-primary-100" : "text-primary-300",
                  "truncate block max-w-full",
                )}
              >
                {discordId || "Not Connected"}
              </span>
            </div>

            {/* FiveM Connected (Show ID) */}
            <div className="flex items-center gap-3 text-sm">
              <SiFivem
                size={18}
                className={classNames(
                  "shrink-0",
                  fivemId ? "text-[#F40552]" : "text-primary-300",
                )}
              />
              <span className="text-primary-300 shrink-0">FiveM ID:</span>
              <span
                className={classNames(
                  fivemId ? "text-primary-100" : "text-primary-300",
                  "truncate block max-w-full",
                )}
              >
                {fivemId ||
                  (connectLink ? (
                    <a
                      href={connectLink}
                      className="text-secondary-700 hover:text-secondary-500 transition-colors"
                    >
                      Connect to FiveM
                    </a>
                  ) : (
                    "Not Connected"
                  ))}
              </span>
            </div>

            {/* License Connected (Show ID) */}
            <div className="flex items-center gap-3 text-sm">
              <SiRockstargames
                size={18}
                className={classNames(
                  "shrink-0",
                  licenseId ? "text-[#FCAF17]" : "text-primary-300",
                )}
              />
              <span className="text-primary-300 shrink-0">License ID:</span>
              <span
                className={classNames(
                  licenseId ? "text-primary-100" : "text-primary-300",
                  "truncate block max-w-full",
                )}
              >
                {licenseId ||
                  (connectLink ? (
                    <a
                      href={connectLink}
                      className="text-secondary-700 hover:text-secondary-500 transition-colors"
                    >
                      Connect to FiveM
                    </a>
                  ) : (
                    "Not Connected"
                  ))}
              </span>
            </div>

            {/* License2 Connected (Show ID) */}
            <div className="flex items-center gap-3 text-sm">
              <SiRockstargames
                size={18}
                className={classNames(
                  "shrink-0",
                  license2Id ? "text-[#FCAF17]" : "text-primary-300",
                )}
              />
              <span className="text-primary-300 shrink-0">License2 ID:</span>
              <span
                className={classNames(
                  license2Id ? "text-primary-100" : "text-primary-300",
                  "truncate block max-w-full",
                )}
              >
                {license2Id ||
                  (connectLink ? (
                    <a
                      href={connectLink}
                      className="text-secondary-700 hover:text-secondary-500 transition-colors"
                    >
                      Connect to FiveM
                    </a>
                  ) : (
                    "Not Connected"
                  ))}
              </span>
            </div>
          </div>
        </div>
      </DashboardCard>
    </motion.div>
  );
}
