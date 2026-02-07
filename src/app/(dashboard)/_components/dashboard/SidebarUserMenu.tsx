"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";

import { Typography } from "@/components/typography";

type SidebarUserMenuProps = {
  displayName: string;
  email?: string;
  avatarUrl?: string | null;
  canAccessAdmin?: boolean;
  isAdminRoute?: boolean;
  className?: string;
};

export default function SidebarUserMenu({
  displayName,
  email,
  avatarUrl,
  canAccessAdmin = false,
  isAdminRoute = false,
  className,
}: SidebarUserMenuProps) {
  const safeName = displayName?.trim() || "User";
  const initials = safeName.slice(0, 1).toUpperCase();

  return (
    <div
      className={["mt-8 border-t border-primary-700 pt-5 md:mt-auto px-6", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary-800 border border-primary-700 flex items-center justify-center text-sm font-display">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={`${safeName} avatar`}
              width={40}
              height={40}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0">
          <Typography.Paragraph className="text-primary-100 font-display">
            {safeName}
          </Typography.Paragraph>
          {email ? (
            <Typography.Small className="text-primary-300 truncate block max-w-full">
              {email}
            </Typography.Small>
          ) : null}
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3 text-sm font-display tracking-wide">
        <Link
          className="text-primary-100 hover:text-secondary-700 transition-colors"
          href="/profile"
        >
          Profile
        </Link>
        <Link
          className="text-primary-100 hover:text-secondary-700 transition-colors"
          href="/settings"
        >
          Settings
        </Link>
        {canAccessAdmin ? (
          <Link
            className="text-primary-100 hover:text-secondary-700 transition-colors"
            href={isAdminRoute ? "/dashboard" : "/admin/overview"}
          >
            {isAdminRoute ? "Player" : "Admin"}
          </Link>
        ) : null}
        <div className="my-1 h-px bg-primary-700" />
        <button
          type="button"
          className="text-left text-primary-100 hover:text-secondary-700 transition-colors"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
