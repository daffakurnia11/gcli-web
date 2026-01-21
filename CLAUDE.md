# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GCLI Design System is a component library for GCLI (GTA Competitive League Indonesia), a FiveM competitive gaming server. Built as a Next.js 16 application with React 19, TypeScript 5.9.3, and Tailwind CSS v4.

## Development Commands

```bash
pnpm dev          # Start dev server (localhost:3000)
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm lint:fix     # Auto-fix ESLint issues
pnpm typecheck    # Run TypeScript check
pnpm check        # Run ESLint + TypeScript (must pass before committing)
```

## Configuration

**Key Files:**
- `tsconfig.json` — ES2017 target, incremental builds, `@/*` → `./src/*` path aliases
- `eslint.config.mjs` — Extends `nextVitals` and `nextTs`, enforces import sorting
- `postcss.config.mjs` — Tailwind v4 via `@tailwindcss/postcss` plugin
- `next.config.ts` — Minimal (currently empty)
- `pnpm-workspace.yaml` — Workspace with `ignoredBuiltDependencies: [sharp, unrs-resolver]`
- `.env.example` — Environment variable templates (copy to `.env` for local dev)

**Routes:**
- `/` — Landing page with hero, core pillars, game loop, server info, team carousel, standings, and CTA
- `/about` — About page with title, description, vision, core pillars, player to-do, and pros/cons
- `/demo` — Design system showcase (uses `_components` private route group)

**API Routes:**
- `/api/info/discord` — Discord server info proxy (GET)
- `/api/info/fivem` — FiveM server info proxy (GET)
- `/api/proxy/discord` — Generic Discord API proxy
- `/api/proxy/fivem` — Generic FiveM API proxy

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
├── DiscordInfoCard.tsx   # Discord server info card (Client)
├── FiveMInfoCard.tsx     # FiveM server info card (Client)
├── Footer.tsx
├── Logo.tsx
├── Navbar.tsx
└── index.tsx             # Barrel exports
```

**Page Components (src/app/_components/):**
- Private route group for page-specific components
- `ServerInfo.tsx` — Server component that fetches Discord/FiveM data
- `Standings.tsx` — League standings table
- `AnimatedCard.tsx` — Framer Motion wrapper for animations

**Namespace Patterns:**
- Button: Type assertion — `const Button = BaseButton as ButtonComponentExtended`
- Typography: Empty object — `const Typography = {} as TypographyComponent`

**Barrel Exports:** All `index.tsx` files export default namespace, named exports, and types.

**Type Definitions:** Located in `src/types/`:
- `Button.d.ts`, `Typography.d.ts`, `Logo.d.ts` — Component types
- `api/Discord.d.ts` — Discord API types
- `api/FiveM.d.ts` — FiveM API types

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

**Discord API:**
- `DISCORD_API_BASE_URL` — Discord API base URL (default: https://discord.com/api/v10)
- `DISCORD_API_INVITE_CODE` — Discord server invite code

**FiveM API:**
- `FIVEM_API_BASE_URL` — FiveM server API base URL (e.g., http://server:port)
- `FIVEM_CONNECT_ADDRESS` — FiveM connection URL for clients (e.g., server:port)

**Application:**
- `NEXT_PUBLIC_APP_URL` — App URL for API calls (default: http://localhost:3000)
- `NODE_ENV` — Environment (development/production)

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

**Polymorphic `as` Prop:** Renders component as different HTML element (e.g., `<Heading as="h2" level={1} />`)

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

## Libraries & Utilities

**Core:**
- **axios** — HTTP client for API calls
- **classnames** — Conditional className composition
- **framer-motion** — Animation library
- **@icons-pack/react-simple-icons** — Brand icons (Discord, FiveM, etc.)
- **lucide-react** — UI icons

**API Usage:**
- All external API calls go through Next.js API routes (server-side proxy)
- Never call external APIs directly from Client Components
- Server Components fetch data, pass to Client Components as props
