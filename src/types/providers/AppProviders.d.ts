import type { Session } from "next-auth";
import type { ReactNode } from "react";

export interface AppProvidersProps {
  children: ReactNode;
  session?: Session | null;
}
