import bcrypt from "bcrypt";
import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Discord from "next-auth/providers/discord";

import { prisma } from "./prisma";

export const authOptions: NextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const account = await prisma.web_accounts.findUnique({
          where: { email: credentials.email as string },
          include: { profile: true, user: true },
        });

        if (!account?.password) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          account.password,
        );

        if (!isValid) {
          return null;
        }

        return {
          id: account.id.toString(),
          email: account.email,
          name: account.profile?.real_name ?? account.user?.username ?? null,
        };
      },
    }),
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/discord`,
        },
      },
    }),
    // Note: Steam uses custom OpenID flow, see /api/auth/signin/steam and /api/auth/callback/steam
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "discord") {
        // Pure client-side connect until "Create Now": no DB writes here.
        void user;
        void profile;
      }
      return true;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.provider = token.provider as string;
        session.user.discordId = token.discordId ?? null;
        session.user.discordUsername = token.discordUsername ?? null;
        session.user.discordName = token.discordName ?? null;
        session.user.discordEmail = token.discordEmail ?? null;
        session.user.discordImage = token.discordImage ?? null;
        session.user.steamHex = token.steamHex ?? null;
        session.user.steamId64 = token.steamId64 ?? null;
      }
      return session;
    },
    async jwt({ token, account, profile, user }) {
      if (account) {
        token.provider = account.provider;

        if (account.provider === "discord") {
          const discordProfile = profile as {
            id?: string;
            username?: string;
            global_name?: string;
            email?: string;
            image_url?: string;
          } | undefined;

          token.discordId = discordProfile?.id ?? token.discordId ?? null;
          token.discordUsername =
            discordProfile?.username ?? token.discordUsername ?? null;
          token.discordName =
            discordProfile?.global_name ?? user?.name ?? token.discordName ?? null;
          token.discordEmail =
            discordProfile?.email ?? user?.email ?? token.discordEmail ?? null;
          token.discordImage =
            discordProfile?.image_url ?? user?.image ?? token.discordImage ?? null;
        }
      }

      // Fetch web account to get steam hex if available
      if (token.sub) {
        const accountId = Number.parseInt(token.sub, 10);
        if (Number.isFinite(accountId)) {
          const webAccount = await prisma.web_accounts.findUnique({
            where: { id: accountId },
            select: { steam_hex: true },
          });
          if (webAccount?.steam_hex) {
            token.steamHex = webAccount.steam_hex;
          }
        } else if (token.discordId) {
          const webAccount = await prisma.web_accounts.findUnique({
            where: { discord_id: token.discordId },
            select: { steam_hex: true },
          });
          if (webAccount?.steam_hex) {
            token.steamHex = webAccount.steam_hex;
          }
        }
      }

      return token;
    },
  },
  pages: {
    signIn: "/auth",
  },
  session: { strategy: "jwt" },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
