import type { DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      discordId?: string | null;
      discordUsername?: string | null;
      discordName?: string | null;
      discordEmail?: string | null;
      discordImage?: string | null;
    } & DefaultSession["user"];
    provider?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    provider?: string;
    discordId?: string | null;
    discordUsername?: string | null;
    discordName?: string | null;
    discordEmail?: string | null;
    discordImage?: string | null;
  }
}
