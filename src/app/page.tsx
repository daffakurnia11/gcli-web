import { Logo } from "@/components";
import { Button } from "@/components/button";
import { Typography } from "@/components/typography";

export default function Home() {
  return (
    <main className="min-h-screen bg-primary-900 text-gray-dark p-6 sm:p-10">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* ===== TYPOGRAPHY NAMESPACE SECTION ===== */}
        <section className="space-y-4">
          <Typography.Heading level={2} className="text-secondary-500">
            Typography Namespace
          </Typography.Heading>
          <Typography.Paragraph className="text-xs text-primary-300 mb-2">
            &lt;Typography.Heading /&gt;, &lt;Typography.Paragraph /&gt;,
            &lt;Typography.Small /&gt;
          </Typography.Paragraph>
          <div className="bg-primary-700 p-4 rounded-lg space-y-2 border-l-2 border-secondary-700">
            <Typography.Heading
              level={3}
              type="display"
              className="text-secondary-500"
            >
              GCLI League
            </Typography.Heading>
            <Typography.Paragraph>
              Join the most competitive FiveM server in Indonesia.
            </Typography.Paragraph>
            <Typography.Small className="text-secondary-300">
              Season 1 Now Live
            </Typography.Small>
          </div>
        </section>

        {/* ===== DISPLAY SECTION ===== */}
        <section className="space-y-4">
          <Typography.Heading level={2} className="text-secondary-500">
            Display Type (Rajdhani)
          </Typography.Heading>
          <div className="space-y-4 border-l-2 border-secondary-700 pl-6">
            <Typography.Heading
              type="display"
              level={1}
              className="text-6xl sm:text-7xl"
            >
              HERO DISPLAY
            </Typography.Heading>
            <Typography.Heading type="display" level={2} className="text-5xl">
              Large Display Title
            </Typography.Heading>
            <Typography.Heading type="display" level={3} className="text-4xl">
              Medium Display
            </Typography.Heading>
            <Typography.Heading type="display" level={4} className="text-3xl">
              Small Display
            </Typography.Heading>
          </div>
        </section>

        {/* ===== HEADINGS SECTION ===== */}
        <section className="space-y-4">
          <Typography.Heading level={2} className="text-secondary-500">
            Heading Type (Inter)
          </Typography.Heading>
          <div className="space-y-3 border-l-2 border-primary-700 pl-6">
            <Typography.Heading level={1}>
              Heading Level 1 - Main Title
            </Typography.Heading>
            <Typography.Heading level={2}>
              Heading Level 2 - Section Title
            </Typography.Heading>
            <Typography.Heading level={3}>
              Heading Level 3 - Subsection
            </Typography.Heading>
            <Typography.Heading level={4}>
              Heading Level 4 - Component Title
            </Typography.Heading>
            <Typography.Heading level={5}>
              Heading Level 5 - Small Title
            </Typography.Heading>
            <Typography.Heading level={6}>
              Heading Level 6 - Micro Title
            </Typography.Heading>
          </div>
        </section>

        {/* ===== CUSTOM ELEMENT SECTION ===== */}
        <section className="space-y-4">
          <Typography.Heading level={2} className="text-secondary-500">
            Custom Elements (as prop)
          </Typography.Heading>
          <div className="space-y-2 border-l-2 border-primary-700 pl-6">
            <div className="flex items-center gap-4">
              <code className="text-xs text-secondary-300">
                level={3} as=&quot;h1&quot;
              </code>
              <Typography.Heading
                level={3}
                as="h1"
                className="text-tertiary-red"
              >
                H1 element with Level 3 styles
              </Typography.Heading>
            </div>
            <div className="flex items-center gap-4">
              <code className="text-xs text-secondary-300">
                level={2} as=&quot;div&quot;
              </code>
              <Typography.Heading
                level={2}
                as="div"
                className="text-secondary-500"
              >
                Div element with Level 2 styles
              </Typography.Heading>
            </div>
            <div className="flex items-center gap-4">
              <code className="text-xs text-secondary-300">
                type=&quot;display&quot; as=&quot;span&quot;
              </code>
              <Typography.Heading
                type="display"
                level={4}
                as="span"
                className="text-tertiary-white"
              >
                Span element with Display type
              </Typography.Heading>
            </div>
          </div>
        </section>

        {/* ===== PARAGRAPH SECTION ===== */}
        <section className="space-y-4">
          <Typography.Heading level={2} className="text-secondary-500">
            Paragraph Component
          </Typography.Heading>
          <div className="space-y-4 border-l-2 border-primary-700 pl-6">
            <Typography.Paragraph>
              Default paragraph text using Inter font family. Perfect for body
              content and longer passages of text.
            </Typography.Paragraph>
            <Typography.Paragraph className="text-primary-300">
              Muted paragraph text with custom className for secondary
              information.
            </Typography.Paragraph>
            <Typography.Paragraph className="text-secondary-500 text-lg">
              Emphasized paragraph with larger size and gold color for
              highlights.
            </Typography.Paragraph>

            {/* Custom element */}
            <Typography.Paragraph
              as="div"
              className="bg-primary-700 p-4 rounded"
            >
              Paragraph as div element with custom background styling.
            </Typography.Paragraph>
          </div>
        </section>

        {/* ===== SMALL SECTION ===== */}
        <section className="space-y-4">
          <Typography.Heading level={2} className="text-secondary-500">
            Small Component
          </Typography.Heading>
          <div className="space-y-3 border-l-2 border-primary-700 pl-6">
            <div className="flex items-center gap-2">
              <Typography.Small>Default small text (span)</Typography.Small>
              <span className="text-primary-500">|</span>
              <Typography.Small className="text-primary-300">
                Muted small text
              </Typography.Small>
            </div>
            <Typography.Small className="text-secondary-500">
              Gold colored small text for labels and tags
            </Typography.Small>
            <Typography.Small
              as="div"
              className="bg-primary-700 inline-block px-3 py-1 rounded"
            >
              Small as div - styled like a badge
            </Typography.Small>
            <Typography.Small as="p" className="text-gray-light">
              Small as paragraph element for captions and notes
            </Typography.Small>
          </div>
        </section>

        {/* ===== COMBINED EXAMPLE ===== */}
        <section className="space-y-4">
          <Typography.Heading level={2} className="text-secondary-500">
            Combined Example
          </Typography.Heading>
          <article className="bg-primary-700 p-6 rounded-lg space-y-4">
            <Typography.Heading
              type="display"
              level={2}
              className="text-secondary-700"
            >
              GCLI League Season 1
            </Typography.Heading>
            <Typography.Paragraph>
              Join the most competitive FiveM server in Indonesia. Battle
              through factions, climb the leaderboard, and prove your dominance.
            </Typography.Paragraph>
            <div className="flex gap-4 text-sm">
              <Typography.Small className="text-secondary-500">
                128 Players Online
              </Typography.Small>
              <span className="text-primary-500">•</span>
              <Typography.Small className="text-tertiary-red">
                Live Season
              </Typography.Small>
            </div>
          </article>
        </section>

        {/* ===== BUTTONS SECTION ===== */}
        <section className="space-y-4">
          <Typography.Heading level={2} className="text-secondary-500">
            Button Component
          </Typography.Heading>

          {/* Primary Variant */}
          <div className="space-y-3 border-l-2 border-secondary-700 pl-6">
            <Typography.Heading level={3}>Primary (Gold)</Typography.Heading>
            <Typography.Paragraph className="text-xs text-primary-300 mb-2">
              &lt;Button.Primary /&gt;
            </Typography.Paragraph>
            <div className="flex flex-wrap gap-3">
              <Button.Primary variant="solid" size="lg">
                Primary Large
              </Button.Primary>
              <Button.Primary variant="solid" size="base">
                Primary Base
              </Button.Primary>
              <Button.Primary variant="solid" size="sm">
                Primary Small
              </Button.Primary>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button.Primary variant="outline" size="lg">
                Outline Large
              </Button.Primary>
              <Button.Primary variant="outline" size="base">
                Outline Base
              </Button.Primary>
              <Button.Primary variant="outline" size="sm">
                Outline Small
              </Button.Primary>
            </div>
            <Typography.Small className="text-primary-300">
              ✨ Outline buttons have slide-in fill animation on hover
            </Typography.Small>
            <div className="flex flex-wrap gap-3">
              <Button.Primary variant="text" size="lg">
                Text Large
              </Button.Primary>
              <Button.Primary variant="text" size="base">
                Text Base
              </Button.Primary>
              <Button.Primary variant="text" size="sm">
                Text Small
              </Button.Primary>
            </div>
          </div>

          {/* Secondary Variant */}
          <div className="space-y-3 border-l-2 border-primary-700 pl-6 mt-6">
            <Typography.Heading level={3}>
              Secondary (Neutral)
            </Typography.Heading>
            <Typography.Paragraph className="text-xs text-primary-300 mb-2">
              &lt;Button.Secondary /&gt; with slide animation
            </Typography.Paragraph>
            <div className="flex flex-wrap gap-3">
              <Button.Secondary variant="solid" size="lg">
                Secondary Large
              </Button.Secondary>
              <Button.Secondary variant="solid" size="base">
                Secondary Base
              </Button.Secondary>
              <Button.Secondary variant="solid" size="sm">
                Secondary Small
              </Button.Secondary>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button.Secondary variant="outline" size="lg">
                Outline Large
              </Button.Secondary>
              <Button.Secondary variant="outline" size="base">
                Outline Base
              </Button.Secondary>
              <Button.Secondary variant="outline" size="sm">
                Outline Small
              </Button.Secondary>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button.Secondary variant="text" size="lg">
                Text Large
              </Button.Secondary>
              <Button.Secondary variant="text" size="base">
                Text Base
              </Button.Secondary>
              <Button.Secondary variant="text" size="sm">
                Text Small
              </Button.Secondary>
            </div>
          </div>

          {/* Disabled State */}
          <div className="space-y-3 border-l-2 border-primary-700 pl-6 mt-6">
            <Typography.Heading level={3}>Disabled State</Typography.Heading>
            <div className="flex flex-wrap gap-3">
              <Button.Primary variant="solid" size="base" disabled>
                Disabled Primary
              </Button.Primary>
              <Button.Secondary variant="solid" size="base" disabled>
                Disabled Secondary
              </Button.Secondary>
            </div>
          </div>

          {/* Usage Examples */}
          <div className="space-y-3 border-l-2 border-primary-700 pl-6 mt-6">
            <Typography.Heading level={3}>Usage Examples</Typography.Heading>
            <div className="flex flex-wrap gap-3">
              <Button.Primary variant="solid" size="lg">
                Join Now
              </Button.Primary>
              <Button.Secondary variant="outline" size="base">
                Learn More
              </Button.Secondary>
              <Button.Secondary variant="text" size="sm">
                View Leaderboard
              </Button.Secondary>
            </div>
          </div>
        </section>

        {/* ===== SLANT BUTTON SECTION ===== */}
        <section className="space-y-4">
          <Typography.Heading level={2} className="text-secondary-500">
            Slant Button
          </Typography.Heading>
          <Typography.Paragraph className="text-xs text-primary-300 mb-2">
            &lt;Button.Slant /&gt; - Hero/section CTAs with clip-path slant
          </Typography.Paragraph>

          {/* Primary Variant */}
          <div className="space-y-3 border-l-2 border-secondary-700 pl-6">
            <Typography.Heading level={3}>Primary (Gold)</Typography.Heading>
            <div className="flex flex-wrap gap-3">
              <Button.Slant variant="primary" size="lg">
                Join Discord
              </Button.Slant>
              <Button.Slant variant="primary" size="base">
                Join Discord
              </Button.Slant>
              <Button.Slant variant="primary" size="sm">
                Join
              </Button.Slant>
            </div>
          </div>

          {/* Secondary Variant */}
          <div className="space-y-3 border-l-2 border-primary-700 pl-6 mt-6">
            <Typography.Heading level={3}>Secondary (White)</Typography.Heading>
            <div className="flex flex-wrap gap-3">
              <Button.Slant variant="secondary" size="lg">
                Get Started
              </Button.Slant>
              <Button.Slant variant="secondary" size="base">
                Get Started
              </Button.Slant>
              <Button.Slant variant="secondary" size="sm">
                Start
              </Button.Slant>
            </div>
          </div>

          {/* Right Slant */}
          <div className="space-y-3 border-l-2 border-primary-700 pl-6 mt-6">
            <Typography.Heading level={3}>Right Slant</Typography.Heading>
            <div className="flex flex-wrap gap-3">
              <Button.Slant variant="primary" size="base" slant="right">
                Join Server
              </Button.Slant>
              <Button.Slant variant="secondary" size="base" slant="right">
                View Store
              </Button.Slant>
            </div>
          </div>

          {/* Real Example */}
          <div className="space-y-3 border-l-2 border-secondary-700 pl-6 mt-6">
            <Typography.Heading level={3}>Real Example</Typography.Heading>
            <div className="bg-primary-700 p-8 rounded-lg flex flex-col sm:flex-row justify-center gap-4">
              <Button.Slant variant="primary" size="lg">
                Join Discord
              </Button.Slant>
              <Button.Slant variant="secondary" size="lg">
                Visit Store
              </Button.Slant>
            </div>
          </div>
        </section>

        {/* ===== LOGO SECTION ===== */}
        <section className="space-y-4">
          <Typography.Heading level={2} className="text-secondary-500">
            Logo Component
          </Typography.Heading>
          <Typography.Paragraph className="text-xs text-primary-300 mb-2">
            &lt;Logo variant=&quot;icon|name&quot; color=&quot;black|white&quot;
            /&gt; - Dynamic container sizing
          </Typography.Paragraph>

          {/* Icon Variants */}
          <div className="space-y-3 border-l-2 border-secondary-700 pl-6">
            <Typography.Heading level={3}>Icon Variant</Typography.Heading>
            <div className="flex flex-wrap items-end gap-4">
              <div className="w-16 h-16">
                <Logo variant="icon" color="white" />
              </div>
              <div className="w-24 h-24">
                <Logo variant="icon" color="white" />
              </div>
              <div className="w-32 h-32">
                <Logo variant="icon" color="white" />
              </div>
              <div className="w-16 h-16 bg-white rounded">
                <Logo variant="icon" color="black" />
              </div>
              <div className="w-24 h-24 bg-white rounded">
                <Logo variant="icon" color="white" />
              </div>
              <div className="w-32 h-32 bg-white rounded">
                <Logo variant="icon" color="white" />
              </div>
            </div>
          </div>

          {/* Name Variants */}
          <div className="space-y-3 border-l-2 border-primary-700 pl-6 mt-6">
            <Typography.Heading level={3}>Name Variant</Typography.Heading>
            <div className="flex flex-wrap items-end gap-4">
              <div className="w-32 h-16">
                <Logo variant="name" color="white" />
              </div>
              <div className="w-48 h-24">
                <Logo variant="name" color="white" />
              </div>
              <div className="w-64 h-32">
                <Logo variant="name" color="white" />
              </div>
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <div className="w-32 h-16 bg-white rounded">
                <Logo variant="name" color="black" />
              </div>
              <div className="w-48 h-24 bg-white rounded">
                <Logo variant="name" color="white" />
              </div>
              <div className="w-64 h-32 bg-white rounded">
                <Logo variant="name" color="white" />
              </div>
            </div>
          </div>

          {/* Real Examples */}
          <div className="space-y-3 border-l-2 border-secondary-700 pl-6 mt-6">
            <Typography.Heading level={3}>Real Examples</Typography.Heading>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Hero style */}
              <div className="col-span-3 bg-gradient-to-br from-primary-900 to-secondary-700 p-8 rounded-lg flex flex-col items-center justify-center">
                <div className="w-32 h-32 mb-4">
                  <Logo variant="icon" color="white" />
                </div>
                <Typography.Heading
                  type="display"
                  level={2}
                  className="text-white text-center uppercase"
                >
                  GTA <span className="text-secondary-500">Competitive</span>{" "}
                  League
                </Typography.Heading>
              </div>
              {/* Navbar style */}
              <div>
                <Typography.Heading level={6} className="mb-3">
                  Navbar Usage
                </Typography.Heading>
                <div className="bg-primary-900 p-6 rounded-lg flex items-center justify-center">
                  <div className="w-48 h-12">
                    <Logo variant="name" color="white" />
                  </div>
                </div>
              </div>
              {/* Footer style */}
              <div>
                <Typography.Heading level={6} className="mb-3">
                  Footer Usage
                </Typography.Heading>
                <div className="bg-primary-700 p-6 rounded-lg flex items-center justify-center">
                  <div className="w-48 h-12">
                    <Logo variant="name" color="white" />
                  </div>
                </div>
              </div>
              {/* Card style */}
              <div>
                <Typography.Heading level={6} className="mb-3">
                  Card Usage
                </Typography.Heading>
                <div className="bg-primary-900 border-2 border-secondary-700 p-6 rounded-lg">
                  <div className="w-full h-24 flex items-center justify-center">
                    <Logo variant="name" color="white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== COLOR PALETTE REFERENCE ===== */}
        <section className="space-y-4">
          <Typography.Heading level={2} className="text-secondary-500">
            Color Palette Reference
          </Typography.Heading>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <div className="h-16 bg-primary-900 rounded border border-primary-700" />
              <Typography.Small>primary-900</Typography.Small>
            </div>
            <div className="space-y-1">
              <div className="h-16 bg-primary-700 rounded" />
              <Typography.Small>primary-700</Typography.Small>
            </div>
            <div className="space-y-1">
              <div className="h-16 bg-primary-500 rounded" />
              <Typography.Small>primary-500</Typography.Small>
            </div>
            <div className="space-y-1">
              <div className="h-16 bg-primary-300 rounded" />
              <Typography.Small>primary-300</Typography.Small>
            </div>
            <div className="space-y-1">
              <div className="h-16 bg-primary-100 rounded" />
              <Typography.Small>primary-100</Typography.Small>
            </div>
            <div className="space-y-1">
              <div className="h-16 bg-secondary-700 rounded" />
              <Typography.Small>secondary-700</Typography.Small>
            </div>
            <div className="space-y-1">
              <div className="h-16 bg-secondary-500 rounded" />
              <Typography.Small>secondary-500</Typography.Small>
            </div>
            <div className="space-y-1">
              <div className="h-16 bg-secondary-300 rounded" />
              <Typography.Small>secondary-300</Typography.Small>
            </div>
            <div className="space-y-1">
              <div className="h-16 bg-tertiary-red rounded" />
              <Typography.Small>tertiary-red</Typography.Small>
            </div>
            <div className="space-y-1">
              <div className="h-16 bg-tertiary-white rounded" />
              <Typography.Small>tertiary-white</Typography.Small>
            </div>
            <div className="space-y-1">
              <div className="h-16 bg-gray-light rounded" />
              <Typography.Small>gray-light</Typography.Small>
            </div>
            <div className="space-y-1">
              <div className="h-16 bg-gray-dark rounded" />
              <Typography.Small>gray-dark</Typography.Small>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
