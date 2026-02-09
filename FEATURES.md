# FEATURES.md

This document explains every page and feature currently implemented in `src/app` for `gcli-next`.

## 1) App entry and global structure

- `/src/app/layout.tsx`
  - Root application layout for all route groups.
  - Provides global wrappers/providers and shared app shell behavior.

- `/src/app/styles.css`
  - Global design tokens, utility styles, and base CSS behavior.

- `/src/app/icon.png`
  - App icon asset used by Next.js metadata.

## 2) Public pages and features (`src/app/(public)`)

### 2.1 Public layouts

- `/src/app/(public)/layout.tsx`
  - Public-site layout wrapper.
  - Hosts shared public UI structure (navigation/footer shell behavior).

### 2.2 Public home page

- `/src/app/(public)/page.tsx` (`/`)
  - Public landing page.
  - Assembles hero/CTA/standings/server-highlight content.

### 2.3 About page

- `/src/app/(public)/about/page.tsx` (`/about`)
  - Explains GCLI ecosystem, objectives, and player onboarding context.

### 2.4 Auth pages

- `/src/app/(public)/auth/page.tsx` (`/auth`)
  - Login/entry point into authenticated dashboard.

### 2.5 Auth setup flow

- `/src/app/(public)/auth/setup/layout.tsx`
  - Setup wizard-specific layout.

- `/src/app/(public)/auth/setup/page.tsx` (`/auth/setup`)
  - Multi-step account setup flow for new/unregistered users.

### 2.6 Public placeholders currently present

- `/src/app/(public)/docs` (directory exists, no page file yet)
- `/src/app/(public)/kills` (directory exists, no page file yet)

## 3) Dashboard pages and features (`src/app/(dashboard)`)

### 3.1 Dashboard layout and shell

- `/src/app/(dashboard)/layout.tsx`
  - Main authenticated dashboard layout.
  - Applies dashboard shell/navigation and guarded area structure.

### **Behavior & Rules**

* **Data**
  * No direct API calls in layout file; child pages fetch data.

* **Actions**
  * None directly in layout.

* **Permissions**
  * Middleware protects `/dashboard/**` and redirects unauthenticated users to `/auth`.

* **Constraints & Validation**
  * Unregistered authenticated users are redirected by middleware to `/auth/setup?step=1`.

* **DB Tables / Prisma Models**
  * Indirect only through child pages and API routes.

* **Common Errors**
  * `401` equivalent behavior is redirect to `/auth` at middleware layer.

* **Notes / Edge Cases**
  * UI depends on JWT token state from NextAuth middleware checks.

### 3.2 Dashboard overview page

- `/src/app/(dashboard)/dashboard/page.tsx` (`/dashboard`)
  - Personal overview page after login.
  - Fetches account summary and renders profile/server status widgets.

### **Behavior & Rules**

* **Data**
  * `GET /api/user/account` via `useApiSWR`.

* **Actions**
  * No mutation on this page.

* **Permissions**
  * Dashboard route protection via middleware.
  * `GET /api/user/account` is guarded by `requireAccountId`.

* **Constraints & Validation**
  * Feature flags come from API response (`allowFivemChange`, `allowDiscordChange`).

* **DB Tables / Prisma Models**
  * `web_accounts`, `web_profiles`, `web_discord_accounts`, `users` (through API).

* **Common Errors**
  * `401`: no valid account token.
  * `500`: account fetch failure.

* **Notes / Edge Cases**
  * SWR fetch; page may render partial/empty while loading.

### 3.3 Profile page

- `/src/app/(dashboard)/profile/page.tsx` (`/dashboard/profile`)
  - Profile management area.
  - Uses `/api/user/account` data and mutation hooks for edits/linkage.

### **Behavior & Rules**

* **Data**
  * `GET /api/user/account` via `useApiSWR`.

* **Actions**
  * Profile edit uses `PUT /api/user/profile`.
  * Discord connect uses `POST /api/user/discord/connect`.
  * Discord disconnect uses `POST /api/user/discord/disconnect`.

* **Permissions**
  * Middleware-protected page.
  * APIs guarded by `requireAccountId`.

* **Constraints & Validation**
  * Profile update validates gender and birth date in API.
  * Discord connect requires Discord ID payload.
  * Feature flags control whether linkage/name changes are available.

* **DB Tables / Prisma Models**
  * `web_accounts`, `web_profiles`, `web_discord_accounts`.

* **Common Errors**
  * `400`: invalid payload/gender/date/missing discord id.
  * `401`: unauthorized.
  * `500`: internal DB/API failures.

* **Notes / Edge Cases**
  * Discord OAuth callback injects `discord_data` query; linkage UI consumes it.

### 3.4 Settings page

- `/src/app/(dashboard)/settings/page.tsx` (`/dashboard/settings`)
  - Security/account settings page.
  - Contains email/password and destructive-account actions.

### **Behavior & Rules**

* **Data**
  * `GET /api/user/account` for current email display.

* **Actions**
  * `PUT /api/user/email`.
  * `PUT /api/user/password`.
  * `DELETE /api/user/account`.

* **Permissions**
  * Middleware-protected page.
  * APIs guarded by `requireAccountId`.

* **Constraints & Validation**
  * Email and password updates verify current password.
  * Email uniqueness enforced.
  * Rate limiting on email/password/account delete routes.

* **DB Tables / Prisma Models**
  * `web_accounts`, `web_profiles`, `web_discord_accounts`, `web_sessions`, `users`.

* **Common Errors**
  * `400`: missing password/password not set.
  * `401`: wrong password/unauthorized.
  * `409`: email already in use.
  * `429`: rate limit hit.
  * `500`: internal error.

* **Notes / Edge Cases**
  * Account delete removes linked rows in transaction and may delete linked `users` row.

### 3.5 Character page

- `/src/app/(dashboard)/character/page.tsx` (`/dashboard/character`)
  - Character information/status viewer.
  - Uses character API payload for identity, status bars, and metadata.

### **Behavior & Rules**

* **Data**
  * `GET /api/user/character`.

* **Actions**
  * No mutation.

* **Permissions**
  * Middleware-protected page.
  * API guarded by `requireAccountId` and account-to-citizen resolution.

* **Constraints & Validation**
  * If no linked player/citizen is found, API returns `400`.

* **DB Tables / Prisma Models**
  * `players`.

* **Common Errors**
  * `400`: no linked character/player record.
  * `401`: unauthorized.
  * `500`: parsing/query failure.

* **Notes / Edge Cases**
  * API parses multiple JSON fields (`money`, `charinfo`, `job`, `gang`, `metadata`, `inventory`).

### 3.6 Bank pages

- `/src/app/(dashboard)/bank/personal/page.tsx` (`/dashboard/bank/personal`)
- `/src/app/(dashboard)/bank/team/page.tsx` (`/dashboard/bank/team`)
- `/src/app/(dashboard)/bank/investment/page.tsx` (`/dashboard/bank/investment`)
- `/src/app/(dashboard)/bank/investment/[id]/page.tsx` (`/dashboard/bank/investment/:id`)

### **Behavior & Rules**

* **Data**
  * Personal: `GET /api/user/bank/personal?page&limit`.
  * Team: `GET /api/user/bank/team?page&limit`.
  * Investment list: `GET /api/user/bank/investments`.
  * Investment detail: `GET /api/user/bank/investments/:id/transactions?page&limit`.

* **Actions**
  * Read-only from dashboard pages.

* **Permissions**
  * Middleware-protected pages.
  * APIs guarded by `requireAccountId`; team/investment routes depend on gang context from session.

* **Constraints & Validation**
  * Pagination defaults to page `1`, limit `10`, max limit `100`.
  * Investment detail enforces ownership (`bank_accounts_new.creator === session gang`).

* **DB Tables / Prisma Models**
  * `player_transactions`, `players`, `bank_accounts_new`, `tl_businesses`.

* **Common Errors**
  * `401`: unauthorized.
  * `403`: no gang or cross-gang access attempt.
  * `404`: investment account not found.
  * `500`: query/parsing failures.

* **Notes / Edge Cases**
  * Many “not found / no gang” states intentionally return `200` with empty data and message.

### 3.7 Inventory pages

- `/src/app/(dashboard)/inventory/personal/page.tsx` (`/dashboard/inventory/personal`)
- `/src/app/(dashboard)/inventory/team/page.tsx` (`/dashboard/inventory/team`)

### **Behavior & Rules**

* **Data**
  * Personal page reads `GET /api/user/character` and derives inventory from character payload.
  * Team page reads `GET /api/user/inventory/team`.

* **Actions**
  * No mutations.

* **Permissions**
  * Middleware-protected pages.
  * Team inventory API guarded by `requireAccountId` and gang assignment checks.

* **Constraints & Validation**
  * Team inventory uses strict item-shape filtering before returning entries.

* **DB Tables / Prisma Models**
  * `players`, `ox_inventory` (raw query), gang data from `players.gang`.

* **Common Errors**
  * `401`: unauthorized.
  * `500`: parse/query failure.

* **Notes / Edge Cases**
  * Team inventory item images are generated using `FIVEM_ASSETS_URL` (fallback default URL).

### 3.8 Kill log pages

- `/src/app/(dashboard)/kill-log/kill/page.tsx` (`/dashboard/kill-log/kill`)
- `/src/app/(dashboard)/kill-log/dead/page.tsx` (`/dashboard/kill-log/dead`)

### **Behavior & Rules**

* **Data**
  * `GET /api/user/kill-logs?type=kill|dead&page&limit`.

* **Actions**
  * No mutations.

* **Permissions**
  * Middleware-protected pages.
  * API guarded by `requireAccountId` and account-to-citizen resolution.

* **Constraints & Validation**
  * `type` defaults to `kill` if invalid/missing.
  * Pagination defaults page `1`, limit `10`, max `100`.

* **DB Tables / Prisma Models**
  * `tl_kill_logs`.

* **Common Errors**
  * `401`: unauthorized.
  * `500`: query failure.

* **Notes / Edge Cases**
  * No linked player returns `200` with empty records + message.

### 3.9 Team pages

- `/src/app/(dashboard)/team/info/page.tsx` (`/dashboard/team/info`)
- `/src/app/(dashboard)/team/members/page.tsx` (`/dashboard/team/members`)

### **Behavior & Rules**

* **Data**
  * Team info: `GET /api/user/gang`.
  * Team members: `GET /api/user/gang/members`.

* **Actions**
  * Team members page mutations:
    - `PATCH /api/user/gang/members/:citizenId` (grade change)
    - `DELETE /api/user/gang/members/:citizenId` (remove)
    - `POST /api/user/gang/members/recruit` (recruit)

* **Permissions**
  * Middleware-protected pages.
  * APIs guarded by `requireAccountId`.
  * Gang management permissions enforced by `gang-members.policy.ts` and actor gang/boss/grade checks.

* **Constraints & Validation**
  * Boss-only management.
  * Cannot modify self.
  * Cannot manage equal/higher grade targets.
  * Recruit flow blocks if target is online (must recruit in-game).

* **DB Tables / Prisma Models**
  * `players`, `player_groups`, `tl_gangs`, `tl_gang_grades`, `web_accounts`.

* **Common Errors**
  * `400`: invalid citizen/grade/self action/already in gang/online recruit.
  * `401`: unauthorized.
  * `403`: insufficient permissions or no gang.
  * `404`: target player/member not found.
  * `500`: transactional/query failure.

* **Notes / Edge Cases**
  * Online/offline status in list/recruit depends on `players.json` fetch if FiveM base URL is configured.

### 3.10 Admin pages

- `/src/app/(dashboard)/admin/overview/page.tsx` (`/admin/overview`)
- `/src/app/(dashboard)/admin/investment/page.tsx` (`/admin/investment`)
- `/src/app/(dashboard)/admin/investment/detail/page.tsx` (`/admin/investment/detail`)

### **Behavior & Rules**

* **Data**
  * Overview currently static message UI.
  * Investment overview/detail pages fetch from admin APIs via client components.

* **Actions**
  * Detail page supports assign/unassign business to gang through `PATCH /api/admin/investment/assign`.

* **Permissions**
  * Server-side page guard uses `auth()` and redirects when `session.user.optin !== true`.
  * Middleware also gates `/admin/**` by `token.optin === true`.

* **Constraints & Validation**
  * Admin APIs enforce `requireAdminSession`.
  * Assign endpoint validates payload with Zod.

* **DB Tables / Prisma Models**
  * `tl_businesses`, `bank_accounts_new`, `tl_gangs`, `player_groups`.

* **Common Errors**
  * `401`: not authenticated.
  * `403`: not admin (`optin` false).
  * `400/404/422`: invalid assign/filter params.
  * `500`: internal errors.

* **Notes / Edge Cases**
  * Admin detail API pagination defaults page `1`, limit `10`, max `100`.

### 3.11 Shared dashboard building blocks

- `/src/app/(dashboard)/_components/dashboard/*`
  - Shared reusable dashboard UI components.

### **Behavior & Rules**

* **Data**
  * Components consume props and hooks from parent pages.

* **Actions**
  * Some components trigger API mutations (ProfileSection, EmailSettings, PasswordSettings, DangerZone, AccountLinkage).

* **Permissions**
  * Effective permissions come from parent pages + API guards.

* **Constraints & Validation**
  * UI-level validation exists in forms; authoritative validation is API-side.

* **DB Tables / Prisma Models**
  * Indirect via API endpoints listed above.

* **Common Errors**
  * Surfaces API errors via alert text.

* **Notes / Edge Cases**
  * Multiple components still force hard refresh after mutation (`window.location.reload()`).

## 4) API pages and backend features (`src/app/api`)

### 4.1 API documentation features

- `/src/app/api/docs/page.tsx` (`GET /api/docs`)
- `/src/app/api/openapi/route.ts` (`GET /api/openapi`)

### **Behavior & Rules**

* **Data**
  * `/api/docs` renders ReDoc and fetches spec from `/api/openapi`.
  * `/api/openapi` returns generated OpenAPI document from route scan.

* **Actions**
  * Read-only.

* **Permissions**
  * Public.

* **Constraints & Validation**
  * OpenAPI generation reflects file-scanned routes and method exports.

* **DB Tables / Prisma Models**
  * None.

* **Common Errors**
  * `500`: spec generation/runtime failure.
  * `405`: unsupported methods on `/api/openapi`.

* **Notes / Edge Cases**
  * ReDoc script is loaded client-side from CDN.

### 4.2 Account pre-check/registration features

- `/src/app/api/account/unique-check/route.ts` (`GET /api/account/unique-check`)

### **Behavior & Rules**

* **Data**
  * Query params: `type` (`username|email|discord`), `value`.
  * Returns `{ exists: boolean }` in envelope.

* **Actions**
  * Read-only uniqueness checks.

* **Permissions**
  * Public.

* **Constraints & Validation**
  * Missing/invalid `type` or empty `value` -> `400`.
  * Rate-limited (`60/min` per configured key).

* **DB Tables / Prisma Models**
  * `web_accounts`, `users`, `web_profiles`.

* **Common Errors**
  * `400`: missing/invalid query params.
  * `429`: rate limit.
  * `500`: DB failure.

* **Notes / Edge Cases**
  * Discord check treats prefixed/non-prefixed IDs.

- `/src/app/api/register/route.ts` (`POST /api/register`)

### **Behavior & Rules**

* **Data**
  * Expects structured body: `accountInfo`, `credentials`, `socialConnections.discord`.

* **Actions**
  * Creates or upgrades `web_accounts` record.
  * Creates/updates `web_discord_accounts` and `web_profiles`.
  * Links or creates `users` row and binds `web_accounts.user_id`.

* **Permissions**
  * Public.

* **Constraints & Validation**
  * Zod schema validation (`apiUnprocessable` on invalid payload).
  * Email uniqueness required.
  * Discord account cannot be reused if already completed by another account.
  * Password hashed with bcrypt.
  * Rate-limited (`20/min`).

* **DB Tables / Prisma Models**
  * `web_accounts`, `web_discord_accounts`, `web_profiles`, `users`.

* **Common Errors**
  * `400`: email/discord conflicts or invalid business logic.
  * `422`: schema validation failure.
  * `429`: rate limit.
  * `500`: internal failure.

* **Notes / Edge Cases**
  * Supports completing placeholder discord-only accounts.

- `/src/app/api/auth/register/route.ts` (`POST /api/auth/register`)

### **Behavior & Rules**

* **Data**
  * Delegates directly to `/api/register` POST behavior.

* **Actions**
  * Same as `/api/register`.

* **Permissions**
  * Public.

* **Constraints & Validation**
  * Same constraints as `/api/register`.

* **DB Tables / Prisma Models**
  * Same as `/api/register`.

* **Common Errors**
  * Same status semantics as `/api/register`.

* **Notes / Edge Cases**
  * Compatibility alias endpoint.

### 4.3 NextAuth + Discord OAuth connect features

- `/src/app/api/auth/[...nextauth]/route.ts`

### **Behavior & Rules**

* **Data**
  * Handles NextAuth GET/POST auth flows.

* **Actions**
  * Session/auth cookie issuance and callback handling delegated to NextAuth handlers.

* **Permissions**
  * Public auth endpoint.

* **Constraints & Validation**
  * Behavior controlled by `src/lib/auth.ts` callbacks/providers.

* **DB Tables / Prisma Models**
  * `web_accounts`, `web_profiles`, `users`, `players` (via auth callbacks).

* **Common Errors**
  * `405` for non-supported methods.
  * Auth-specific redirect/null token outcomes handled by NextAuth.

* **Notes / Edge Cases**
  * JWT callback nulls token for unregistered discord provider users.

- `/src/app/api/auth/connect/discord/route.ts` (`GET /api/auth/connect/discord`)

### **Behavior & Rules**

* **Data**
  * Accepts optional `callbackUrl` query.

* **Actions**
  * Redirects to Discord OAuth authorize URL.

* **Permissions**
  * Public.

* **Constraints & Validation**
  * Requires `DISCORD_CLIENT_ID`; otherwise `500`.

* **DB Tables / Prisma Models**
  * None directly.

* **Common Errors**
  * `500`: missing config.
  * `405`: unsupported methods.

* **Notes / Edge Cases**
  * State parameter carries callback URL (base64url JSON).

- `/src/app/api/auth/connect/discord/callback/route.ts` (`GET /api/auth/connect/discord/callback`)

### **Behavior & Rules**

* **Data**
  * Consumes OAuth `code` and `state`.

* **Actions**
  * Exchanges code for token, fetches user profile from Discord.
  * Redirects to callback URL with encoded `discord_data` payload.

* **Permissions**
  * Public OAuth callback.

* **Constraints & Validation**
  * Requires `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET`.
  * Missing/failed token/profile exchange redirects with error code.

* **DB Tables / Prisma Models**
  * None directly.

* **Common Errors**
  * Redirect error states (`DiscordConnectError`, `DiscordTokenError`, `DiscordProfileError`, `DiscordConfigError`).
  * `405`: unsupported methods.

* **Notes / Edge Cases**
  * Default callback fallback is `/auth/setup?step=3`.

### 4.4 Indonesia regional data features

- `/src/app/api/indonesia/provinces/route.ts` (`GET /api/indonesia/provinces`)
- `/src/app/api/indonesia/cities/[provinceId]/route.ts` (`GET /api/indonesia/cities/:provinceId`)

### **Behavior & Rules**

* **Data**
  * Proxies external Indonesia regional API responses.

* **Actions**
  * Read-only proxy.

* **Permissions**
  * Public.

* **Constraints & Validation**
  * Uses `INDONESIA_REGIONAL_API_BASE_URL` with default fallback.

* **DB Tables / Prisma Models**
  * None.

* **Common Errors**
  * Upstream failures mapped to upstream status or `500`.
  * `405`: unsupported methods.

* **Notes / Edge Cases**
  * Returns external response shape via `apiFromLegacy`.

### 4.5 Public server/community info features

- `/src/app/api/info/fivem/route.ts` (`GET /api/info/fivem`)
- `/src/app/api/info/discord/route.ts` (`GET /api/info/discord`)

### **Behavior & Rules**

* **Data**
  * FiveM: combines `info.json` + `players.json` and returns transformed summary plus raw payload.
  * Discord: reads invite endpoint with counts and returns transformed summary plus raw payload.

* **Actions**
  * Read-only proxy/transform.

* **Permissions**
  * Public.

* **Constraints & Validation**
  * FiveM requires `FIVEM_API_BASE_URL`.
  * Discord requires `DISCORD_API_INVITE_CODE`.

* **DB Tables / Prisma Models**
  * None.

* **Common Errors**
  * `500`: missing env config or internal errors.
  * Upstream errors return upstream status where available.
  * `405`: unsupported methods.

* **Notes / Edge Cases**
  * API returns both normalized data and raw upstream payload.

### 4.6 User account/security features

- `/src/app/api/user/account/route.ts`

### **Behavior & Rules**

* **Data**
  * `GET /api/user/account` returns account/profile/discord/user summary + feature flags.

* **Actions**
  * `DELETE /api/user/account` removes discord/profile/sessions/account and linked user row (if present).

* **Permissions**
  * `requireAccountId` for both methods.

* **Constraints & Validation**
  * Delete is rate-limited (`5/min`).

* **DB Tables / Prisma Models**
  * `web_accounts`, `web_profiles`, `web_discord_accounts`, `web_sessions`, `users`.

* **Common Errors**
  * `401`: unauthorized.
  * `429`: delete rate-limited.
  * `500`: transaction/delete errors.

* **Notes / Edge Cases**
  * Deletes use transaction to satisfy FK dependencies.

- `/src/app/api/user/profile/route.ts` (`PUT /api/user/profile`)

### **Behavior & Rules**

* **Data**
  * Accepts profile fields including province/city IDs and names.

* **Actions**
  * Upserts `web_profiles` record for current account.

* **Permissions**
  * `requireAccountId`.

* **Constraints & Validation**
  * Birth date must parse to valid date.
  * Gender must be `male|female|null`.

* **DB Tables / Prisma Models**
  * `web_profiles`.

* **Common Errors**
  * `400`: invalid birth date/gender.
  * `401`: unauthorized.
  * `500`: DB failure.

* **Notes / Edge Cases**
  * Creates profile if missing; updates otherwise.

- `/src/app/api/user/email/route.ts` (`PUT /api/user/email`)

### **Behavior & Rules**

* **Data**
  * Expects `{ newEmail, password }`.

* **Actions**
  * Verifies current password, updates account email, resets `email_verified=false`.

* **Permissions**
  * `requireAccountId`.

* **Constraints & Validation**
  * Zod validation; rate-limited (`20/min`).
  * New email must be unique.

* **DB Tables / Prisma Models**
  * `web_accounts`.

* **Common Errors**
  * `400`: password not set.
  * `401`: wrong password/unauthorized.
  * `409`: email already in use.
  * `422`: invalid payload.
  * `429`: rate limit.
  * `500`: internal error.

* **Notes / Edge Cases**
  * Does not automatically send email verification in this route.

- `/src/app/api/user/password/route.ts` (`PUT /api/user/password`)

### **Behavior & Rules**

* **Data**
  * Expects `{ currentPassword, newPassword }`.

* **Actions**
  * Verifies old password and updates hashed password.

* **Permissions**
  * `requireAccountId`.

* **Constraints & Validation**
  * Zod validation (`newPassword` min length 8).
  * Rate-limited (`20/min`).

* **DB Tables / Prisma Models**
  * `web_accounts`.

* **Common Errors**
  * `400`: password not set.
  * `401`: wrong password/unauthorized.
  * `422`: invalid payload.
  * `429`: rate limit.
  * `500`: internal error.

* **Notes / Edge Cases**
  * Uses bcrypt compare/hash.

- `/src/app/api/user/discord/connect/route.ts` (`POST /api/user/discord/connect`)

### **Behavior & Rules**

* **Data**
  * Accepts Discord profile payload (`id`, username, name, email, image).

* **Actions**
  * Updates `web_accounts.discord_id` and upserts `web_discord_accounts`.

* **Permissions**
  * `requireAccountId`.

* **Constraints & Validation**
  * `id` is required; normalized to `discord:` prefix.

* **DB Tables / Prisma Models**
  * `web_accounts`, `web_discord_accounts`.

* **Common Errors**
  * `400`: missing Discord ID.
  * `401`: unauthorized.
  * `500`: internal error.

* **Notes / Edge Cases**
  * Connection source is generally OAuth callback payload.

- `/src/app/api/user/discord/disconnect/route.ts` (`POST /api/user/discord/disconnect`)

### **Behavior & Rules**

* **Data**
  * No body required.

* **Actions**
  * Deletes linked discord account row and nulls `web_accounts.discord_id`.

* **Permissions**
  * `requireAccountId`.

* **Constraints & Validation**
  * No additional validation.

* **DB Tables / Prisma Models**
  * `web_accounts`, `web_discord_accounts`.

* **Common Errors**
  * `401`: unauthorized.
  * `500`: internal error.

* **Notes / Edge Cases**
  * Safe if no row exists due `deleteMany` usage.

- `/src/app/api/user/sessions/route.ts` (`GET /api/user/sessions`)

### **Behavior & Rules**

* **Data**
  * Lists sessions for current account with `isCurrent` flag.

* **Actions**
  * Read-only.

* **Permissions**
  * `requireAccountId`.

* **Constraints & Validation**
  * Current session is derived from auth cookies.

* **DB Tables / Prisma Models**
  * `web_sessions`.

* **Common Errors**
  * `401`: unauthorized.
  * `500`: internal error.

* **Notes / Edge Cases**
  * Device/browser values are static placeholders.

- `/src/app/api/user/sessions/[id]/route.ts` (`DELETE /api/user/sessions/:id`)

### **Behavior & Rules**

* **Data**
  * Uses path `id` as session id.

* **Actions**
  * Deletes one owned session.

* **Permissions**
  * `requireAccountId`.

* **Constraints & Validation**
  * Session must belong to current account.
  * Invalid numeric ids return `400`.

* **DB Tables / Prisma Models**
  * `web_sessions`.

* **Common Errors**
  * `400`: invalid id.
  * `401`: unauthorized.
  * `404`: session not found for user.
  * `500`: internal error.

* **Notes / Edge Cases**
  * Ownership is verified before delete.

- `/src/app/api/user/sessions/revoke-all/route.ts` (`POST /api/user/sessions/revoke-all`)

### **Behavior & Rules**

* **Data**
  * Uses current cookie token to exclude active session.

* **Actions**
  * Deletes all other sessions for user.

* **Permissions**
  * `requireAccountId`.

* **Constraints & Validation**
  * If no current session cookie, filter still executes with empty-string exclusion.

* **DB Tables / Prisma Models**
  * `web_sessions`.

* **Common Errors**
  * `401`: unauthorized.
  * `500`: internal error.

* **Notes / Edge Cases**
  * Current browser session should remain active.

### 4.7 User character/bank/gameplay features

- `/src/app/api/user/character/route.ts` (`GET /api/user/character`)

### **Behavior & Rules**

* **Data**
  * Reads linked player row and returns parsed gameplay fields.

* **Actions**
  * Read-only.

* **Permissions**
  * `requireAccountId` + `resolveCitizenIdForAccount`.

* **Constraints & Validation**
  * Missing citizen/player returns `400`.

* **DB Tables / Prisma Models**
  * `players`.

* **Common Errors**
  * `400`: no linked character/player.
  * `401`: unauthorized.
  * `500`: internal error.

* **Notes / Edge Cases**
  * Uses safe JSON parsing fallback values.

- `/src/app/api/user/bank/personal/route.ts` (`GET /api/user/bank/personal`)

### **Behavior & Rules**

* **Data**
  * Personal bank/cash balances and paginated transaction list.

* **Actions**
  * Read-only.

* **Permissions**
  * `requireAccountId` + `resolveCitizenIdForAccount`.

* **Constraints & Validation**
  * Pagination defaults 1/10, max 100.

* **DB Tables / Prisma Models**
  * `player_transactions`, `players`.

* **Common Errors**
  * `401`: unauthorized.
  * `500`: internal errors.

* **Notes / Edge Cases**
  * Missing linkage/rows returns `200` with message and empty data.

- `/src/app/api/user/bank/team/route.ts` (`GET /api/user/bank/team`)

### **Behavior & Rules**

* **Data**
  * Gang bank account transactions, balance, and pagination.

* **Actions**
  * Read-only.

* **Permissions**
  * `requireAccountId`; gang name derived from auth session.

* **Constraints & Validation**
  * No gang -> `200` with message and empty list.
  * Pagination defaults 1/10, max 100.

* **DB Tables / Prisma Models**
  * `bank_accounts_new`.

* **Common Errors**
  * `401`: unauthorized.
  * `500`: internal errors.

* **Notes / Edge Cases**
  * Transaction JSON is sorted newest-first before paging.

- `/src/app/api/user/bank/investments/route.ts` (`GET /api/user/bank/investments`)

### **Behavior & Rules**

* **Data**
  * Lists gang-created bank accounts joined with business metadata.

* **Actions**
  * Read-only.

* **Permissions**
  * `requireAccountId`; gang context from auth session.

* **Constraints & Validation**
  * Missing gang returns `200` with empty investments and message.

* **DB Tables / Prisma Models**
  * `bank_accounts_new`, `tl_businesses` (raw SQL join).

* **Common Errors**
  * `401`: unauthorized.
  * `500`: query errors.

* **Notes / Edge Cases**
  * Ordering by business label/account id.

- `/src/app/api/user/bank/investments/[id]/transactions/route.ts` (`GET /api/user/bank/investments/:id/transactions`)

### **Behavior & Rules**

* **Data**
  * Returns one investment account’s paginated transactions and balance.

* **Actions**
  * Read-only.

* **Permissions**
  * `requireAccountId`; requester’s gang must match account creator.

* **Constraints & Validation**
  * No gang -> `403`.
  * Account missing -> `404`.
  * Creator mismatch -> `403`.
  * Pagination defaults 1/10, max 100.

* **DB Tables / Prisma Models**
  * `bank_accounts_new`.

* **Common Errors**
  * `401`, `403`, `404`, `500`.

* **Notes / Edge Cases**
  * Sorted newest-first before pagination.

- `/src/app/api/user/kill-logs/route.ts` (`GET /api/user/kill-logs`)

### **Behavior & Rules**

* **Data**
  * Returns kill/death logs by `type` with pagination.

* **Actions**
  * Read-only.

* **Permissions**
  * `requireAccountId` + `resolveCitizenIdForAccount`.

* **Constraints & Validation**
  * `type` is normalized (`dead` else defaults `kill`).
  * Pagination defaults 1/10, max 100.

* **DB Tables / Prisma Models**
  * `tl_kill_logs`.

* **Common Errors**
  * `401`: unauthorized.
  * `500`: internal failure.

* **Notes / Edge Cases**
  * Missing linkage returns `200` empty result + message.

- `/src/app/api/user/inventory/team/route.ts` (`GET /api/user/inventory/team`)

### **Behavior & Rules**

* **Data**
  * Returns validated team inventory items + generated item image URLs.

* **Actions**
  * Read-only.

* **Permissions**
  * `requireAccountId` + `resolveCitizenIdForAccount`; player must belong to gang.

* **Constraints & Validation**
  * Filters raw inventory to items that contain valid `slot`, `name`, `count`.

* **DB Tables / Prisma Models**
  * `players`, `ox_inventory` (raw SQL).

* **Common Errors**
  * `401`: unauthorized.
  * `500`: internal error.

* **Notes / Edge Cases**
  * No gang returns `200` with empty inventory and message.

### 4.8 User team/gang features

- `/src/app/api/user/gang/route.ts` (`GET /api/user/gang`)

### **Behavior & Rules**

* **Data**
  * Team profile, current member context, rank list, aggregate stats.

* **Actions**
  * Read-only.

* **Permissions**
  * `requireAccountId` + `resolveCitizenIdForAccount`.

* **Constraints & Validation**
  * No gang returns `200` with message and null team.

* **DB Tables / Prisma Models**
  * `web_accounts`, `players`, `tl_gangs`, `tl_gang_grades`, `player_groups`.

* **Common Errors**
  * `401`: unauthorized.
  * `500`: internal errors.

* **Notes / Edge Cases**
  * Team missing in `tl_gangs` returns `200` with explanatory message.

- `/src/app/api/user/gang/members/route.ts` (`GET /api/user/gang/members`)

### **Behavior & Rules**

* **Data**
  * Member list with grades, live status, and per-row manageability flags.

* **Actions**
  * Read-only.

* **Permissions**
  * `requireAccountId` + `resolveCitizenIdForAccount`.

* **Constraints & Validation**
  * Manage flag uses actor boss + grade hierarchy checks.

* **DB Tables / Prisma Models**
  * `players`, `tl_gangs`, `tl_gang_grades`, `player_groups`.

* **Common Errors**
  * `401`: unauthorized.
  * `500`: internal errors.

* **Notes / Edge Cases**
  * Live online status depends on external FiveM `players.json` when configured.

- `/src/app/api/user/gang/members/[citizenId]/route.ts` (`PATCH` / `DELETE`)

### **Behavior & Rules**

* **Data**
  * Path param `citizenId` identifies target member.

* **Actions**
  * `PATCH`: updates target grade in `player_groups` and updates player gang JSON.
  * `DELETE`: removes member from gang and writes default “none” gang payload.

* **Permissions**
  * `requireAccountId` + actor context from player gang.
  * Enforced by `gang-members.policy.ts` (`canManageGangMembers`, `canModifySelf`, `canAssignGangGrade`, `canManageGangMemberByGrade`).

* **Constraints & Validation**
  * Boss-only.
  * Cannot target self.
  * Cannot manage equal/higher grade.
  * Grade must be integer >= 0.

* **DB Tables / Prisma Models**
  * `players`, `player_groups`, `tl_gangs`, `tl_gang_grades`.

* **Common Errors**
  * `400`: invalid input/self action.
  * `401`: unauthorized.
  * `403`: forbidden by policy.
  * `404`: member not found.
  * `500`: transaction/internal errors.

* **Notes / Edge Cases**
  * Uses transactions to keep membership + gang JSON in sync.

- `/src/app/api/user/gang/members/recruit/route.ts` (`POST /api/user/gang/members/recruit`)

### **Behavior & Rules**

* **Data**
  * Expects `{ citizenId }` payload.

* **Actions**
  * Adds/replaces target member in `player_groups` with grade 0.
  * Updates target `players.gang` JSON to actor gang grade 0 payload.

* **Permissions**
  * `requireAccountId` + actor boss requirement via policy.

* **Constraints & Validation**
  * Citizen ID required.
  * Cannot recruit self.
  * Target must exist and must not already be in same gang.
  * Target must be offline (if FiveM endpoint available).
  * Gang + grade-0 config must exist.

* **DB Tables / Prisma Models**
  * `players`, `player_groups`, `tl_gangs`, `tl_gang_grades`.

* **Common Errors**
  * `400`: invalid/self/already-in-gang/online/missing config.
  * `401`: unauthorized.
  * `403`: non-boss or no gang.
  * `404`: player not found.
  * `500`: transaction/internal error.

* **Notes / Edge Cases**
  * Online check depends on `FIVEM_API_BASE`/`FIVEM_API_BASE_URL`; if unavailable check effectively skipped.

### 4.9 Admin API features

- `/src/app/api/admin/gangs/route.ts` (`GET /api/admin/gangs`)
- `/src/app/api/admin/investment/categories/route.ts` (`GET /api/admin/investment/categories`)
- `/src/app/api/admin/investment/detail/route.ts` (`GET /api/admin/investment/detail`)
- `/src/app/api/admin/investment/assign/route.ts` (`PATCH /api/admin/investment/assign`)
- `/src/app/api/admin/investment/gang-ownership/route.ts` (`GET /api/admin/investment/gang-ownership`)

### **Behavior & Rules**

* **Data**
  * Gangs endpoint returns selectable gangs.
  * Categories endpoint returns category counts + total businesses.
  * Detail endpoint returns paginated filtered business rows.
  * Gang ownership endpoint returns ownership count per gang.

* **Actions**
  * Assign endpoint updates business ownership/creator associations (assign or unassign).

* **Permissions**
  * All admin routes use `requireAdminSession` (authenticated + `session.user.optin === true`).

* **Constraints & Validation**
  * Assign payload validated by Zod (`bankAccountId`, `gangCode`).
  * Detail endpoint requires `category` or `gang`; supports optional query search.
  * Detail pagination defaults `1/10`, max `100`.

* **DB Tables / Prisma Models**
  * `tl_businesses`, `bank_accounts_new`, `tl_gangs` (via repository queries).

* **Common Errors**
  * `401`: not authenticated.
  * `403`: not admin.
  * `400`: invalid params/gang code.
  * `404`: bank account not found (assign).
  * `422`: assign schema invalid.
  * `500`: internal/repository failures.

* **Notes / Edge Cases**
  * Unassign operation uses `gangCode === "none"` convention.

### 4.10 API placeholder directory

- `/src/app/api/assets` (directory exists, currently no route files)

### **Behavior & Rules**

* **Data**
  * TODO (needs verification): no active route implementation currently.

* **Actions**
  * None.

* **Permissions**
  * N/A.

* **Constraints & Validation**
  * N/A.

* **DB Tables / Prisma Models**
  * None.

* **Common Errors**
  * N/A.

* **Notes / Edge Cases**
  * Placeholder for future assets-related API routes.

## 5) Design system demo features (`src/app/demo`)

- `/src/app/demo/page.tsx` (`/demo`)
  - Sandbox page to preview design-system components.

Demo feature components:
- `/src/app/demo/_components/TypographyDemo.tsx`
- `/src/app/demo/_components/ButtonDemo.tsx`
- `/src/app/demo/_components/PrimaryButtonDemo.tsx`
- `/src/app/demo/_components/SecondaryButtonDemo.tsx`
- `/src/app/demo/_components/LeftSlantButtonDemo.tsx`
- `/src/app/demo/_components/RightSlantButtonDemo.tsx`
- `/src/app/demo/_components/LogoDemo.tsx`
- `/src/app/demo/_components/ColorPaletteDemo.tsx`
- `/src/app/demo/_components/FormDemo.tsx`

### **Behavior & Rules**

* **Data**
  * Mostly local UI state; no production business API dependency.

* **Actions**
  * UI demo interactions only.

* **Permissions**
  * Public route.

* **Constraints & Validation**
  * Demo-only behavior; not part of production workflows.

* **DB Tables / Prisma Models**
  * None.

* **Common Errors**
  * TODO (needs verification): no dedicated runtime error pathways documented for demo page.

* **Notes / Edge Cases**
  * Useful as component reference while migrating UI to global primitives.

## 6) Summary

The app currently consists of:
- Public marketing/content pages
- Authentication + account setup flow
- Authenticated dashboard for player/account operations
- Admin management pages for investment/business ownership
- Full REST API backend under App Router route handlers
- API documentation page + OpenAPI endpoint
- In-repo design system demo pages
