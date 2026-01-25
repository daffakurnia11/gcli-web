# ===== Base =====
FROM node:22-alpine AS base
WORKDIR /app

# Enable corepack (pnpm)
RUN corepack enable

# ===== Dependencies =====
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ===== Build =====
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm exec prisma generate
RUN pnpm build

# ===== Production =====
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Non-root user
RUN addgroup -g 1001 nodejs \
  && adduser -u 1001 -G nodejs -s /bin/sh -D nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs
EXPOSE 3000

CMD ["pnpm", "start"]
