import type { DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

export type PlayerGang = {
  label: string;
  name: string;
  isboss: boolean;
  bankAuth: boolean;
  grade: {
    level: number;
    name: string;
  };
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      discordId?: string | null;
      discordUsername?: string | null;
      discordName?: string | null;
      discordEmail?: string | null;
      discordImage?: string | null;
      username?: string | null;
      isRegistered?: boolean | null;
      gang?: PlayerGang | null;
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
    username?: string | null;
    isRegistered?: boolean | null;
    gang?: PlayerGang | null;
  }
}
