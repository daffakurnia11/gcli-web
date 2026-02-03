import bcrypt from "bcrypt";
import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Discord from "next-auth/providers/discord";

import { prisma } from "./prisma";

export const authOptions: NextAuthConfig = {
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
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
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "discord") {
        // Pure client-side connect until "Create Now": no DB writes here.
        void user;
        const discordProfile = profile as
          | {
              id?: string;
              username?: string;
              global_name?: string;
              email?: string;
              image_url?: string;
            }
          | undefined;

        const rawDiscordId = discordProfile?.id;
        if (rawDiscordId) {
          const prefixedDiscordId = `discord:${rawDiscordId}`;
          let hasProfile = false;

          try {
            const webAccount =
              (await prisma.web_accounts.findUnique({
                where: { discord_id: prefixedDiscordId },
                select: { profile: { select: { id: true } } },
              })) ??
              (await prisma.web_accounts.findUnique({
                where: { discord_id: rawDiscordId },
                select: { profile: { select: { id: true } } },
              }));
            hasProfile = Boolean(webAccount?.profile);
          } catch (error) {
            console.error("Discord sign-in lookup failed:", error);
          }

          if (!hasProfile) {
            const payload = {
              id: prefixedDiscordId,
              username: discordProfile?.username || "Discord User",
              name: discordProfile?.global_name ?? null,
              email: discordProfile?.email ?? null,
              image: discordProfile?.image_url ?? null,
              connected: true,
            };
            const encoded = Buffer.from(JSON.stringify(payload)).toString(
              "base64url",
            );
            return `/auth/setup?step=1&discord_data=${encoded}`;
          }
        }
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
        session.user.username = token.username ?? null;
        session.user.isRegistered =
          typeof token.isRegistered === "boolean" ? token.isRegistered : null;
        session.user.gang = token.gang ?? null;
      }
      return session;
    },
    async jwt({ token, account, profile, user }) {
      if (account) {
        token.provider = account.provider;

        if (account.provider === "discord") {
          const discordProfile = profile as
            | {
                id?: string;
                username?: string;
                global_name?: string;
                email?: string;
                image_url?: string;
              }
            | undefined;

          token.discordId = discordProfile?.id ?? token.discordId ?? null;
          token.discordUsername =
            discordProfile?.username ?? token.discordUsername ?? null;
          token.discordName =
            discordProfile?.global_name ??
            user?.name ??
            token.discordName ??
            null;
          token.discordEmail =
            discordProfile?.email ?? user?.email ?? token.discordEmail ?? null;
          token.discordImage =
            discordProfile?.image_url ??
            user?.image ??
            token.discordImage ??
            null;
        }
      }

      if (token.sub && /^\d+$/.test(token.sub)) {
        const accountId = Number.parseInt(token.sub, 10);
        const webAccount = await prisma.web_accounts.findUnique({
          where: { id: accountId },
          select: {
            id: true,
            profile: { select: { id: true } },
            user: { select: { username: true, license: true, license2: true } },
          },
        });
        token.isRegistered = Boolean(webAccount?.profile);
        token.username = webAccount?.user?.username ?? null;

        // Fetch gang data from players table
        if (webAccount?.user) {
          const licenses = [
            webAccount.user.license,
            webAccount.user.license2,
          ].filter((l): l is string => Boolean(l?.trim()));
          if (licenses.length > 0) {
            const player = await prisma.players.findFirst({
              where: { license: { in: licenses } },
              orderBy: { last_updated: "desc" },
              select: { gang: true },
            });
            if (player?.gang) {
              try {
                token.gang = JSON.parse(player.gang as string) as {
                  label: string;
                  name: string;
                  isboss: boolean;
                  bankAuth: boolean;
                  grade: { level: number; name: string };
                };
              } catch {
                token.gang = null;
              }
            } else {
              token.gang = null;
            }
          }
        }
      } else if (token.discordId) {
        const rawDiscordId = token.discordId.replace(/^discord:/, "");
        const prefixedDiscordId = `discord:${rawDiscordId}`;
        const webAccount =
          (await prisma.web_accounts.findUnique({
            where: { discord_id: prefixedDiscordId },
            select: {
              id: true,
              profile: { select: { id: true } },
              user: { select: { username: true, license: true, license2: true } },
            },
          })) ??
          (await prisma.web_accounts.findUnique({
            where: { discord_id: rawDiscordId },
            select: {
              id: true,
              profile: { select: { id: true } },
              user: { select: { username: true, license: true, license2: true } },
            },
          }));
        token.isRegistered = Boolean(webAccount?.profile);
        token.username = webAccount?.user?.username ?? null;
        if (webAccount?.id) {
          token.sub = webAccount.id.toString();
        }

        // Fetch gang data from players table
        if (webAccount?.user) {
          const licenses = [
            webAccount.user.license,
            webAccount.user.license2,
          ].filter((l): l is string => Boolean(l?.trim()));
          if (licenses.length > 0) {
            const player = await prisma.players.findFirst({
              where: { license: { in: licenses } },
              orderBy: { last_updated: "desc" },
              select: { gang: true },
            });
            if (player?.gang) {
              try {
                token.gang = JSON.parse(player.gang as string) as {
                  label: string;
                  name: string;
                  isboss: boolean;
                  bankAuth: boolean;
                  grade: { level: number; name: string };
                };
              } catch {
                token.gang = null;
              }
            } else {
              token.gang = null;
            }
          }
        }
      }

      if (token.provider === "discord" && token.isRegistered === false) {
        return null;
      }

      return token;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      if (url.startsWith(baseUrl)) {
        if (url.startsWith(`${baseUrl}/auth/setup`)) {
          return url;
        }
        if (
          url === baseUrl ||
          url === `${baseUrl}/` ||
          url === `${baseUrl}/auth` ||
          url.startsWith(`${baseUrl}/auth`)
        ) {
          return `${baseUrl}/dashboard`;
        }
        return url;
      }
      return baseUrl;
    },
  },
  pages: {
    signIn: "/auth",
  },
  session: { strategy: "jwt" },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
