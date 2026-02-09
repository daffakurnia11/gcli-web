# AGENTS.md

## Repository Knowledge Base: `gcli-next`

This document is a detailed, practical map of the repository for future agents and maintainers.

## 1) Project identity and stack

- Project: `gcli-next`
- Purpose: Web dashboard + public website + API layer for GCLI (FiveM community/league)
- Framework: Next.js App Router (`next@16.1.3`)
- Bundler: Turbopack (`next dev --turbopack`, `next build --turbopack`)
- Language: TypeScript (`strict: true`)
- UI: Tailwind CSS v4 + custom design system
- Auth: NextAuth v5 beta (Credentials + Discord OAuth)
- Data layer: Prisma + MySQL
- Fetching: SWR for client GET requests
- API docs: OpenAPI generation + ReDoc at `/api/docs`
- Tests: Vitest (`src/services/__tests__`)

## 2) Core scripts

- `pnpm dev`: run dev server (Turbopack)
- `pnpm build`: production build (Turbopack)
- `pnpm start`: serve production build
- `pnpm lint`: ESLint
- `pnpm typecheck`: `tsc --noEmit`
- `pnpm test`: Vitest
- `pnpm check`: lint + typecheck + test

## 3) Runtime/config files

- `next.config.ts`
  - `output: "standalone"`
  - image remote patterns include Discord CDN and `assets.gclindonesia.com`
  - Prisma client tracing included for deployment
- `middleware.ts`
  - validates env via `getEnv()`
  - injects `x-request-id`
  - rewrites `/api/v1/*` -> `/api/*`
  - protects dashboard/admin/auth setup flows
- `.env.example`
  - app, auth, Discord OAuth, FiveM, Indonesia regional API, DB, feature flags

## 4) Environment variables (used in app)

- App:
  - `NEXT_PUBLIC_APP_URL`
  - `NODE_ENV`
- Auth:
  - `AUTH_SECRET` and/or `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL`
- Discord:
  - `DISCORD_CLIENT_ID`
  - `DISCORD_CLIENT_SECRET`
  - `DISCORD_API_BASE_URL`
  - `DISCORD_API_INVITE_CODE`
  - `NEXT_PUBLIC_DISCORD_INVITE`
- FiveM:
  - `FIVEM_API_BASE_URL`
  - `FIVEM_API_BASE` (also referenced in gang member live status flow)
  - `FIVEM_CONNECT_ADDRESS`
- Indonesia API:
  - `INDONESIA_REGIONAL_API_BASE_URL`
- DB:
  - `DATABASE_URL`
- Feature flags:
  - `ALLOW_FIVEM_CHANGE`
  - `ALLOW_DISCORD_CHANGE`
- Optional rate-limit backend:
  - Upstash Redis environment variables (read by `src/services/rate-limit.ts`)

## 5) High-level architecture

### UI route groups

- Public group: `src/app/(public)`
  - landing/home, about, auth, auth setup
- Dashboard group: `src/app/(dashboard)`
  - overview, profile, settings, bank, character, kill-log, team, admin
- Demo group: `src/app/demo`
  - design system playground

### API route group

- `src/app/api/**`
  - account checks, auth flows, register, user APIs, admin APIs, docs/openapi, info services

### Service layer

- `src/services/*`
  - API response standardization
  - API client/fetcher/SWR wrappers
  - auth guards/policies/repositories
  - env validation, logging, rate limiting
  - openapi generation

### Domain typing

- Global API/domain types in `src/types/api/*.d.ts`
- UI/component/provider types in `src/types/*.d.ts` and `src/types/components/*`

## 6) API response standard

Implemented in `src/services/api-response.ts` and used via `apiFromLegacy` and explicit helpers.

Envelope conventions:
- Success:
  - `success: true`
  - `code`
  - `message`
  - optional `metadata` (`page`, `limit`, `count`, `total`)
  - `data`
- Error:
  - `success: false`
  - `code`
  - `message`
  - optional `data` (suppressed for 500 in production)

Also standardized:
- Method-not-allowed handlers per route
- Helpers for common statuses (`400,401,403,404,405,409,422,429,500`)

## 7) Data fetching conventions

- GET from client: use `useApiSWR` (`src/services/swr.ts`)
- Non-GET mutations: use dedicated service hook files under `src/services/hooks/api`
- Fetch parsing and envelope handling: `src/services/api-client.ts`

## 8) Auth/session model

- NextAuth config in `src/lib/auth.ts`
- Providers:
  - Credentials
  - Discord OAuth
- JWT/session enrichments include:
  - web account identity
  - registration status
  - username/license/fivem fields
  - gang and charinfo context from `players`
- Middleware enforces:
  - unauthenticated users redirected from dashboard/admin to `/auth`
  - setup funnel for unregistered accounts
  - admin access gated by `token.optin === true`

## 9) Prisma/data model domains

Schema file: `prisma/schema.prisma`

Primary domains used by this app:
- Web auth/account:
  - `web_accounts`, `web_profiles`, `web_discord_accounts`, `web_sessions`, `users`
- Character/gameplay:
  - `players`, `player_transactions`, `bank_accounts_new`
- Team/gang:
  - `tl_gangs`, `tl_gang_grades`, `player_groups`
- Investment/business:
  - `tl_businesses`, `bank_accounts_new`
- Kill logs:
  - `tl_kill_logs`

There are many additional FiveM-related legacy tables in schema; only a subset is actively used by routes above.

## 10) Complete feature inventory (App routes)

### Public + auth UX

- `/` -> `src/app/(public)/page.tsx`
- `/about` -> `src/app/(public)/about/page.tsx`
- `/auth` -> `src/app/(public)/auth/page.tsx`
- `/auth/setup` -> `src/app/(public)/auth/setup/page.tsx`

### Dashboard UX

- `/dashboard` -> `src/app/(dashboard)/dashboard/page.tsx`
- `/dashboard/profile` -> `src/app/(dashboard)/profile/page.tsx`
- `/dashboard/settings` -> `src/app/(dashboard)/settings/page.tsx`
- `/dashboard/character` -> `src/app/(dashboard)/character/page.tsx`
- `/dashboard/bank/personal` -> `src/app/(dashboard)/bank/personal/page.tsx`
- `/dashboard/bank/team` -> `src/app/(dashboard)/bank/team/page.tsx`
- `/dashboard/bank/investment` -> `src/app/(dashboard)/bank/investment/page.tsx`
- `/dashboard/bank/investment/[id]` -> `src/app/(dashboard)/bank/investment/[id]/page.tsx`
- `/dashboard/inventory/personal` -> `src/app/(dashboard)/inventory/personal/page.tsx`
- `/dashboard/inventory/team` -> `src/app/(dashboard)/inventory/team/page.tsx`
- `/dashboard/kill-log/kill` -> `src/app/(dashboard)/kill-log/kill/page.tsx`
- `/dashboard/kill-log/dead` -> `src/app/(dashboard)/kill-log/dead/page.tsx`
- `/dashboard/team/info` -> `src/app/(dashboard)/team/info/page.tsx`
- `/dashboard/team/members` -> `src/app/(dashboard)/team/members/page.tsx`

### Admin UX

- `/admin/overview` -> `src/app/(dashboard)/admin/overview/page.tsx`
- `/admin/investment` -> `src/app/(dashboard)/admin/investment/page.tsx`
- `/admin/investment/detail` -> `src/app/(dashboard)/admin/investment/detail/page.tsx`

### Docs + demo

- `/api/docs` -> `src/app/api/docs/page.tsx` (ReDoc UI)
- `/demo` -> `src/app/demo/page.tsx`

## 11) Complete feature inventory (API endpoints)

All routes are under `src/app/api/**`.

### Account/auth setup

- `GET /api/account/unique-check`
- `POST /api/register`
- `POST /api/auth/register` (delegates register)
- `GET /api/auth/connect/discord`
- `GET /api/auth/connect/discord/callback`
- `GET|POST /api/auth/[...nextauth]` (via NextAuth handlers)

### User account management

- `GET /api/user/account`
- `DELETE /api/user/account`
- `PUT /api/user/profile`
- `PUT /api/user/email`
- `PUT /api/user/password`
- `POST /api/user/discord/connect`
- `POST /api/user/discord/disconnect`
- `GET /api/user/sessions`
- `DELETE /api/user/sessions/[id]`
- `POST /api/user/sessions/revoke-all`

### User gameplay/banking/team

- `GET /api/user/character`
- `GET /api/user/bank/personal`
- `GET /api/user/bank/team`
- `GET /api/user/bank/investments`
- `GET /api/user/bank/investments/[id]/transactions`
- `GET /api/user/kill-logs`
- `GET /api/user/gang`
- `GET /api/user/gang/members`
- `PATCH /api/user/gang/members/[citizenId]`
- `DELETE /api/user/gang/members/[citizenId]`
- `POST /api/user/gang/members/recruit`
- `GET /api/user/inventory/team`

### Admin

- `GET /api/admin/gangs`
- `GET /api/admin/investment/categories`
- `GET /api/admin/investment/detail`
- `PATCH /api/admin/investment/assign`
- `GET /api/admin/investment/gang-ownership`

### External info and utility

- `GET /api/info/fivem`
- `GET /api/info/discord`
- `GET /api/indonesia/provinces`
- `GET /api/indonesia/cities/[provinceId]`
- `GET /api/openapi`

## 12) Service layer inventory and responsibilities

### Core API infra

- `src/services/api-response.ts`
  - envelope helpers, legacy conversion, pagination metadata extraction
- `src/services/api-client.ts`
  - client-side response parsing and typed errors
- `src/services/swr.ts`
  - `apiFetcher`, `useApiSWR`
- `src/services/next-response.ts`
  - wrapper/re-export utility for NextResponse usage consistency

### Security/guarding/policy

- `src/services/api-guards.ts`
  - auth guard helpers (`requireAccountId`, `requireAdminSession`)
- `src/services/policies/gang-members.policy.ts`
  - gang member authorization policy decisions
- `src/services/rate-limit.ts`
  - rate limiting (Upstash Redis + fallback)

### Operational concerns

- `src/services/env.ts`
  - runtime env validation
- `src/services/logger.ts`
  - structured logging helper
- `src/services/openapi.ts`
  - OpenAPI spec builder by scanning route files

### Data/repository

- `src/services/repositories/admin-investment.repository.ts`
  - admin investment queries and write utilities

### Utility helpers

- `src/services/date.ts`
  - global date-only / datetime formatters
- `src/services/json.ts`
  - safe JSON parsing with fallback

### API call hooks

- `src/services/hooks/api/useAccountApi.ts`
- `src/services/hooks/api/useAdminInvestmentApi.ts`
- `src/services/hooks/api/useAuthSetupApi.ts`
- `src/services/hooks/api/useOpenApiSpec.ts`
- `src/services/hooks/api/useServerInfo.ts`
- `src/services/hooks/api/useTeamMembersApi.ts`
- `src/services/hooks/useIndonesiaRegions.ts`
- `src/services/hooks/useUniqueCheck.ts`

## 13) UI component system inventory

- Global buttons: `src/components/button/*`
  - `Button.Primary`, `Button.Secondary`, `Button.Slant`
- Global typography: `src/components/typography/*`
  - `Typography.Heading`, `Typography.Paragraph`, `Typography.Small`
- Forms: `src/components/form/*`
- Tables/pagination: `src/components/table/*`
- Modals: `src/components/modal/*`
- Dashboard composition components:
  - `src/app/(dashboard)/_components/dashboard/*`

## 14) Type system inventory

- API domain globals: `src/types/api/*.d.ts`
  - split between payload and response domains
- Component/form/ui types:
  - `src/types/Button.d.ts`, `src/types/Form.d.ts`, `src/types/Typography.d.ts`, etc.
- NextAuth module augmentation:
  - `src/types/next-auth.d.ts`

## 15) Testing inventory

- `src/services/__tests__/api-response.test.ts`
- `src/services/__tests__/rate-limit.test.ts`
- `src/services/__tests__/gang-members.policy.test.ts`
- `src/services/__tests__/admin-investment.repository.test.ts`
- `src/services/__tests__/env.test.ts`

Coverage emphasis is currently service-layer behavior.

## 16) Current architectural rules and conventions

- Do not call Prisma directly from pages/components.
  - Prisma belongs in API routes (and repositories/services used by routes).
- Client GET fetches should use SWR (`useApiSWR`).
- Mutation calls should be in dedicated hooks under `src/services/hooks/api`.
- All API responses should conform to standardized envelope via `apiFromLegacy` or explicit helpers.
- Include method-not-allowed handlers for unsupported methods in route files.
- Prefer global Button/Typography components over raw HTML controls in app-level UI.

## 17) Operational notes for future agents

- Before touching endpoints, check `src/services/openapi.ts` because docs are generated from route scans.
- If you add a new route, verify:
  - response envelope
  - rate limit needs
  - auth guard/policy needs
  - SWR/mutation hook wiring on client side
  - global type updates in `src/types/api`
- Always validate with:
  - `pnpm run check`

## 18) Known improvement opportunities

- Continue migrating remaining raw `<button>` / text tags in app-level UI to global components.
- Expand tests from service layer to selected API route handlers.
- Add endpoint-specific schemas/examples in OpenAPI for richer docs (currently generalized envelope models).
- Keep auth/session token enrichment logic in `src/lib/auth.ts` maintainable by extracting smaller helper units.

## 19) Exhaustive app feature/file inventory (no omissions)

This section is the full inventory of everything currently inside `src/app`.

### Root app files

- `src/app/layout.tsx`
- `src/app/styles.css`
- `src/app/icon.png`

### Dashboard app group (`src/app/(dashboard)`)

#### Shared dashboard UI components

- `src/app/(dashboard)/_components/dashboard/AccountLinkage.tsx`
- `src/app/(dashboard)/_components/dashboard/Alert.tsx`
- `src/app/(dashboard)/_components/dashboard/DangerZone.tsx`
- `src/app/(dashboard)/_components/dashboard/DashboardCard.tsx`
- `src/app/(dashboard)/_components/dashboard/DashboardSection.tsx`
- `src/app/(dashboard)/_components/dashboard/DashboardShell.tsx`
- `src/app/(dashboard)/_components/dashboard/EmailSettings.tsx`
- `src/app/(dashboard)/_components/dashboard/PasswordSettings.tsx`
- `src/app/(dashboard)/_components/dashboard/ProfileSection.tsx`
- `src/app/(dashboard)/_components/dashboard/RegistrationCleanup.tsx`
- `src/app/(dashboard)/_components/dashboard/ServerStatusCards.tsx`
- `src/app/(dashboard)/_components/dashboard/SettingsGroup.tsx`
- `src/app/(dashboard)/_components/dashboard/SidebarUserMenu.tsx`
- `src/app/(dashboard)/_components/dashboard/UserStatsCard.tsx`
- `src/app/(dashboard)/_components/dashboard/index.tsx`

#### Dashboard admin features

- `src/app/(dashboard)/admin/overview/page.tsx`
- `src/app/(dashboard)/admin/investment/page.tsx`
- `src/app/(dashboard)/admin/investment/_components/InvestmentCategoryOverview.tsx`
- `src/app/(dashboard)/admin/investment/detail/page.tsx`
- `src/app/(dashboard)/admin/investment/detail/_components/InvestmentCategoryDetailTable.tsx`

#### Dashboard bank features

- `src/app/(dashboard)/bank/personal/page.tsx`
- `src/app/(dashboard)/bank/team/page.tsx`
- `src/app/(dashboard)/bank/investment/page.tsx`
- `src/app/(dashboard)/bank/investment/[id]/page.tsx`

#### Dashboard character features

- `src/app/(dashboard)/character/page.tsx`
- `src/app/(dashboard)/character/_components/CharacterInfo.tsx`
- `src/app/(dashboard)/character/_components/CharacterStatus.tsx`
- `src/app/(dashboard)/character/_components/StatusBar.tsx`

#### Dashboard inventory features

- `src/app/(dashboard)/inventory/personal/page.tsx`
- `src/app/(dashboard)/inventory/team/page.tsx`

#### Dashboard kill log features

- `src/app/(dashboard)/kill-log/kill/page.tsx`
- `src/app/(dashboard)/kill-log/dead/page.tsx`

#### Dashboard team features

- `src/app/(dashboard)/team/info/page.tsx`
- `src/app/(dashboard)/team/members/page.tsx`

#### Dashboard account area

- `src/app/(dashboard)/dashboard/page.tsx`
- `src/app/(dashboard)/profile/page.tsx`
- `src/app/(dashboard)/settings/page.tsx`
- `src/app/(dashboard)/layout.tsx`

### Public app group (`src/app/(public)`)

#### Public shared components

- `src/app/(public)/_components/GameLoop.tsx`
- `src/app/(public)/_components/Hero.tsx`
- `src/app/(public)/_components/HomeCTA.tsx`
- `src/app/(public)/_components/ServerInfo.tsx`
- `src/app/(public)/_components/Standings.tsx`
- `src/app/(public)/_components/TeamCarousel.tsx`

#### Public pages

- `src/app/(public)/page.tsx`
- `src/app/(public)/layout.tsx`

#### Public about features

- `src/app/(public)/about/page.tsx`
- `src/app/(public)/about/_components/CorePillars.tsx`
- `src/app/(public)/about/_components/Description.tsx`
- `src/app/(public)/about/_components/PlayerToDo.tsx`
- `src/app/(public)/about/_components/ProsCons.tsx`
- `src/app/(public)/about/_components/Title.tsx`
- `src/app/(public)/about/_components/Vision.tsx`

#### Public auth features

- `src/app/(public)/auth/page.tsx`
- `src/app/(public)/auth/_components/Login.tsx`

#### Public auth setup flow

- `src/app/(public)/auth/setup/page.tsx`
- `src/app/(public)/auth/setup/layout.tsx`
- `src/app/(public)/auth/setup/_components/AccountLink.tsx`
- `src/app/(public)/auth/setup/_components/AccountLinkWrapper.tsx`
- `src/app/(public)/auth/setup/_components/Credentials.tsx`
- `src/app/(public)/auth/setup/_components/Information.tsx`
- `src/app/(public)/auth/setup/_components/Stepper.tsx`

### API app group (`src/app/api`)

#### API docs and spec

- `src/app/api/docs/page.tsx`
- `src/app/api/openapi/route.ts`

#### API auth and registration

- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/api/auth/connect/discord/route.ts`
- `src/app/api/auth/connect/discord/callback/route.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/api/register/route.ts`

#### API account checks

- `src/app/api/account/unique-check/route.ts`

#### API region info

- `src/app/api/indonesia/provinces/route.ts`
- `src/app/api/indonesia/cities/[provinceId]/route.ts`

#### API server/community info

- `src/app/api/info/fivem/route.ts`
- `src/app/api/info/discord/route.ts`

#### API admin features

- `src/app/api/admin/gangs/route.ts`
- `src/app/api/admin/investment/categories/route.ts`
- `src/app/api/admin/investment/detail/route.ts`
- `src/app/api/admin/investment/assign/route.ts`
- `src/app/api/admin/investment/gang-ownership/route.ts`

#### API user features

- `src/app/api/user/account/route.ts`
- `src/app/api/user/profile/route.ts`
- `src/app/api/user/email/route.ts`
- `src/app/api/user/password/route.ts`
- `src/app/api/user/discord/connect/route.ts`
- `src/app/api/user/discord/disconnect/route.ts`
- `src/app/api/user/sessions/route.ts`
- `src/app/api/user/sessions/[id]/route.ts`
- `src/app/api/user/sessions/revoke-all/route.ts`
- `src/app/api/user/character/route.ts`
- `src/app/api/user/kill-logs/route.ts`
- `src/app/api/user/bank/personal/route.ts`
- `src/app/api/user/bank/team/route.ts`
- `src/app/api/user/bank/investments/route.ts`
- `src/app/api/user/bank/investments/[id]/transactions/route.ts`
- `src/app/api/user/gang/route.ts`
- `src/app/api/user/gang/members/route.ts`
- `src/app/api/user/gang/members/[citizenId]/route.ts`
- `src/app/api/user/gang/members/recruit/route.ts`
- `src/app/api/user/inventory/team/route.ts`

### Demo app group (`src/app/demo`)

- `src/app/demo/page.tsx`
- `src/app/demo/_components/ButtonDemo.tsx`
- `src/app/demo/_components/ColorPaletteDemo.tsx`
- `src/app/demo/_components/FormDemo.tsx`
- `src/app/demo/_components/LeftSlantButtonDemo.tsx`
- `src/app/demo/_components/LogoDemo.tsx`
- `src/app/demo/_components/PrimaryButtonDemo.tsx`
- `src/app/demo/_components/RightSlantButtonDemo.tsx`
- `src/app/demo/_components/SecondaryButtonDemo.tsx`
- `src/app/demo/_components/TypographyDemo.tsx`

### Empty/placeholder app directories currently present

- `src/app/(public)/docs` (directory exists, no files currently)
- `src/app/(public)/kills` (directory exists, no files currently)
- `src/app/api/assets` (directory exists, no files currently)
