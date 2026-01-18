import { Heading, Paragraph, Small } from "@/components/typography";

export default function Home() {
  return (
    <main className="min-h-screen bg-primary-900 text-gray-dark p-6 sm:p-10">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* ===== DISPLAY SECTION ===== */}
        <section className="space-y-4">
          <Heading level={2} className="text-secondary-500">
            Display Type (Rajdhani)
          </Heading>
          <div className="space-y-4 border-l-2 border-secondary-700 pl-6">
            <Heading type="display" level={1} className="text-6xl sm:text-7xl">
              HERO DISPLAY
            </Heading>
            <Heading type="display" level={2} className="text-5xl">
              Large Display Title
            </Heading>
            <Heading type="display" level={3} className="text-4xl">
              Medium Display
            </Heading>
            <Heading type="display" level={4} className="text-3xl">
              Small Display
            </Heading>
          </div>
        </section>

        {/* ===== HEADINGS SECTION ===== */}
        <section className="space-y-4">
          <Heading level={2} className="text-secondary-500">
            Heading Type (Inter)
          </Heading>
          <div className="space-y-3 border-l-2 border-primary-700 pl-6">
            <Heading level={1}>Heading Level 1 - Main Title</Heading>
            <Heading level={2}>Heading Level 2 - Section Title</Heading>
            <Heading level={3}>Heading Level 3 - Subsection</Heading>
            <Heading level={4}>Heading Level 4 - Component Title</Heading>
            <Heading level={5}>Heading Level 5 - Small Title</Heading>
            <Heading level={6}>Heading Level 6 - Micro Title</Heading>
          </div>
        </section>

        {/* ===== CUSTOM ELEMENT SECTION ===== */}
        <section className="space-y-4">
          <Heading level={2} className="text-secondary-500">
            Custom Elements (as prop)
          </Heading>
          <div className="space-y-2 border-l-2 border-primary-700 pl-6">
            <div className="flex items-center gap-4">
              <code className="text-xs text-secondary-300">level={3} as="h1"</code>
              <Heading level={3} as="h1" className="text-tertiary-red">
                H1 element with Level 3 styles
              </Heading>
            </div>
            <div className="flex items-center gap-4">
              <code className="text-xs text-secondary-300">level={2} as="div"</code>
              <Heading level={2} as="div" className="text-secondary-500">
                Div element with Level 2 styles
              </Heading>
            </div>
            <div className="flex items-center gap-4">
              <code className="text-xs text-secondary-300">type="display" as="span"</code>
              <Heading type="display" level={4} as="span" className="text-tertiary-white">
                Span element with Display type
              </Heading>
            </div>
          </div>
        </section>

        {/* ===== PARAGRAPH SECTION ===== */}
        <section className="space-y-4">
          <Heading level={2} className="text-secondary-500">
            Paragraph Component
          </Heading>
          <div className="space-y-4 border-l-2 border-primary-700 pl-6">
            <Paragraph>
              Default paragraph text using Inter font family. Perfect for body
              content and longer passages of text.
            </Paragraph>
            <Paragraph className="text-primary-300">
              Muted paragraph text with custom className for secondary
              information.
            </Paragraph>
            <Paragraph className="text-secondary-500 text-lg">
              Emphasized paragraph with larger size and gold color for highlights.
            </Paragraph>

            {/* Custom element */}
            <Paragraph as="div" className="bg-primary-700 p-4 rounded">
              Paragraph as div element with custom background styling.
            </Paragraph>
          </div>
        </section>

        {/* ===== SMALL SECTION ===== */}
        <section className="space-y-4">
          <Heading level={2} className="text-secondary-500">
            Small Component
          </Heading>
          <div className="space-y-3 border-l-2 border-primary-700 pl-6">
            <div className="flex items-center gap-2">
              <Small>Default small text (span)</Small>
              <span className="text-primary-500">|</span>
              <Small className="text-primary-300">Muted small text</Small>
            </div>
            <Small className="text-secondary-500">
              Gold colored small text for labels and tags
            </Small>
            <Small as="div" className="bg-primary-700 inline-block px-3 py-1 rounded">
              Small as div - styled like a badge
            </Small>
            <Small as="p" className="text-gray-light">
              Small as paragraph element for captions and notes
            </Small>
          </div>
        </section>

        {/* ===== COMBINED EXAMPLE ===== */}
        <section className="space-y-4">
          <Heading level={2} className="text-secondary-500">
            Combined Example
          </Heading>
          <article className="bg-primary-700 p-6 rounded-lg space-y-4">
            <Heading type="display" level={2} className="text-secondary-700">
              GCLI League Season 1
            </Heading>
            <Paragraph>
              Join the most competitive FiveM server in Indonesia. Battle
              through factions, climb the leaderboard, and prove your dominance.
            </Paragraph>
            <div className="flex gap-4 text-sm">
              <Small className="text-secondary-500">128 Players Online</Small>
              <span className="text-primary-500">•</span>
              <Small className="text-tertiary-red">Live Season</Small>
            </div>
          </article>
        </section>

        {/* ===== COLOR PALETTE REFERENCE ===== */}
        <section className="space-y-4">
          <Heading level={2} className="text-secondary-500">
            Color Palette Reference
          </Heading>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <div className="h-16 bg-primary-900 rounded border border-primary-700"></div>
              <Small>primary-900</Small>
            </div>
            <div className="space-y-1">
              <div className="h-16 bg-primary-700 rounded"></div>
              <Small>primary-700</Small>
            </div>
            <div className="space-y-1">
              <div className="h-16 bg-primary-500 rounded"></div>
              <Small>primary-500</Small>
            </div>
            <div className="space-y-1">
              <div className="h-16 bg-primary-300 rounded"></div>
              <Small>primary-300</Small>
            </div>
            <div className="space-y-1">
              <div className="h-16 bg-primary-100 rounded"></div>
              <Small>primary-100</Small>
            </div>
            <div className="space-y-1">
              <div className="h-16 bg-secondary-700 rounded"></div>
              <Small>secondary-700</Small>
            </div>
            <div className="space-y-1">
              <div className="h-16 bg-secondary-500 rounded"></div>
              <Small>secondary-500</Small>
            </div>
            <div className="space-y-1">
              <div className="h-16 bg-secondary-300 rounded"></div>
              <Small>secondary-300</Small>
            </div>
            <div className="space-y-1">
              <div className="h-16 bg-tertiary-red rounded"></div>
              <Small>tertiary-red</Small>
            </div>
            <div className="space-y-1">
              <div className="h-16 bg-tertiary-white rounded"></div>
              <Small>tertiary-white</Small>
            </div>
            <div className="space-y-1">
              <div className="h-16 bg-gray-light rounded"></div>
              <Small>gray-light</Small>
            </div>
            <div className="space-y-1">
              <div className="h-16 bg-gray-dark rounded"></div>
              <Small>gray-dark</Small>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
