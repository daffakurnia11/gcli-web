"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { Button } from "@/components/button";
import Logo from "@/components/Logo";
import { Typography } from "@/components/typography";

const navItems = [
  { label: "Home", path: "/", isHash: false },
  { label: "About", path: "/about", isHash: false },
  { label: "Teams", path: "/standings", isHash: false },
  { label: "Shops", path: "/shops", isHash: false },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const rawUsername = session?.user?.username || "User";
  const username = rawUsername.split("@")[0];
  const isAuthenticated =
    status === "authenticated" && Boolean(session?.user?.isRegistered);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isUserMenuOpen) {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest("[data-user-menu]")) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [isUserMenuOpen]);

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled || pathname !== "/"
          ? "bg-primary-900/95 backdrop-blur-md border-b border-primary-700 py-3"
          : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link
          href="/"
          className="flex items-center gap-2 group"
          onClick={() => window.scrollTo(0, 0)}
        >
          <Logo
            variant="name"
            color="white"
            className="h-10! md:h-12! w-auto group-hover:brightness-110 transition-all"
          />
        </Link>

        <div className="hidden md:flex items-center gap-6 lg:gap-10">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.path}
              className={`text-gray-light hover:text-secondary-700 font-display font-semibold uppercase tracking-wider text-sm transition-colors relative group ${
                pathname === item.path ? "text-secondary-700" : ""
              }`}
            >
              <Typography.Small
                as="span"
                className="font-display font-semibold uppercase tracking-wider text-sm"
              >
                {item.label}
              </Typography.Small>
              <span
                className={`absolute -bottom-1 left-0 h-0.5 bg-secondary-700 transition-all duration-300 ${
                  pathname === item.path ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </Link>
          ))}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <div className="relative" data-user-menu>
                <Button.Slant
                  variant="primary"
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                >
                  Hi, {username}
                </Button.Slant>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-3 w-48 rounded border border-primary-700 bg-primary-900/95 backdrop-blur-lg shadow-lg">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-3 text-sm text-primary-100 hover:bg-primary-800"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Dashboard
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
            ) : (
              <Link href={"/auth"}>
                <Button.Slant
                  variant="primary"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  Join Now
                </Button.Slant>
              </Link>
            )}
          </div>
        </div>

        <button
          className="md:hidden text-gray-dark"
          onClick={() => {
            setIsMobileMenuOpen((prev) => !prev);
            setIsUserMenuOpen(false);
          }}
          aria-label="Toggle navigation"
        >
          <span
            className={`inline-flex transition-transform duration-300 ${
              isMobileMenuOpen ? "rotate-90" : "rotate-0"
            }`}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </span>
        </button>
      </div>

      <div
        className={`md:hidden absolute top-full left-0 w-full bg-primary-900 border-b border-primary-700 overflow-hidden transition-all duration-300 ease-out ${
          isMobileMenuOpen
            ? "max-h-130 opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="p-6 flex flex-col gap-4">
          {navItems.map((item, index) => (
            <Link
              key={item.label}
              href={item.path}
              className={`text-gray-dark text-lg font-display uppercase tracking-wider py-2 border-b border-primary-700 transition-all duration-300 ${
                isMobileMenuOpen
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-2"
              }`}
              style={{ transitionDelay: `${80 + index * 60}ms` }}
            >
              <Typography.Paragraph
                as="span"
                className="font-display uppercase tracking-wider text-lg"
              >
                {item.label}
              </Typography.Paragraph>
            </Link>
          ))}
          <div
            className={`flex flex-col gap-3 mt-4 transition-all duration-300 ${
              isMobileMenuOpen
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2"
            }`}
            style={{ transitionDelay: `${80 + navItems.length * 60}ms` }}
          >
            {isAuthenticated ? (
              <>
                <Button.Primary
                  variant="solid"
                  fullWidth
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                >
                  Hi, {username}
                </Button.Primary>
                {isUserMenuOpen && (
                  <div className="rounded border border-primary-700 bg-primary-900/95 backdrop-blur-lg">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-3 text-sm text-primary-100 hover:bg-primary-800"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Dashboard
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
              </>
            ) : (
              <Link href={"/auth"}>
                <Button.Primary variant="solid" fullWidth>
                  Join Now
                </Button.Primary>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
