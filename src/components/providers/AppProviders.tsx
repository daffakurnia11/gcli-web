"use client";

import { SessionProvider } from "@/components/providers/SessionProvider";
import type { AppProvidersProps } from "@/types/providers/AppProviders";

export function AppProviders({ children, session }: AppProvidersProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
