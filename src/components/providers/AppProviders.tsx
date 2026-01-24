"use client";

import { StoreProvider } from "@/components/providers/ReduxProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import type { AppProvidersProps } from "@/types/providers/AppProviders";

export function AppProviders({ children, session }: AppProvidersProps) {
  return (
    <StoreProvider>
      <SessionProvider session={session}>{children}</SessionProvider>
    </StoreProvider>
  );
}
