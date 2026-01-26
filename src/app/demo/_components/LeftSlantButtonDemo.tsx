import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/button";
import { Typography } from "@/components/typography";

export default function LeftSlantButtonDemo() {
  return (
    <>
      {/* Left Slant Column */}
      <div className="space-y-6">
        <div className="space-y-3 border-l-2 border-secondary-500 pl-6">
          <Typography.Heading level={3}>Left Slant</Typography.Heading>
          <Typography.Paragraph className="text-xs text-primary-300 mb-2">
            &lt;Button.Slant slant=&quot;left&quot; /&gt;
          </Typography.Paragraph>

          {/* Sizes */}
          <div className="space-y-2">
            <Typography.Paragraph className="text-sm text-primary-300">
              Sizes:
            </Typography.Paragraph>
            <div className="flex flex-wrap gap-2">
              <Button.Slant slant="left" size="lg">
                Large
              </Button.Slant>
              <Button.Slant slant="left" size="base">
                Base
              </Button.Slant>
              <Button.Slant slant="left" size="sm">
                Small
              </Button.Slant>
            </div>
          </div>

          {/* Variants */}
          <div className="space-y-2">
            <Typography.Paragraph className="text-sm text-primary-300">
              Variants:
            </Typography.Paragraph>
            <div className="flex flex-wrap gap-2">
              <Button.Slant slant="left" size="base" variant="primary">
                Primary
              </Button.Slant>
              <Button.Slant slant="left" size="base" variant="secondary">
                Secondary
              </Button.Slant>
            </div>
          </div>

          {/* With Icons */}
          <div className="space-y-2">
            <Typography.Paragraph className="text-sm text-primary-300">
              With Icons:
            </Typography.Paragraph>
            <div className="flex flex-wrap gap-2">
              <Button.Slant
                slant="left"
                size="base"
                variant="primary"
                prefix={<ChevronRight />}
              >
                Prefix
              </Button.Slant>
              <Button.Slant
                slant="left"
                size="base"
                variant="secondary"
                suffix={<ChevronLeft />}
              >
                Suffix
              </Button.Slant>
            </div>
          </div>

          {/* States */}
          <div className="space-y-2">
            <Typography.Paragraph className="text-sm text-primary-300">
              States:
            </Typography.Paragraph>
            <div className="flex flex-wrap gap-2">
              <Button.Slant slant="left" size="base" variant="primary">
                Enabled
              </Button.Slant>
              <Button.Slant slant="left" size="base" variant="primary" disabled>
                Disabled
              </Button.Slant>
            </div>
          </div>

          {/* Full Width */}
          <div className="space-y-2">
            <Typography.Paragraph className="text-sm text-primary-300">
              Full Width:
            </Typography.Paragraph>
            <Button.Slant slant="left" size="base" fullWidth>
              Full Width Slant
            </Button.Slant>
            <Button.Slant
              slant="left"
              size="base"
              fullWidth
              prefix={<ChevronLeft />}
              suffix={<ChevronRight />}
            >
              Full Width Slant with Icons
            </Button.Slant>
          </div>
        </div>
      </div>
    </>
  );
}
