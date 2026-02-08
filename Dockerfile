FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma
COPY prisma.config.ts ./
ENV NEXT_TELEMETRY_DISABLED=1

# Consume build args passed by CapRover to avoid "not consumed" warnings.
ARG ALLOW_DISCORD_CHANGE
ARG ALLOW_FIVEM_CHANGE
ARG AUTH_SECRET
ARG CAPROVER_GIT_COMMIT_SHA
ARG DATABASE_URL
ARG DISCORD_API_BASE_URL
ARG DISCORD_API_INVITE_CODE
ARG DISCORD_CLIENT_ID
ARG DISCORD_CLIENT_SECRET
ARG FIVEM_API_BASE_URL
ARG FIVEM_ASSETS_URL
ARG FIVEM_CONNECT_ADDRESS
ARG INDONESIA_REGIONAL_API_BASE_URL
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_DISCORD_INVITE
ARG NEXT_PUBLIC_FIVEM_ASSETS_URL
ARG STEAM_API_KEY

# Expose only build-relevant/public vars to the Next build layer.
ENV FIVEM_ASSETS_URL=$FIVEM_ASSETS_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_DISCORD_INVITE=$NEXT_PUBLIC_DISCORD_INVITE
ENV NEXT_PUBLIC_FIVEM_ASSETS_URL=$NEXT_PUBLIC_FIVEM_ASSETS_URL

# prisma generate setelah schema sudah ada
RUN pnpm exec prisma generate

COPY . .

# build next
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# standalone output: copy only the server bundle + static assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
