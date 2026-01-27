# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GCLI Design System is a full-stack web application for GCLI (GTA Competitive League Indonesia), a FiveM competitive gaming server. Built as a Next.js 16 application with React 19, TypeScript 5.9.3, Tailwind CSS v4, NextAuth v5 for authentication, and Prisma ORM with MySQL database.

## Development Commands

```bash
pnpm dev          # Start dev server (localhost:3000)
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm lint:fix     # Auto-fix ESLint issues
pnpm typecheck    # Run TypeScript check
pnpm check        # Run ESLint + TypeScript (must pass before committing)

# Database (Prisma)
pnpm exec prisma generate   # Generate Prisma client (auto-runs on postinstall)
pnpm exec prisma db push    # Push schema changes to database (dev)
pnpm exec prisma studio     # Open Prisma Studio for database inspection
pnpm exec prisma migrate reset  # Reset database (WARNING: deletes all data)
```

## Configuration

**Key Files:**
- `tsconfig.json` — ES2017 target, incremental builds, `@/*` → `./src/*` path aliases
- `eslint.config.mjs` — Extends `nextVitals` and `nextTs`, enforces import sorting
- `postcss.config.mjs` — Tailwind v4 via `@tailwindcss/postcss` plugin
- `next.config.ts` — Image remote patterns (Discord CDN, Unsplash, ui-avatars, etc.)
- `middleware.ts` — Route protection and authentication redirects
- `prisma/schema.prisma` — Database schema (MySQL)
- `src/lib/auth.ts` — NextAuth configuration
- `pnpm-workspace.yaml` — Workspace with `onlyBuiltDependencies: [@prisma/*, bcrypt]`
- `.env.example` — Environment variable templates (copy to `.env` for local dev)

**Image Remote Patterns** (`next.config.ts`):
- `cdn.discordapp.com` — Discord avatars and images
- `images.unsplash.com` — Unsplash stock photos
- `ui-avatars.com` — User avatar generation
- `i.pinimg.com` — Pinterest images
- `iili.io` — Image hosting service

**Public Routes:**
- `/` — Landing page with hero, core pillars, game loop, server info, team carousel, standings, and CTA
- `/about` — About page with title, description, vision, core pillars, player to-do, and pros/cons
- `/demo` — Design system showcase with interactive component demos (buttons, forms, typography, colors, logo)

**Protected Routes:**
- `/auth` — Authentication page (login with email/password or Discord OAuth)
- `/auth/setup` — Account setup flow for new Discord users (multi-step form)
- `/dashboard` — User dashboard with profile management
- `/dashboard/profile` — Profile editing section
- `/dashboard/settings` — User settings (email, password, sessions, account linkage)
- `/dashboard/kill-log/kill` — Kill records page showing user's kills
- `/dashboard/kill-log/dead` — Death records page showing user's deaths

**Dashboard Navigation:**
- Collapsible sidebar menu with nested item support
- Mobile-responsive hamburger menu with sticky header
- Active state tracking with auto-expanding parent menus
- User avatar display with fallback to initials

**API Routes:**

*Authentication:*
- `/api/auth/[...nextauth]` — NextAuth handler (sign-in, sign-out, callbacks)
- `/api/auth/connect/discord` — Discord OAuth connection initiation
- `/api/auth/connect/discord/callback` — Discord OAuth callback handler
- `/api/register` — User registration endpoint
- `/api/account/unique-check` — Email/username uniqueness validation

*User Management:*
- `/api/user/profile` — Get/update user profile
- `/api/user/account` — Account management endpoint
- `/api/user/password` — Password update
- `/api/user/email` — Email management
- `/api/user/sessions` — List user sessions
- `/api/user/sessions/[id]` — Revoke specific session
- `/api/user/sessions/revoke-all` — Revoke all sessions
- `/api/user/discord/connect` — Link Discord account
- `/api/user/discord/disconnect` — Unlink Discord account
- `/api/user/kill-logs` — Get kill/death logs (supports session + Bearer token auth)

*External Proxies:*
- `/api/info/discord` — Discord server info proxy (GET)
- `/api/info/fivem` — FiveM server info proxy (GET)
- `/api/proxy/discord` — Generic Discord API proxy
- `/api/proxy/fivem` — Generic FiveM API proxy

*Regional Data:*
- `/api/indonesia/provinces` — Get Indonesian provinces
- `/api/indonesia/cities/[provinceId]` — Get cities by province

## Architecture

### Component Structure

**Base Components (src/components/):**
```
components/
├── button/
│   ├── Base.tsx          # Shared logic
│   ├── Primary.tsx       # Composes Base
│   ├── Secondary.tsx     # Composes Base
│   ├── Slant.tsx         # Standalone CTA
│   └── index.tsx         # Namespace exports
├── typography/
│   ├── Heading.tsx
│   ├── Paragraph.tsx
│   ├── Small.tsx
│   └── index.tsx
├── form/
│   ├── Text.tsx          # Text input field
│   ├── Number.tsx        # Number input field
│   ├── Textarea.tsx      # Textarea field
│   ├── Select.tsx        # Select dropdown
│   ├── Checkbox.tsx      # Checkbox input
│   ├── Radio.tsx         # Radio button group
│   ├── Date.tsx          # Date picker
│   ├── Dropzone.tsx      # File upload dropzone
│   ├── FieldWrapper.tsx  # Field wrapper with labels/validation
│   └── index.tsx         # Namespace exports
├── DiscordInfoCard.tsx   # Discord server info card (Client)
├── FiveMInfoCard.tsx     # FiveM server info card (Client)
├── Footer.tsx
├── Logo.tsx
├── Navbar.tsx
└── index.tsx             # Barrel exports
```

**Table Components (src/components/table/):**
- `DataTable.tsx` — Reusable table with custom column rendering, alignment options, skeleton loading
- `DataTableSkeleton.tsx` — Loading skeleton for DataTable

**Dashboard Layout Components (src/app/dashboard/_components/):**
- `DashboardSidebar.tsx` — Collapsible sidebar with nested menu support (Client)
- `DashboardHeader.tsx` — Mobile header with hamburger menu and breadcrumbs (Client)
- `UserMenu.tsx` — User dropdown menu for mobile (Client)

**Dashboard Components (src/app/_components/dashboard/):**
- `DashboardCard.tsx` — Card container for dashboard sections
- `UserStatsCard.tsx` — User statistics display with avatar, account info, and all connected IDs
- `ProfileSection.tsx` — Profile editing section
- `EmailSettings.tsx` — Email settings form
- `PasswordSettings.tsx` — Password update form
- `AccountLinkage.tsx` — Discord/Steam account linking
- `DangerZone.tsx` — Account deletion options
- `SettingsGroup.tsx` — Settings grouping
- `DashboardSection.tsx` — Section wrapper
- `Alert.tsx` — Alert/notification component
- `RegistrationCleanup.tsx` — Client component for cleaning up auth setup state

**Kill Log Components (src/app/dashboard/kill-log/_components/):**
- `KillLogTable.tsx` — Table component for displaying kill/death records (Client)
- `columns.tsx` — Column definitions for kill log data table

**Demo Components (src/app/demo/_components/):**
- `ButtonDemo.tsx` — Button component showcase
- `ColorPaletteDemo.tsx` — Color palette display
- `FormDemo.tsx` — Form components showcase
- `LogoDemo.tsx` — Logo variations
- `TypographyDemo.tsx` — Typography components
- `PrimaryButtonDemo.tsx` — Primary button examples
- `SecondaryButtonDemo.tsx` — Secondary button examples
- `LeftSlantButtonDemo.tsx` — Left-slant CTA buttons
- `RightSlantButtonDemo.tsx` — Right-slant CTA buttons

**Molecules (src/molecules/):**
- `CorePillarsMolecules.tsx` — Animated core pillars component with Framer Motion
- `GameLoopMolecules.tsx` — Game loop visualization component

**Other Page Components (src/app/_components/):**
- `ServerInfo.tsx` — Server component that fetches Discord/FiveM data
- `Standings.tsx` — League standings table
- `AnimatedCard.tsx` — Framer Motion wrapper for animations

**Namespace Patterns:**
- Button: Type assertion — `const Button = BaseButton as ButtonComponentExtended`
- Typography: Empty object — `const Typography = {} as TypographyComponent`
- Form: Empty object — `const Form = {} as FormComponent`

**Barrel Exports:** All `index.tsx` files export default namespace, named exports, and types.

**Type Definitions:** Located in `src/types/`:
- `Button.d.ts`, `Typography.d.ts`, `Logo.d.ts`, `Form.d.ts` — Component types
- `components/Stepper.d.ts` — Stepper component types
- `components/Cards.d.ts` — Card component types
- `components/table/DataTable.d.ts` — DataTable component types
- `providers/AppProviders.d.ts` — App providers types
- `providers/SessionProvider.d.ts` — Session provider types
- `next-auth.d.ts` — NextAuth type extensions
- `api/Discord.d.ts` — Discord API types
- `api/FiveM.d.ts` — FiveM API types

**Validation Schemas** (`src/schemas/`):
- `authSetup.ts` — Zod validation schemas for multi-step authentication setup
  - `accountInfoSchema` — Validates user information (name, username, age, birth date, province, city)
  - `passwordSchema` — Validates credentials with password complexity requirements

**Hooks** (`src/hooks/`):
- `useIndonesiaRegions.ts` — Hook for fetching Indonesian provincial and city data
- `useUniqueCheck.ts` — Hook for checking email/username uniqueness via API

**Custom SWR Hook** (`src/lib/swr.ts`):
- `useApiSWR()` — Custom SWR hook with error handling and default configuration for API calls

### Authentication & Middleware

**NextAuth Configuration** (`src/lib/auth.ts`):
- JWT strategy for session management
- Credentials provider (email/password)
- Discord OAuth provider with custom redirect for unregistered users
- Custom callbacks for sign-in, session, JWT, and redirect

**Middleware** (`middleware.ts`):
- Protects dashboard routes (requires authentication)
- Redirects authenticated users away from auth pages
- Handles registration flow for new Discord users
- Checks `isRegistered` flag in JWT token

**Auth Flow:**
1. User signs in via Credentials or Discord OAuth
2. Middleware checks authentication and registration status
3. Unregistered Discord users → `/auth/setup` multi-step form (3 steps: Information → Credentials → Account Link)
4. Registered users → `/dashboard`
5. Unauthenticated users accessing protected routes → `/auth`

**Mixed Authentication Access:**
- API routes support both session-based and Bearer token authentication
- Use `getAccountIdFromRequest()` to extract account ID from either source
- Allows external API access via Authorization: Bearer <token> header

**Auth Setup State Management** (`src/lib/authSetupPayload.ts`):
- `readAuthSetupPayload()` — Reads setup data from localStorage
- `writeAuthSetupPayload()` — Writes setup data to localStorage
- `updateAuthSetupPayload()` — Partially updates setup data
- `clearAuthSetupPayload()` — Clears setup data after completion

**API Authentication** (`src/lib/apiAuth.ts`):
- `getAccountIdFromRequest()` — Extracts account ID from session or Bearer token
- Supports mixed authentication: NextAuth session + Authorization header

**User-Citizen Resolution** (`src/lib/userCitizenId.ts`):
- `resolveCitizenIdForAccount()` — Links web accounts to FiveM player records via license matching
- Supports multiple licenses per account (license and license2 from users table)

### Database (Prisma + MySQL)

**Schema Models** (`prisma/schema.prisma`):

*Game-Related (FiveM server data):*
- `users` — FiveM user accounts (license, discord, fivem username)
- `players` — Player characters with inventory, jobs, vehicles
- `bans` — Ban records
- `player_vehicles` — Player-owned vehicles
- `bank_accounts_new` — Banking system for FiveM
- `management_outfits` — Management outfit system
- `ox_doorlock` — Door lock system

*Phone System (npwd_*):*
- `npwd_calls` — Phone call records
- `npwd_darkchat_channels` & `npwd_darkchat_messages` — Encrypted chat
- `npwd_marketplace_listings` — Player marketplace
- `npwd_match_profiles` & `npwd_match_views` — Dating/match profiles
- `npwd_messages` & `npwd_conversation_*` — Phone messages
- `npwd_notes` — Player notes
- `npwd_phone_contacts` & `npwd_phone_gallery` — Phone contacts and gallery
- `npwd_twitter_*` — Twitter integration

*Player Data (player_*):*
- `player_*` models for FiveM player data (crafting, locations, etc.)
- `tl_crafting_locations` — Crafting station locations
- `tl_gangstash_locations` — Gang stash locations
- `tl_kill_logs` — Kill/death records with killer and victim info, weapon, timestamp

*Various FiveM-specific tables:* ox_*, other system tables

*Web Application:*
- `web_accounts` — Web authentication accounts (email, password, OAuth links)
- `web_profiles` — User profile data (name, age, location)
- `web_discord_accounts` — Linked Discord accounts
- `web_sessions` — Active user sessions

**Usage Pattern:**
```tsx
import { prisma } from "@/lib/prisma";

const account = await prisma.web_accounts.findUnique({
  where: { email },
  include: { profile: true, user: true },
});
```

### Server + Client Component Pattern

**Recommended approach for data fetching + animations:**

1. **Server Components** fetch data server-side (better performance, SEO)
2. **Client Components** receive data as props and handle interactivity/animations

```tsx
// ✅ Correct: Server Component fetches, passes to Client
async function Page() {
  const data = await fetchData();
  return <ClientComponent data={data} />;
}

// ❌ Avoid: Client Components with useEffect for initial data
// Use Server Components instead when possible
```

**When to use `"use client"`:**
- Framer Motion animations
- Browser APIs (localStorage, window, etc.)
- Event handlers (onClick, onChange, etc.)
- Interactive hooks (useState, useEffect)

## Environment Variables

**Application:**
- `NEXT_PUBLIC_APP_URL` — App URL for API calls (default: http://localhost:3000)
- `NODE_ENV` — Environment (development/production)

**Discord API:**
- `DISCORD_API_BASE_URL` — Discord API base URL (default: https://discord.com/api/v10)
- `DISCORD_API_INVITE_CODE` — Discord server invite code
- `NEXT_PUBLIC_DISCORD_INVITE` — Public Discord invite (for client-side links)

**Discord OAuth:**
- `DISCORD_CLIENT_ID` — Discord OAuth application client ID
- `DISCORD_CLIENT_SECRET` — Discord OAuth application client secret

**FiveM API:**
- `FIVEM_API_BASE_URL` — FiveM server API base URL (e.g., http://server:port)
- `FIVEM_CONNECT_ADDRESS` — FiveM connection URL for clients (e.g., server:port)

**NextAuth:**
- `AUTH_SECRET` — NextAuth secret (priority over NEXTAUTH_SECRET)
- `NEXTAUTH_SECRET` — NextAuth secret (fallback)
- `NEXTAUTH_URL` — NextAuth URL (defaults to NEXT_PUBLIC_APP_URL)

**Database:**
- `DATABASE_URL` — MySQL connection string (mysql://user:pass@host:port/db)

**Regional Data:**
- `INDONESIA_REGIONAL_API_BASE_URL` — Indonesia regions API (default: https://api-regional-indonesia.vercel.app)

**Steam (future):**
- `STEAM_API_KEY` — Steam API key for integration

**Feature Flags:**
- `ALLOW_FIVEM_CHANGE` — Allow FiveM username changes (default: false)
- `ALLOW_DISCORD_CHANGE` — Allow Discord account re-linking (default: false)

## SEO & Metadata

**Favicon:** Custom icon at `src/app/icon.png` (copied from `public/Logo/icon.png`)

**Root Layout Metadata** (`src/app/layout.tsx`):
- Default title: "GCLI - GTA Competitive League Indonesia"
- Title template: `"%s | GCLI"`
- OpenGraph and Twitter card support configured
- Icons configured for browser, shortcut, and Apple touch

**Page-Level Metadata Pattern:**
Each page exports `metadata` with `Metadata` type from `next`:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Title",  // Uses root template: "Page Title | GCLI"
  description: "Page description for SEO",
  keywords: ["keyword1", "keyword2", "keyword3"],
  openGraph: {
    title: "Page Title",
    description: "Page description for social sharing",
    url: "/page-path",
    images: [{ url: "/Logo/icon.png", width: 512, height: 512, alt: "GCLI Logo" }],
  },
  twitter: {
    title: "Page Title",
    description: "Page description for Twitter cards",
    images: ["/Logo/icon.png"],
  },
};
```

**Pages with Metadata:**
- `/` (home) — Competitive FiveM server, leagues, and community focus
- `/about` — Vision, core pillars, and community values

## Styling System

**Theme:** Tailwind v4 tokens in `src/app/styles.css` via `@theme` directive. 8pt grid for sizing.

**Colors:**
- Primary: Dark grays (`#141414`, `#2D2D2D`, `#D7D7D7`)
- Secondary: Gold accent (`#D19A1C`, `#DDB247`) — for CTAs/highlights
- Tertiary: Red (`#BA0006`), white

**Custom Colors (Brand):**
- Discord: `#5865F2`
- FiveM: `#F40552`

**Fonts (local, not CDN):**
- `font-display` — Rajdhani (300-700 weight, display/heading/button text)
- `font-sans` — Inter variable (100-900 weight, body text)
- Files: `public/Rajdhani/*.ttf`, `public/Inter/*.ttf`

**Animations:**
- Base buttons: `hover:-translate-y-0.5 active:translate-y-0`
- Slant buttons: `hover:scale-105 active:scale-100`
- Outline slide: `-translate-x-full` → `translate-x-0` with hardcoded colors
- Framer Motion: Used for scroll-triggered animations (`whileInView`, `viewport={{ once: true }}`)

**Global CSS Classes:**
- `.clip-path-slant` / `.clip-path-slant-reverse` — For slant buttons

**Common Patterns:**
- Responsive: `text-sm sm:text-base` (mobile-first)
- Group hover: `group` + `group-hover:*`
- z-index: `relative z-10` for layering
- Icons: `flex-shrink-0` to prevent shrinking
- Accents: `border-l-2 border-secondary-700`

## Component API

**Button System:**
```tsx
import { Button } from "@/components/button";

// Primary/Secondary (gold/neutral)
<Button.Primary variant="solid" size="lg|base|sm" prefix={<Icon />} fullWidth />

// Outline slide animation uses hardcoded colors:
//   Primary: #D19A1C, Secondary: #D7D7D7

// Slant (CTA with clip-path)
<Button.Slant variant="primary|secondary" slant="left|right" size="lg|base|sm" />
```

**Typography:**
```tsx
import { Typography } from "@/components/typography";

<Typography.Heading level={1-6} type="display|heading" as="h1" />
<Typography.Paragraph as="div" />  // Responsive: text-sm sm:text-base
<Typography.Small as="span" />     // Defaults: text-xs
```

**Logo:**
```tsx
import { Logo } from "@/components";

<Logo variant="icon|name" color="black|white" />
// Files: public/Logo/logo-{variant}-{color}.png
```

**Info Cards:**
```tsx
import { DiscordInfoCard, FiveMInfoCard } from "@/components";

// Discord Info Card
<DiscordInfoCard
  serverName="GCL Indonesia"
  inviteLink="https://discord.gg/code"
  onlineMembers={15}
  totalMembers={38}
/>

// FiveM Info Card
<FiveMInfoCard
  serverName="GCL Indonesia"
  connectUrl="sot.dafkur.com:30120"
  onlinePlayers={0}
  totalPlayers={10}
/>
```

**Form Components:**
```tsx
import { Form } from "@/components/form";

// Text Input
<Form.Text
  label="Email"
  name="email"
  type="email"
  placeholder="your@email.com"
  error={errors.email}
  required
/>

// Number Input
<Form.Number
  label="Age"
  name="age"
  min={1}
  max={100}
  error={errors.age}
/>

// Textarea
<Form.Textarea
  label="Bio"
  name="bio"
  rows={4}
  placeholder="Tell us about yourself"
/>

// Select Dropdown
<Form.Select
  label="Province"
  name="province"
  options={[
    { value: "11", label: "Aceh" },
    { value: "12", label: "Sumatera Utara" },
  ]}
  placeholder="Select province"
/>

// Checkbox
<Form.Checkbox
  label="I agree to terms"
  name="terms"
  error={errors.terms}
/>

// Radio Group
<Form.Radio
  label="Gender"
  name="gender"
  options={[
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
  ]}
/>

// Date Picker
<Form.Date
  label="Birth Date"
  name="birthDate"
  max={new Date()}
/>

// File Dropzone
<Form.Dropzone
  label="Avatar"
  name="avatar"
  accept={{ "image/*": [".jpg", ".jpeg", ".png"] }}
  maxSize={5 * 1024 * 1024} // 5MB
/>

// Field Wrapper (for custom inputs)
<Form.FieldWrapper label="Custom Field" name="custom" error={errors.custom}>
  <YourCustomInput />
</Form.FieldWrapper>
```

**Polymorphic `as` Prop:** Renders component as different HTML element (e.g., `<Heading as="h2" level={1} />`)

**UserStatsCard:**
```tsx
import { UserStatsCard } from "@/app/_components/dashboard";

<UserStatsCard
  avatar="/path/to/avatar.jpg"           // User avatar (optional)
  name="John Doe"                        // Display name
  email="john@example.com"               // Email address
  createdAt={new Date("2024-01-01")}     // Account creation date
  discordId="123456789"                  // Discord ID (optional)
  fivemId="license:abc123"               // FiveM license (optional)
  license="license:xyz789"               // Primary license (optional)
  license2="license:def456"              // Secondary license (optional)
/>
```

**Stepper Component:**
```tsx
import { Stepper } from "@/types/components/Stepper";

<Stepper
  steps={["Information", "Credentials", "Account Link"]}
  currentStep={1}  // 0-indexed
/>
```

**Custom Hooks:**
```tsx
// Indonesian Regions Hook
import { useIndonesiaRegions } from "@/hooks/useIndonesiaRegions";

const { provinces, cities, loading, error, fetchCities } = useIndonesiaRegions();
fetchCities("11"); // Fetch cities for province ID

// Unique Check Hook
import { useUniqueCheck } from "@/hooks/useUniqueCheck";

const { checkEmail, checkUsername, isChecking } = useUniqueCheck();
checkEmail("test@example.com"); // Returns Promise<boolean>
checkUsername("testuser");       // Returns Promise<boolean>
```

**DataTable Component:**
```tsx
import { DataTable, type Column } from "@/components/table";

const columns: Column<KillLog>[] = [
  { key: "killer_name", label: "Killer", align: "left" },
  { key: "victim_name", label: "Victim", align: "left" },
  { key: "weapon", label: "Weapon", align: "center" },
  { key: "created_at", label: "Date", align: "right", render: (value) => formatDate(value) },
];

<DataTable
  columns={columns}
  data={killLogs}
  emptyMessage="No records found"
/>
```

**useApiSWR Hook:**
```tsx
import { useApiSWR } from "@/lib/swr";

const { data, error, isLoading } = useApiSWR<KillLog[]>("/api/user/kill-logs?type=kill");
```

## Code Quality

**ESLint Rules:**
- No `console.log` (only `warn`/`error` allowed)
- No `var`, enforce `const`/`let`
- Import sorting via `simple-import-sort`
- Strict equality (`eqeqeq`), object shorthand

**Testing:** None configured.

**Conventions:**
- Prefer Server Components for data fetching
- Use Client Components (`"use client"`) only for interactivity/animations
- Co-locate types with components when possible
- Root layout uses `antialiased` class
- Server Actions/API Routes for server-side logic
- All form validation uses Zod schemas
- Protected routes use middleware for authentication checks
- Database operations use Prisma client via `src/lib/prisma.ts`

## Libraries & Utilities

**Core:**
- **axios** — HTTP client for API calls
- **classnames** — Conditional className composition
- **framer-motion** — Animation library
- **@icons-pack/react-simple-icons** — Brand icons (Discord, FiveM, etc.)
- **lucide-react** — UI icons
- **date-fns** — Date formatting and manipulation
- **swr** — Data fetching and caching (useSWR hook)

**Authentication:**
- **next-auth** (v5 beta) — Authentication system with JWT strategy
- **bcrypt** — Password hashing
- **jose** — JWT handling for NextAuth

**Database:**
- **@prisma/client** — Prisma ORM client
- **prisma** — Prisma CLI (included in dependencies for postinstall)

**Validation:**
- **zod** — Schema validation for forms and API inputs

**API Usage:**
- All external API calls go through Next.js API routes (server-side proxy)
- Never call external APIs directly from Client Components
- Server Components fetch data, pass to Client Components as props
- SWR used for client-side data fetching with revalidation

**Utilities** (`src/lib/`):
- `formValidation.ts` — Zod error handling utilities:
  - `formatZodError<T>()` — Converts Zod errors to key-value pairs
  - `getFirstZodError()` — Extracts first error message
  - `hasFieldError<T>()` — Checks if field has specific error
- `authSetupPayload.ts` — Auth setup localStorage management (see Auth Flow section)
- `prisma.ts` — Prisma client singleton for database operations
- `apiAuth.ts` — API authentication helpers (see Mixed Authentication Access section)
- `userCitizenId.ts` — User-to-citizen ID resolution for FiveM player linking
- `swr.ts` — Custom SWR configuration and useApiSWR hook
