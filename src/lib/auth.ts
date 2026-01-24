import NextAuth, { type NextAuthConfig } from "next-auth";
import Discord from "next-auth/providers/discord";

export const authOptions: NextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/discord`,
        },
      },
    }),
    // Note: Steam provider needs to be installed separately
    // Steam({
    //   clientId: process.env.STEAM_API_KEY!,
    // }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.provider = token.provider as string;
        session.user.discordId = token.discordId ?? null;
        session.user.discordUsername = token.discordUsername ?? null;
        session.user.discordName = token.discordName ?? null;
        session.user.discordEmail = token.discordEmail ?? null;
        session.user.discordImage = token.discordImage ?? null;
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
          token.discordUsername = discordProfile?.username ?? token.discordUsername ?? null;
          token.discordName = discordProfile?.global_name ?? user?.name ?? token.discordName ?? null;
          token.discordEmail = discordProfile?.email ?? user?.email ?? token.discordEmail ?? null;
          token.discordImage = discordProfile?.image_url ?? user?.image ?? token.discordImage ?? null;
        }
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth",
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
