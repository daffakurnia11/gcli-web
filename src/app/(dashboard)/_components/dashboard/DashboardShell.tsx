"use client";

import { ChevronDown, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Logo } from "@/components";
import { Typography } from "@/components/typography";

import SidebarUserMenu from "./SidebarUserMenu";

const PENDING_LEAGUE_JOIN_STORAGE_KEY = "gcli:leagueJoinPendingInvoice";
const PENDING_LEAGUE_JOIN_MAX_AGE_MS = 1000 * 60 * 60 * 24;

type DashboardShellProps = {
  children: React.ReactNode;
  displayName: string;
  email?: string;
  avatarUrl?: string | null;
  isGangBoss?: boolean;
  hasCharinfo?: boolean;
  hasGang?: boolean;
  canAccessAdmin?: boolean;
};

type SidebarGroup = {
  type: "group";
  title: string;
};

type SidebarChildItem = {
  href: string;
  label: string;
};

type SidebarLinkItem = {
  type: "item";
  href: string;
  label: string;
  sidebar?: boolean;
  children?: SidebarChildItem[];
};

type SidebarEntry = SidebarGroup | SidebarLinkItem;

const getSidebarItems = (
  isAdminRoute: boolean,
  isGangBoss: boolean,
  hasCharinfo: boolean,
  hasGang: boolean,
): SidebarEntry[] => {
  if (isAdminRoute) {
    return [
      {
        type: "item",
        href: "/admin/overview",
        label: "Overview",
        sidebar: true,
      },
      {
        type: "item",
        href: "/admin/investment",
        label: "Investment",
        sidebar: true,
      },
      { type: "group", title: "Payment" },
      {
        type: "item",
        href: "/admin/payment",
        label: "Recap",
        sidebar: true,
      },
      { type: "group", title: "League" },
      {
        type: "item",
        href: "/admin/league/list",
        label: "List",
        sidebar: true,
      },
      { type: "item", href: "/profile", label: "Profile" },
      { type: "item", href: "/settings", label: "Settings" },
    ];
  }

  const baseItems: SidebarEntry[] = [
    { type: "group", title: "Dashboard" },
    { type: "item", href: "/dashboard", label: "Overview", sidebar: true },
    { type: "item", href: "/profile", label: "Profile" },
    { type: "item", href: "/settings", label: "Settings" },
  ];

  if (!hasCharinfo) {
    return baseItems;
  }

  return [
    ...baseItems.slice(0, 2),
    { type: "group", title: "Player" },
    { type: "item", href: "/character", label: "Character", sidebar: true },
    { type: "item", href: "/inventory", label: "My Inventory", sidebar: true },
    { type: "item", href: "/bank", label: "My Bank", sidebar: true },
    { type: "group", title: "Payment" },
    { type: "item", href: "/payment", label: "My Payments", sidebar: true },
    { type: "group", title: "Team" },
    ...(hasGang
      ? ([
          {
            type: "item",
            href: "/team/info",
            label: "Overview",
            sidebar: true,
          },
          {
            type: "item",
            href: "/team/members",
            label: "Members",
            sidebar: true,
          },
          {
            type: "item",
            href: "/team/inventory",
            label: "Inventory",
            sidebar: true,
          },
          ...(isGangBoss
            ? [
                {
                  type: "item",
                  href: "/team/bank",
                  label: "Team Bank",
                  sidebar: true,
                },
                {
                  type: "item",
                  href: "/team/investment",
                  label: "Investment Bank",
                  sidebar: true,
                },
                {
                  type: "item",
                  href: "/team/options",
                  label: "Team Options",
                  sidebar: true,
                },
              ]
            : []),
          { type: "group", title: "League" },
          {
            type: "item",
            href: "/league/join",
            label: "Join League",
            sidebar: true,
          },
          { type: "group", title: "Log" },
          {
            type: "item",
            href: "/kill-log",
            label: "Kill Log",
            sidebar: true,
            children: [
              { href: "/kill-log/kill", label: "Kill Records" },
              { href: "/kill-log/dead", label: "Death Records" },
            ],
          },
        ] as SidebarEntry[])
      : ([
          {
            type: "item",
            href: "/team/create",
            label: "Create Team",
            sidebar: true,
          },
        ] as SidebarEntry[])),
    ...baseItems.slice(2),
  ];
};

export default function DashboardShell({
  children,
  displayName,
  email,
  avatarUrl,
  isGangBoss = false,
  hasCharinfo = false,
  hasGang = false,
  canAccessAdmin = false,
}: DashboardShellProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname === "/admin" || pathname?.startsWith("/admin/");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const sidebarItems = useMemo(
    () =>
      getSidebarItems(Boolean(isAdminRoute), isGangBoss, hasCharinfo, hasGang),
    [isAdminRoute, isGangBoss, hasCharinfo, hasGang],
  );
  const matchesPath = useCallback(
    (href: string) => pathname === href || pathname?.startsWith(`${href}/`),
    [pathname],
  );
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    getSidebarItems(false, false, false, false).forEach((entry) => {
      if (entry.type !== "item" || !entry.children?.length) {
        return;
      }
      const hasActiveChild = entry.children.some((child) =>
        matchesPath(child.href),
      );
      if (hasActiveChild) {
        initial[entry.href] = true;
      }
    });
    return initial;
  });
  const label = useMemo(() => {
    const labels = sidebarItems.reduce<Record<string, string>>((acc, entry) => {
      if (entry.type === "item") {
        acc[entry.href] = entry.label;
        entry.children?.forEach((child) => {
          acc[child.href] = child.label;
        });
      }
      return acc;
    }, {});
    return labels[pathname ?? ""] || "Dashboard";
  }, [pathname, sidebarItems]);
  const safeName = displayName?.trim() || "User";
  const mobileSectionLabel = isAdminRoute ? "Admin" : "Dashboard";

  useEffect(() => {
    if (!isSidebarOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    if (!isUserMenuOpen) {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && !userMenuRef.current?.contains(target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [isUserMenuOpen]);

  useEffect(() => {
    sidebarItems.forEach((entry) => {
      if (entry.type !== "item" || !entry.children?.length) {
        return;
      }
      const hasActiveChild = entry.children.some((child) =>
        matchesPath(child.href),
      );
      if (hasActiveChild) {
        setOpenMenus((prev) => ({ ...prev, [entry.href]: true }));
      }
    });
  }, [matchesPath, sidebarItems]);

  useEffect(() => {
    let isCancelled = false;

    const verifyPendingLeagueJoin = async () => {
      if (typeof window === "undefined") {
        return;
      }

      const rawStored = window.localStorage.getItem(
        PENDING_LEAGUE_JOIN_STORAGE_KEY,
      );
      if (!rawStored) {
        return;
      }

      let parsed: { invoiceNumber?: unknown; createdAt?: unknown } | null = null;
      try {
        parsed = JSON.parse(rawStored) as
          | { invoiceNumber?: unknown; createdAt?: unknown }
          | null;
      } catch {
        window.localStorage.removeItem(PENDING_LEAGUE_JOIN_STORAGE_KEY);
        return;
      }
      const invoiceNumber =
        parsed && typeof parsed.invoiceNumber === "string"
          ? parsed.invoiceNumber.trim()
          : "";
      const createdAt =
        parsed && typeof parsed.createdAt === "number" ? parsed.createdAt : 0;

      if (!invoiceNumber) {
        window.localStorage.removeItem(PENDING_LEAGUE_JOIN_STORAGE_KEY);
        return;
      }

      if (!Number.isFinite(createdAt) || Date.now() - createdAt > PENDING_LEAGUE_JOIN_MAX_AGE_MS) {
        window.localStorage.removeItem(PENDING_LEAGUE_JOIN_STORAGE_KEY);
        return;
      }

      try {
        const response = await fetch(
          `/api/user/league/join/verify?invoiceNumber=${encodeURIComponent(invoiceNumber)}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        if (!response.ok) {
          return;
        }

        const payload = (await response.json().catch(() => null)) as
          | {
              success?: boolean;
              data?: { paid?: boolean };
            }
          | null;
        const paid = payload?.success === true && payload.data?.paid === true;
        if (paid && !isCancelled) {
          window.localStorage.removeItem(PENDING_LEAGUE_JOIN_STORAGE_KEY);
        }
      } catch {
        return;
      }
    };

    void verifyPendingLeagueJoin();

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-primary-900 text-primary-100">
      <div className="md:hidden sticky top-0 z-40 border-b border-primary-700 bg-primary-900/95 backdrop-blur px-4 py-3 flex items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-3 text-primary-100"
          onClick={() => setIsSidebarOpen((prev) => !prev)}
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-primary-700 bg-primary-800">
            <Menu size={18} />
          </span>
          <span className="flex items-center gap-2 text-sm font-display uppercase tracking-wider">
            <span>{mobileSectionLabel}</span>
            <span className="text-primary-300">/</span>
            <span className="text-primary-100">{label}</span>
          </span>
        </button>

        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            className="h-9 w-9 rounded-full border border-primary-700 bg-primary-800 overflow-hidden"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            aria-label="Open account menu"
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={`${safeName} avatar`}
                width={36}
                height={36}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xs font-display">
                {safeName.slice(0, 1).toUpperCase()}
              </span>
            )}
          </button>
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-3 w-44 rounded border border-primary-700 bg-primary-900/95 backdrop-blur-lg shadow-lg">
              <Link
                href="/profile"
                className="block px-4 py-3 text-sm text-primary-100 hover:bg-primary-800"
                onClick={() => setIsUserMenuOpen(false)}
              >
                Profile
              </Link>
              <Link
                href="/settings"
                className="block px-4 py-3 text-sm text-primary-100 hover:bg-primary-800"
                onClick={() => setIsUserMenuOpen(false)}
              >
                Settings
              </Link>
              {canAccessAdmin ? (
                <Link
                  href={isAdminRoute ? "/dashboard" : "/admin/overview"}
                  className="block px-4 py-3 text-sm text-primary-100 hover:bg-primary-800"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  {isAdminRoute ? "Player" : "Admin"}
                </Link>
              ) : null}
              <div className="h-px bg-primary-700" />
              <button
                type="button"
                className="block w-full text-left px-4 py-3 text-sm text-primary-100 hover:bg-primary-800"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {isSidebarOpen && (
        <button
          type="button"
          className="md:hidden fixed inset-0 z-30 bg-black/50"
          aria-label="Close sidebar"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 w-64 border-r border-primary-700 bg-primary-900/95 py-6 flex flex-col transition-transform duration-300 md:translate-x-0 md:border-b-0 md:border-r",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <Link href={"/"} className="block">
          <Logo variant="name" color="white" className="h-14! w-auto mb-6" />
        </Link>
        <nav className="min-h-0 flex-1 overflow-y-auto flex flex-col gap-2 pb-4 text-sm font-display tracking-wide px-6">
          {sidebarItems.map((entry, index) => {
            if (entry.type === "group") {
              return (
                <Typography.Heading
                  key={`group-${entry.title}-${index}`}
                  level={6}
                  type="display"
                  className="uppercase tracking-widest text-primary-200 mt-5"
                >
                  {entry.title}
                </Typography.Heading>
              );
            }

            if (!entry.sidebar) {
              return null;
            }

            const hasChildren = Boolean(entry.children?.length);
            const isActiveParent =
              matchesPath(entry.href) ||
              entry.children?.some((child) => matchesPath(child.href));
            const textClass = isActiveParent
              ? "text-secondary-700"
              : "text-primary-100 hover:text-secondary-700";

            if (hasChildren) {
              const isOpen = openMenus[entry.href] ?? false;
              return (
                <div key={entry.href} className="flex flex-col gap-1">
                  <button
                    type="button"
                    className={`flex w-full items-center justify-between ${textClass}`}
                    onClick={() =>
                      setOpenMenus((prev) => ({
                        ...prev,
                        [entry.href]: !isOpen,
                      }))
                    }
                    aria-expanded={isOpen}
                  >
                    <Typography.Paragraph className={textClass}>
                      {entry.label}
                    </Typography.Paragraph>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="ml-3 flex flex-col gap-2 border-l border-primary-700 pl-3 py-1">
                      {entry.children?.map((child) => {
                        const isActiveChild = matchesPath(child.href);
                        const childClass = isActiveChild
                          ? "text-secondary-700"
                          : "text-primary-200 hover:text-secondary-700";
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={childClass}
                            onClick={() => setIsSidebarOpen(false)}
                          >
                            <Typography.Paragraph className={childClass}>
                              {child.label}
                            </Typography.Paragraph>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={entry.href}
                className={textClass}
                href={entry.href}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Typography.Paragraph className={textClass}>
                  {entry.label}
                </Typography.Paragraph>
              </Link>
            );
          })}
        </nav>
        <SidebarUserMenu
          displayName={displayName}
          email={email}
          avatarUrl={avatarUrl}
          canAccessAdmin={canAccessAdmin}
          isAdminRoute={Boolean(isAdminRoute)}
          className="hidden md:block"
        />
      </aside>

      <div className="md:pl-64">
        <main className="min-h-screen bg-primary-900/40 p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
