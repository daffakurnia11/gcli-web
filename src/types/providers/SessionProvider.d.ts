import type { Session } from "next-auth";
import type { ReactNode } from "react";

export interface SessionProviderProps {
  children: ReactNode;
  session?: Session | null;
}
