import { Typography } from "@/components/typography";

export default function ColorPaletteDemo() {
  return (
    <>
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
    </>
  );
}
