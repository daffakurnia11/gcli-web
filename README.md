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
