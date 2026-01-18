import { Typography } from "@/components/typography";

export default function TypographyDemo() {
  return (
    <>
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
            <Typography.Heading level={3} as="h1" className="text-tertiary-red">
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
            Emphasized paragraph with larger size and gold color for highlights.
          </Typography.Paragraph>

          {/* Custom element */}
          <Typography.Paragraph as="div" className="bg-primary-700 p-4 rounded">
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
            Join the most competitive FiveM server in Indonesia. Battle through
            factions, climb the leaderboard, and prove your dominance.
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
    </>
  );
}
