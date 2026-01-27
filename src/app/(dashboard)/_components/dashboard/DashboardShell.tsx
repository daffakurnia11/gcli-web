"use client";

import { ChevronDown, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Logo } from "@/components";
import { Typography } from "@/components/typography";

import SidebarUserMenu from "./SidebarUserMenu";

type DashboardShellProps = {
  children: React.ReactNode;
  displayName: string;
  email?: string;
  avatarUrl?: string | null;
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

const sidebarItems: SidebarEntry[] = [
  { type: "group", title: "Dashboard" },
  { type: "item", href: "/dashboard", label: "Overview", sidebar: true },
  {
    type: "item",
    href: "/dashboard/kill-log",
    label: "Kill Log",
    sidebar: true,
    children: [
      { href: "/dashboard/kill-log/kill", label: "Kill" },
      { href: "/dashboard/kill-log/dead", label: "Dead" },
    ],
  },
  { type: "item", href: "/dashboard/profile", label: "Profile" },
  { type: "item", href: "/dashboard/settings", label: "Settings" },
];

const routeLabels = sidebarItems.reduce<Record<string, string>>((acc, entry) => {
  if (entry.type === "item") {
    acc[entry.href] = entry.label;
    entry.children?.forEach((child) => {
      acc[child.href] = child.label;
    });
  }
  return acc;
}, {});

export default function DashboardShell({
  children,
  displayName,
  email,
  avatarUrl,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const matchesPath = (href: string) =>
    pathname === href || pathname?.startsWith(`${href}/`);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sidebarItems.forEach((entry) => {
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
  const label = useMemo(
    () => routeLabels[pathname ?? ""] || "Dashboard",
    [pathname],
  );
  const safeName = displayName?.trim() || "User";

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
  }, [pathname]);

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
            <span>Dashboard</span>
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
                href="/dashboard/profile"
                className="block px-4 py-3 text-sm text-primary-100 hover:bg-primary-800"
                onClick={() => setIsUserMenuOpen(false)}
              >
                Profile
              </Link>
              <Link
                href="/dashboard/settings"
                className="block px-4 py-3 text-sm text-primary-100 hover:bg-primary-800"
                onClick={() => setIsUserMenuOpen(false)}
              >
                Settings
              </Link>
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
          "fixed inset-y-0 left-0 z-40 w-64 border-r border-primary-700 bg-primary-900/95 px-6 py-6 flex flex-col transition-transform duration-300 md:translate-x-0 md:border-b-0 md:border-r",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <Link href={"/"} className="block">
          <Logo variant="name" color="white" className="h-14! w-auto mb-6" />
        </Link>
        <nav className="flex flex-col gap-3 text-sm font-display tracking-wide">
          {sidebarItems.map((entry, index) => {
            if (entry.type === "group") {
              return (
                <Typography.Heading
                  key={`group-${entry.title}-${index}`}
                  level={6}
                  type="display"
                  className="uppercase tracking-widest text-primary-200 mt-2"
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
                    <div className="ml-3 flex flex-col gap-3 border-l border-primary-700 pl-3 py-2">
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
