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

**Routes:**
- `/` — Landing page (redirects to demo)
- `/demo` — Design system showcase (uses `_components` private route group)

## Architecture

**Component Structure (Base + Variants):**
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
├── Logo.tsx
└── index.tsx
```

**Namespace Patterns:**
- Button: Type assertion — `const Button = BaseButton as ButtonComponentExtended`
- Typography: Empty object — `const Typography = {} as TypographyComponent`

**Barrel Exports:** All `index.tsx` files export default namespace, named exports, and types.

**Type Definitions:** Located in `src/types/` (Button.d.ts, Typography.d.ts, Logo.d.ts)

## Styling System

**Theme:** Tailwind v4 tokens in `src/app/styles.css` via `@theme` directive. 8pt grid for sizing.

**Colors:**
- Primary: Dark grays (`#141414`, `#2D2D2D`, `#D7D7D7`)
- Secondary: Gold accent (`#D19A1C`, `#DDB247`) — for CTAs/highlights
- Tertiary: Red (`#BA0006`), white

**Fonts (local, not CDN):**
- `font-display` — Rajdhani (300-700 weight, display/heading/button text)
- `font-sans` — Inter variable (100-900 weight, body text)
- Files: `public/Rajdhani/*.ttf`, `public/Inter/*.ttf`

**Animations:**
- Base buttons: `hover:-translate-y-0.5 active:translate-y-0`
- Slant buttons: `hover:scale-105 active:scale-100`
- Outline slide: `-translate-x-full` → `translate-x-0` with hardcoded colors

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

**Polymorphic `as` Prop:** Renders component as different HTML element (e.g., `<Heading as="h2" level={1} />`)

## Code Quality

**ESLint Rules:**
- No `console.log` (only `warn`/`error` allowed)
- No `var`, enforce `const`/`let`
- Import sorting via `simple-import-sort`
- Strict equality (`eqeqeq`), object shorthand

**Testing:** None configured.

**Conventions:**
- No `hooks/`/`utils/`/`lib/` directories — co-locate with components
- Root layout uses `antialiased` class
- Default Next.js metadata ("Create Next App") — needs customization for production

## Libraries & Utilities

- **classnames** — Conditional className composition
- **lucide-react** — Icons for `prefix`/`suffix` props
