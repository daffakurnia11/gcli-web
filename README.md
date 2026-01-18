# GCLI Design System

> A component library and design system for GCLI (GTA Competitive League Indonesia) - a FiveM competitive gaming server.

## Features

- **Typography System** - Heading, Paragraph, Small components with namespace exports
- **Button Components** - Primary, Secondary, and Slant variants with animations
- **Logo Component** - Dynamic sizing with icon/name and color variants
- **Tailwind CSS v4** - Modern utility-first styling
- **TypeScript** - Full type safety
- **Next.js 16** - App Router architecture

## Tech Stack

- **Framework:** Next.js 16.1.3
- **React:** 19.2.3
- **Styling:** Tailwind CSS v4
- **TypeScript:** 5.9.3
- **Fonts:** Rajdhani (display), Inter (body)

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the design system showcase.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Auto-fix ESLint issues |
| `pnpm typecheck` | Run TypeScript check |
| `pnpm check` | Run both ESLint + TypeScript |

## Components

### Typography

```tsx
import { Typography } from "@/components/typography";

<Typography.Heading level={1} type="display">
  GCLI League
</Typography.Heading>
<Typography.Paragraph>
  Join the most competitive FiveM server in Indonesia.
</Typography.Paragraph>
<Typography.Small>Season 1 Now Live</Typography.Small>
```

### Button

```tsx
import { Button } from "@/components/button";

// Primary (gold theme)
<Button.Primary variant="solid" size="base">
  Join Now
</Button.Primary>

// Secondary (neutral theme)
<Button.Secondary variant="outline" size="base">
  Learn More
</Button.Secondary>

// Slant (with clip-path effect)
<Button.Slant variant="primary" size="lg" slant="left">
  Join Discord
</Button.Slant>
```

**Button Props:**
- `variant`: `"solid"` | `"outline"` | `"text"`
- `size`: `"lg"` | `"base"` | `"sm"`

### Logo

```tsx
import { Logo } from "@/components";

<Logo variant="icon" color="white" />
<Logo variant="name" color="black" />
```

**Logo Props:**
- `variant`: `"icon"` | `"name"`
- `color`: `"black"` | `"white"`

## Color Palette

| Name | Value |
|------|-------|
| Primary 900 | `#141414` |
| Primary 700 | `#2D2D2D` |
| Primary 100 | `#D7D7D7` |
| Secondary 700 | `#D19A1C` (Gold) |
| Secondary 500 | `#DDB247` |
| Tertiary Red | `#BA0006` |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Design system showcase
│   └── styles.css          # Global styles + theme
├── components/
│   ├── button/             # Button components
│   │   ├── Base.tsx         # Base button logic
│   │   ├── Primary.tsx      # Primary (gold)
│   │   ├── Secondary.tsx    # Secondary (neutral)
│   │   ├── Slant.tsx        # Slant (CTA with clip-path)
│   │   └── index.tsx        # Barrel exports
│   ├── typography/         # Typography components
│   │   ├── Heading.tsx
│   │   ├── Paragraph.tsx
│   │   ├── Small.tsx
│   │   └── index.tsx
│   ├── Logo.tsx            # Logo component
│   └── index.tsx           # Component barrel export
└── types/                  # TypeScript definitions
    ├── Button.d.ts
    ├── Logo.d.ts
    └── Typography.d.ts
```

## License

MIT

## Pages & Routes

- `/` is a landing screen with a single CTA that links to the demo page.
- `/demo` is the main design system showcase (Typography, Buttons, Logo, Colors).

## Global Styles & Theme

- Global styles live in `src/app/styles.css`.
- Fonts are locally hosted and registered via `@font-face`:
  - Display: Rajdhani (`public/Rajdhani/*`)
  - Body: Inter variable (`public/Inter/*`)
- Tailwind v4 theme tokens are defined with `@theme` and include:
  - Primary: `--color-primary-900/700/500/300/100`
  - Secondary (Gold): `--color-secondary-700/500/300`
  - Tertiary: `--color-tertiary-red/white`
  - Grays: `--color-gray-light/dark`

## Component Details

### Button Base Behavior

- Base button uses uppercase display font, rounded-sm, and subtle translate/press motion.
- Size tokens follow an 8pt grid:
  - `lg`: 56px height, 18px text
  - `base`: 44px height, 16px text
  - `sm`: 36px height, 14px text
- `outline` variants include a sliding background highlight on hover.

**Common Button Props (Primary/Secondary):**
- `variant`: `"solid"` | `"outline"` | `"text"`
- `size`: `"lg"` | `"base"` | `"sm"`
- `prefix` / `suffix`: React nodes for leading/trailing icons
- `fullWidth`: boolean for block-level buttons

### Slant Button

- Uses a slanted clip-path (`.clip-path-slant` / `.clip-path-slant-reverse`) for the CTA look.
- Size tokens:
  - `lg`: 56px height, 18px text
  - `base`: 48px height, 16px text
  - `sm`: 40px height, 14px text

**Slant Props:**
- `variant`: `"primary"` | `"secondary"`
- `slant`: `"left"` | `"right"`
- `size`: `"lg"` | `"base"` | `"sm"`
- `prefix` / `suffix`, `fullWidth`

### Typography

- `Heading` supports `level` 1–6 and `type` `"heading"` | `"display"`.
- `Paragraph` defaults to `text-sm sm:text-base`.
- `Small` defaults to `text-xs`.

### Logo

- Uses Next.js `Image` with local assets in `public/Logo`.
- Variants:
  - `variant`: `"icon"` | `"name"`
  - `color`: `"black"` | `"white"`
