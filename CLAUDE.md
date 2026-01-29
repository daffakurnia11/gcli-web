# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GCLI Design System is a full-stack web application for GCLI (GTA Competitive League Indonesia), a FiveM competitive gaming server. Built as a Next.js 16 application with React 19, TypeScript 5.x, Tailwind CSS v4, NextAuth v5 (beta) for authentication, and Prisma ORM with MySQL database.

## Development Commands

```bash
pnpm dev          # Start dev server with webpack (localhost:3000)
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
- `eslint.config.mjs` — Extends `nextVitals` and `nextTs`, enforces import sorting via `simple-import-sort`
- `postcss.config.mjs` — Tailwind v4 via `@tailwindcss/postcss` plugin
- `next.config.ts` — Image remote patterns, standalone output mode
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

## Routes Structure

The app uses Next.js App Router with route groups for organization:

### Public Routes `(public)`
- `/` — Landing page with hero, core pillars, game loop, server info, team carousel, standings, and CTA
- `/about` — About page with title, description, vision, core pillars, player to-do, and pros/cons
- `/demo` — Design system showcase with interactive component demos

### Authentication Routes `(auth)`
- `/auth` — Authentication page (login with email/password or Discord OAuth)
- `/auth/setup` — Account setup flow for new Discord users (multi-step form: Information → Credentials → Account Link)

### Protected Routes `(dashboard)`
- `/dashboard` — User dashboard main page with profile overview
- `/dashboard/character` — Character information page (personal info, job, gang, money)
- `/dashboard/profile` — Profile editing section
- `/dashboard/settings` — User settings (email, password, sessions, account linkage)
- `/dashboard/kill-log/kill` — Kill records page showing user's kills
- `/dashboard/kill-log/dead` — Death records page showing user's deaths

## API Routes

### Authentication API
- `/api/auth/[...nextauth]/route.ts` — NextAuth handler (sign-in, sign-out, callbacks)
- `/api/auth/connect/discord/route.ts` — Discord OAuth connection initiation
- `/api/auth/connect/discord/callback/route.ts` — Discord OAuth callback handler
- `/api/auth/register/route.ts` — User registration endpoint
- `/api/register/route.ts` — Alternative registration endpoint

### Account Management API
- `/api/account/unique-check/route.ts` — Email/username uniqueness validation
- `/api/user/profile/route.ts` — Get/update user profile (GET, PATCH)
- `/api/user/account/route.ts` — Account management endpoint (GET, DELETE)
- `/api/user/password/route.ts` — Password update (PATCH)
- `/api/user/email/route.ts` — Email management (PATCH)
- `/api/user/sessions/route.ts` — List user sessions (GET)
- `/api/user/sessions/[id]/route.ts` — Revoke specific session (DELETE)
- `/api/user/sessions/revoke-all/route.ts` — Revoke all sessions (POST)
- `/api/user/discord/connect/route.ts` — Link Discord account (POST)
- `/api/user/discord/disconnect/route.ts` — Unlink Discord account (POST)

### Player Data API
- `/api/user/character/route.ts` — Get FiveM character info for authenticated user (personal info, job, gang, money, metadata, etc.)
- `/api/user/kill-logs/route.ts` — Get kill/death logs (supports session + Bearer token auth)

### External Proxies
- `/api/info/discord/route.ts` — Discord server info proxy (GET)
- `/api/info/fivem/route.ts` — FiveM server info proxy (GET)

### Regional Data
- `/api/indonesia/provinces/route.ts` — Get Indonesian provinces
- `/api/indonesia/cities/[provinceId]/route.ts` — Get cities by province

## Architecture

### Component Structure

#### Base Components (`src/components/`)

**Button System (`src/components/button/`):**
- `Base.tsx` — Shared button logic with hover/active states
- `Primary.tsx` — Primary button (gold accent, composes Base)
- `Secondary.tsx` — Secondary button (neutral, composes Base)
- `Slant.tsx` — Standalone CTA with clip-path slant effect
- `index.tsx` — Namespace exports

**Typography (`src/components/typography/`):**
- `Heading.tsx` — Heading components with levels 1-6, display/heading types
- `Paragraph.tsx` — Paragraph components (responsive text-sm sm:text-base)
- `Small.tsx` — Small text components (text-xs)
- `index.tsx` — Namespace exports

**Form Components (`src/components/form/`):**
- `Text.tsx` — Text input field with label and error display
- `Number.tsx` — Number input field with min/max validation
- `Textarea.tsx` — Textarea field with customizable rows
- `Select.tsx` — Select dropdown with options array
- `Checkbox.tsx` — Checkbox input with label
- `Radio.tsx` — Radio button group with options
- `Date.tsx` — Date picker with max/min date constraints
- `Dropzone.tsx` — File upload dropzone with accept types and size limits
- `FieldWrapper.tsx` — Field wrapper with labels/validation for custom inputs
- `index.tsx` — Namespace exports

**Card Components (`src/components/card/`):**
- `DiscordInfoCard.tsx` — Discord server info card ("use client")
- `FiveMInfoCard.tsx` — FiveM server info card ("use client")

**Table Components (`src/components/table/`):**
- `DataTable.tsx` — Reusable table with custom column rendering, alignment options, skeleton loading

**Provider Components (`src/components/providers/`):**
- `AppProviders.tsx` — App-level providers wrapper
- `SessionProvider.tsx` — NextAuth session provider

**Other Components:**
- `Logo.tsx` — Logo component with icon/name variants
- `Navbar.tsx` — Navigation bar
- `Footer.tsx` — Footer component
- `index.tsx` — Main barrel exports

#### Dashboard Layout Components (`src/app/(dashboard)/_components/`)

**Layout:**
- `layout.tsx` — Dashboard layout wrapper with sidebar and header
- `DashboardShell.tsx` — Dashboard layout shell component

**Navigation:**
- `DashboardSidebar.tsx` — Collapsible sidebar with nested menu support ("use client")
- `SidebarUserMenu.tsx` — User menu in sidebar
- Sidebar menu items: Overview, Character, Kill Log (nested), Profile, Settings

**Dashboard Components (`src/app/(dashboard)/_components/dashboard/`):**
- `DashboardCard.tsx` — Card container for dashboard sections
- `UserStatsCard.tsx` — User statistics display with avatar, account info, and all connected IDs
- `ProfileSection.tsx` — Profile editing section
- `EmailSettings.tsx` — Email settings form
- `PasswordSettings.tsx` — Password update form
- `AccountLinkage.tsx` — Discord/Steam account linking
- `DangerZone.tsx` — Account deletion options
- `SettingsGroup.tsx` — Settings grouping wrapper
- `DashboardSection.tsx` — Section wrapper
- `Alert.tsx` — Alert/notification component
- `RegistrationCleanup.tsx` — Client component for cleaning up auth setup state
- `index.tsx` — Barrel exports

#### Kill Log Components (`src/app/(dashboard)/kill-log/_components/`)

Note: Based on the current structure, kill-log components are co-located with their pages. The table component for displaying kill/death records uses the shared `DataTable` component.

#### Demo Components (`src/app/demo/_components/`)

- `ButtonDemo.tsx` — Button component showcase
- `ColorPaletteDemo.tsx` — Color palette display
- `FormDemo.tsx` — Form components showcase
- `LogoDemo.tsx` — Logo variations
- `TypographyDemo.tsx` — Typography components
- `PrimaryButtonDemo.tsx` — Primary button examples
- `SecondaryButtonDemo.tsx` — Secondary button examples
- `LeftSlantButtonDemo.tsx` — Left-slant CTA buttons
- `RightSlantButtonDemo.tsx` — Right-slant CTA buttons

#### Public Page Components (`src/app/(public)/_components/`)

- `Hero.tsx` — Hero section
- `GameLoop.tsx` — Game loop visualization
- `ServerInfo.tsx` — Server info cards (fetches Discord/FiveM data)
- `TeamCarousel.tsx` — Team carousel
- `Standings.tsx` — League standings table
- `HomeCTA.tsx` — Call to action section

#### About Page Components (`src/app/(public)/about/_components/`)

- `Title.tsx` — About page title
- `Description.tsx` — About page description
- `Vision.tsx` — Vision section
- `CorePillars.tsx` — Core pillars section
- `PlayerToDo.tsx` — Player to-do list
- `ProsCons.tsx` — Pros and cons section

#### Auth Page Components (`src/app/(auth)/auth/_components/`)

- `Login.tsx` — Login form component

#### Auth Setup Components (`src/app/(auth)/auth/setup/_components/`)

- `Stepper.tsx` — Multi-step form stepper
- `Information.tsx` — Information step (name, username, gender, birth date, location)
- `Credentials.tsx` — Credentials step (email, password)
- `AccountLink.tsx` — Account link step display
- `AccountLinkWrapper.tsx` — Wrapper for account linking

#### Molecules (`src/molecules/`)

- `CorePillarsMolecules.tsx` — Animated core pillars component with Framer Motion
- `GameLoopMolecules.tsx` — Game loop visualization component
- `index.tsx` — Molecule exports

### Namespace Patterns

- **Button:** Type assertion — `const Button = BaseButton as ButtonComponentExtended`
- **Typography:** Empty object — `const Typography = {} as TypographyComponent`
- **Form:** Empty object — `const Form = {} as FormComponent`

### Barrel Exports

All `index.tsx` files export default namespace, named exports, and types.

### Type Definitions (`src/types/`)

**Component Types:**
- `Button.d.ts` — Button component types
- `Typography.d.ts` — Typography component types
- `Logo.d.ts` — Logo component types
- `Form.d.ts` — Form component types
- `components/Stepper.d.ts` — Stepper component types
- `components/Cards.d.ts` — Card component types
- `components/table/DataTable.d.ts` — DataTable component types

**Provider Types:**
- `providers/AppProviders.d.ts` — App providers types
- `providers/SessionProvider.d.ts` — Session provider types

**API Types:**
- `api/Discord.d.ts` — Discord API types
- `api/FiveM.d.ts` — FiveM API types
- `api/Indonesia.d.ts` — Indonesia API types

**Auth Types:**
- `next-auth.d.ts` — NextAuth type extensions

### Validation Schemas (`src/schemas/`)

- `authSetup.ts` — Zod validation schemas for multi-step authentication setup
  - `accountInfoSchema` — Validates user information (name, username, gender, birth date, province, city)
  - `passwordSchema` — Validates credentials with password complexity requirements (8+ chars, uppercase, lowercase, number)
  - `AccountInfoFormData` — Inferred type from accountInfoSchema
  - `AccountInfoDraft` — Draft type with optional gender
  - `PasswordFormData` — Inferred type from passwordSchema
  - `FormErrors<T>` — Generic form error type

### Hooks (`src/hooks/`)

- `useIndonesiaRegions.ts` — Hook for fetching Indonesian provincial and city data
  - `useProvinces()` — Fetch provinces
  - `useCities(provinceId)` — Fetch cities by province
- `useUniqueCheck.ts` — Hook for checking email/username uniqueness via API

### Custom SWR Hook (`src/lib/swr.ts`)

- `useApiSWR<T>()` — Custom SWR hook with error handling and default configuration
- `apiFetcher<T>()` — Fetcher function with error handling
- `ApiError` — Extended Error type with status and payload

## Authentication & Middleware

### NextAuth Configuration (`src/lib/auth.ts`)

- **Strategy:** JWT for session management
- **Providers:**
  - Credentials (email/password)
  - Discord OAuth with custom redirect for unregistered users
- **Callbacks:**
  - `signIn` — Handles Discord sign-in, checks registration status, redirects unregistered users
  - `session` — Adds user data to session (id, discordId, username, isRegistered)
  - `jwt` — Populates JWT with user data, checks registration
  - `redirect` — Custom redirect logic based on auth state
- **Pages:** Custom signIn page at `/auth`
- **Cookie Handling:** Supports both `__Secure-authjs.session-token` (HTTPS) and `authjs.session-token` (HTTP)

### Middleware (`middleware.ts`)

**Matcher:** `/:path*` (all routes)

**Logic:**
1. Skips `_next`, `api`, and static files
2. Attempts to get token from both secure and non-secure cookies
3. Redirects unauthenticated users from `/dashboard` to `/auth`
4. Redirects authenticated + registered users from `/auth` to `/dashboard`
5. Redirects authenticated + unregistered users to `/auth/setup`
6. Redirects authenticated + unregistered users from non-API, non-setup routes to `/auth/setup`

### Auth Flow

1. **Sign In:** User signs in via Credentials or Discord OAuth
2. **Middleware Check:** Checks authentication and registration status
3. **Unregistered Discord Users:** → `/auth/setup?step=1&discord_data=...` (multi-step form: 3 steps)
4. **Registered Users:** → `/dashboard`
5. **Unauthenticated Users** (accessing protected routes): → `/auth`

### Mixed Authentication Access

API routes support both session-based and Bearer token authentication:

```typescript
import { getAccountIdFromRequest } from "@/lib/apiAuth";

const accountId = await getAccountIdFromRequest(request);
// Returns account ID from NextAuth session OR Authorization: Bearer <token> header
```

This allows external API access via Bearer token while maintaining web session compatibility.

### Auth Setup State Management (`src/lib/authSetupPayload.ts`)

- `readAuthSetupPayload()` — Reads setup data from localStorage
- `writeAuthSetupPayload()` — Writes setup data to localStorage
- `updateAuthSetupPayload()` — Partially updates setup data
- `clearAuthSetupPayload()` — Clears setup data after completion

### API Authentication (`src/lib/apiAuth.ts`)

- `getAccountIdFromRequest()` — Extracts account ID from session or Bearer token
- Supports mixed authentication: NextAuth session + Authorization header

### User-Citizen Resolution (`src/lib/userCitizenId.ts`)

- `resolveCitizenIdForAccount()` — Links web accounts to FiveM player records via license matching
- Supports multiple licenses per account (license and license2 from users table)
- Returns: `{ citizenId, playerName }` or `null`

## Database (Prisma + MySQL)

### Schema Models (`prisma/schema.prisma`)

#### Game-Related (FiveM server data)
- `users` — FiveM user accounts (userId, username, license, license2, fivem, discord)
- `players` — Player characters with inventory, jobs, vehicles, money, metadata
- `bans` — Ban records (name, license, discord, ip, reason, expire)
- `player_vehicles` — Player-owned vehicles with mods and properties
- `player_groups` — Player group memberships (job, gang)
- `player_jobs_activity` — Job activity tracking
- `player_mails` — In-game mail system
- `player_outfits` & `player_outfit_codes` — Player outfit system
- `playerskins` — Player skin customizations
- `player_transactions` — Bank transactions
- `bank_accounts_new` — Banking system for FiveM
- `management_outfits` — Management outfit system
- `ox_doorlock` — Door lock system

#### Phone System (npwd_*)
- `npwd_calls` — Phone call records
- `npwd_darkchat_channels` & `npwd_darkchat_messages` — Encrypted chat
- `npwd_marketplace_listings` — Player marketplace
- `npwd_match_profiles` & `npwd_match_views` — Dating/match profiles
- `npwd_messages` — Phone messages
- `npwd_messages_conversations` & `npwd_messages_participants` — Conversation management
- `npwd_notes` — Player notes
- `npwd_phone_contacts` — Phone contacts
- `npwd_phone_gallery` — Phone gallery
- `npwd_twitter_profiles` — Twitter profiles
- `npwd_twitter_tweets` — Twitter tweets
- `npwd_twitter_likes` — Twitter likes
- `npwd_twitter_reports` — Twitter reports

#### Player Data
- `tl_crafting_locations` — Crafting station locations (x, y, z, heading)
- `tl_gangstash_locations` — Gang stash locations (x, y, z, heading)
- `tl_kill_logs` — Kill/death records with killer_citizenid, victim_citizenid, weapon, created_at

#### Web Application
- `web_accounts` — Web authentication accounts (email, password, discord_id, fivem_id)
- `web_profiles` — User profile data (real_name, fivem_name, gender, birth_date, province, city)
- `web_discord_accounts` — Linked Discord accounts (discord_id, username, global_name, email, image)
- `web_sessions` — Active user sessions (session_token, user_id, expires)

#### Enums
- `Gender` — `male` | `female`

### Usage Pattern

```typescript
import { prisma } from "@/lib/prisma";

const account = await prisma.web_accounts.findUnique({
  where: { email },
  include: { profile: true, user: true },
});
```

## Server + Client Component Pattern

### Recommended Approach

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

### When to Use `"use client"`

- Framer Motion animations
- Browser APIs (localStorage, window, etc.)
- Event handlers (onClick, onChange, etc.)
- Interactive hooks (useState, useEffect)
- SWR data fetching

## Environment Variables

### Application
- `NEXT_PUBLIC_APP_URL` — App URL for API calls (default: http://localhost:3000)
- `NODE_ENV` — Environment (development/production)

### Discord API
- `DISCORD_API_BASE_URL` — Discord API base URL (default: https://discord.com/api/v10)
- `DISCORD_API_INVITE_CODE` — Discord server invite code
- `NEXT_PUBLIC_DISCORD_INVITE` — Public Discord invite (for client-side links)

### Discord OAuth
- `DISCORD_CLIENT_ID` — Discord OAuth application client ID
- `DISCORD_CLIENT_SECRET` — Discord OAuth application client secret

### FiveM API
- `FIVEM_API_BASE_URL` — FiveM server API base URL (e.g., http://server:port)
- `FIVEM_CONNECT_ADDRESS` — FiveM connection URL for clients (e.g., server:port)

### NextAuth
- `AUTH_SECRET` — NextAuth secret (priority over NEXTAUTH_SECRET)
- `NEXTAUTH_SECRET` — NextAuth secret (fallback)
- `NEXTAUTH_URL` — NextAuth URL (defaults to NEXT_PUBLIC_APP_URL)

### Database
- `DATABASE_URL` — MySQL connection string (mysql://user:pass@host:port/db)

### Regional Data
- `INDONESIA_REGIONAL_API_BASE_URL` — Indonesia regions API (default: https://api-regional-indonesia.vercel.app)

### Steam (future)
- `STEAM_API_KEY` — Steam API key for integration

### Feature Flags
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

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Title",
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

## Styling System

### Theme Configuration

**Tailwind v4** with `@tailwindcss/postcss` plugin. Theme defined in `src/app/styles.css` via `@theme` directive.

### Color Tokens

```css
/* Primary (Dark Grays) */
--color-primary-900: #141414;
--color-primary-700: #2d2d2d;
--color-primary-500: #484848;
--color-primary-300: #8c8c8c;
--color-primary-100: #d7d7d7;

/* Secondary (Gold) */
--color-secondary-700: #d19a1c;
--color-secondary-500: #ddb247;
--color-secondary-300: #f6cd6b;

/* Tertiary */
--color-tertiary-red: #ba0006;
--color-tertiary-white: #ffffff;

/* Gray */
--color-gray-light: #c9c8c6;
--color-gray-dark: #efefed;

/* Brand Colors (hardcoded) */
Discord: #5865F2
FiveM: #F40552
```

### Fonts (Local, not CDN)

```css
font-display: "Rajdhani", sans-serif;
  /* Rajdhani: 300, 400, 500, 600, 700 weight */
  /* Files: public/Rajdhani/*.ttf */

font-sans: "Inter", sans-serif;
  /* Inter: 100-900 variable weight */
  /* Files: public/Inter/*.ttf */
```

### Animations

- **Base buttons:** `hover:-translate-y-0.5 active:translate-y-0`
- **Slant buttons:** `hover:scale-105 active:scale-100`
- **Outline slide:** `-translate-x-full` → `translate-x-0` with hardcoded colors (Primary: #D19A1C, Secondary: #D7D7D7)
- **Framer Motion:** Scroll-triggered animations using `whileInView`, `viewport={{ once: true }}`

### Global CSS Classes

```css
.clip-path-slant { clip-path: polygon(10% 0, 100% 0, 100% 100%, 0% 100%); }
.clip-path-slant-reverse { clip-path: polygon(0 0, 90% 0, 100% 100%, 0% 100%); }
```

### Common Patterns

- Responsive: `text-sm sm:text-base` (mobile-first)
- Group hover: `group` + `group-hover:*`
- z-index: `relative z-10` for layering
- Icons: `flex-shrink-0` to prevent shrinking
- Accents: `border-l-2 border-secondary-700`

## Component API

### Button System

```tsx
import { Button } from "@/components/button";

// Primary/Secondary
<Button.Primary variant="solid" size="lg|base|sm" prefix={<Icon />} fullWidth />
<Button.Secondary variant="solid" size="lg|base|sm" />

// Slant (CTA with clip-path)
<Button.Slant variant="primary|secondary" slant="left|right" size="lg|base|sm" />
```

### Typography

```tsx
import { Typography } from "@/components/typography";

<Typography.Heading level={1-6} type="display|heading" as="h1" />
<Typography.Paragraph as="div" />  // Responsive: text-sm sm:text-base
<Typography.Small as="span" />     // Defaults: text-xs
```

### Logo

```tsx
import { Logo } from "@/components";

<Logo variant="icon|name" color="black|white" />
// Files: public/Logo/logo-{variant}-{color}.png
```

### Info Cards

```tsx
import { DiscordInfoCard, FiveMInfoCard } from "@/components";

<DiscordInfoCard
  serverName="GCL Indonesia"
  inviteLink="https://discord.gg/code"
  onlineMembers={15}
  totalMembers={38}
/>

<FiveMInfoCard
  serverName="GCL Indonesia"
  connectUrl="sot.dafkur.com:30120"
  onlinePlayers={0}
  totalPlayers={10}
/>
```

### Form Components

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

### Polymorphic `as` Prop

Renders component as different HTML element:
```tsx
<Heading as="h2" level={1} />  // Renders h2 with h1 styling
```

### UserStatsCard

```tsx
import { UserStatsCard } from "@/app/(dashboard)/_components/dashboard";

<UserStatsCard
  avatar="/path/to/avatar.jpg"
  name="John Doe"
  email="john@example.com"
  createdAt={new Date("2024-01-01")}
  discordId="123456789"
  fivemId="license:abc123"
  license="license:xyz789"
  license2="license:def456"
/>
```

### DataTable

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

### useApiSWR Hook

```tsx
import { useApiSWR } from "@/lib/swr";

const { data, error, isLoading } = useApiSWR<KillLog[]>("/api/user/kill-logs?type=kill");
```

### Custom Hooks

```tsx
// Indonesian Regions
import { useProvinces, useCities } from "@/hooks/useIndonesiaRegions";

const { data: provinces } = useProvinces();
const { data: cities } = useCities("11"); // province ID

// Unique Check
import { useUniqueCheck } from "@/hooks/useUniqueCheck";

const { checkEmail, checkUsername, isChecking } = useUniqueCheck();
```

## Code Quality

### ESLint Rules

- No `console.log` (only `warn`/`error` allowed)
- No `var`, enforce `const`/`let`
- Import sorting via `simple-import-sort`
- Strict equality (`eqeqeq`), object shorthand

### Testing

None configured.

### Conventions

- Prefer Server Components for data fetching
- Use Client Components (`"use client"`) only for interactivity/animations
- Co-locate types with components when possible
- Root layout uses `antialiased` class
- Server Actions/API Routes for server-side logic
- All form validation uses Zod schemas
- Protected routes use middleware for authentication checks
- Database operations use Prisma client via `src/lib/prisma.ts`

## Libraries & Utilities

### Dependencies

**Core Framework:**
- `next@16.1.3` — React framework
- `react@19.2.3` — UI library
- `react-dom@19.2.3` — React DOM
- `typescript@^5` — Type system

**UI Libraries:**
- `tailwindcss@^4` — Utility-first CSS
- `@tailwindcss/postcss@^4` — Tailwind PostCSS plugin
- `framer-motion@^12.27.1` — Animation library
- `lucide-react@^0.562.0` — UI icons
- `@icons-pack/react-simple-icons@^13.8.0` — Brand icons
- `classnames@^2.5.1` — Conditional className composition

**Data Fetching:**
- `swr@^2.3.8` — Data fetching and caching
- `axios@^1.13.2` — HTTP client

**Authentication:**
- `next-auth@5.0.0-beta.30` — Authentication system
- `bcrypt@^6.0.0` — Password hashing
- `jose@^6.1.3` — JWT handling

**Database:**
- `@prisma/client@^6` — Prisma ORM client
- `prisma@^6` — Prisma CLI

**Validation:**
- `zod@^4.3.6` — Schema validation

**Utilities:**
- `date-fns@^4.1.0` — Date formatting and manipulation

### Utilities (`src/lib/`)

- `formValidation.ts` — Zod error handling utilities:
  - `formatZodError<T>()` — Converts Zod errors to key-value pairs
  - `getFirstZodError()` — Extracts first error message
  - `hasFieldError<T>()` — Checks if field has specific error
- `authSetupPayload.ts` — Auth setup localStorage management
- `prisma.ts` — Prisma client singleton for database operations
- `apiAuth.ts` — API authentication helpers (mixed authentication)
- `userCitizenId.ts` — User-to-citizen ID resolution for FiveM player linking
- `swr.ts` — Custom SWR configuration and useApiSWR hook
- `auth.ts` — NextAuth configuration

### API Usage Patterns

- All external API calls go through Next.js API routes (server-side proxy)
- Never call external APIs directly from Client Components
- Server Components fetch data, pass to Client Components as props
- SWR used for client-side data fetching with revalidation
