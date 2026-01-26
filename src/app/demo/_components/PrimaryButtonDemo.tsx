import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/button";
import { Typography } from "@/components/typography";

export default function PrimaryButtonDemo() {
  return (
    <>
      {/* Primary Column */}
      <div className="space-y-6">
        <div className="space-y-3 border-l-2 border-secondary-700 pl-6">
          <Typography.Heading level={3}>Primary (Gold)</Typography.Heading>
          <Typography.Paragraph className="text-xs text-primary-300 mb-2">
            &lt;Button.Primary /&gt; with prefix, suffix, fullWidth
          </Typography.Paragraph>

          {/* Sizes */}
          <div className="space-y-2">
            <Typography.Paragraph className="text-sm text-primary-300">
              Sizes:
            </Typography.Paragraph>
            <div className="flex flex-wrap gap-2">
              <Button.Primary variant="solid" size="lg" className="flex-1">
                Large
              </Button.Primary>
              <Button.Primary variant="solid" size="base" className="flex-1">
                Base
              </Button.Primary>
              <Button.Primary variant="solid" size="sm" className="flex-1">
                Small
              </Button.Primary>
            </div>
          </div>

          {/* Variants */}
          <div className="space-y-2">
            <Typography.Paragraph className="text-sm text-primary-300">
              Variant:
            </Typography.Paragraph>
            <div className="flex flex-wrap gap-2">
              <Button.Primary variant="solid" size="base" className="flex-1">
                Solid
              </Button.Primary>
              <Button.Primary variant="outline" size="base" className="flex-1">
                Outline
              </Button.Primary>
              <Button.Primary variant="text" size="base" className="flex-1">
                Text
              </Button.Primary>
            </div>
          </div>

          {/* With Icons */}
          <div className="space-y-2">
            <Typography.Paragraph className="text-sm text-primary-300">
              With Icons:
            </Typography.Paragraph>
            <div className="flex flex-wrap gap-2">
              <Button.Primary
                variant="solid"
                size="base"
                prefix={<ChevronLeft />}
              >
                Prefix
              </Button.Primary>
              <Button.Primary
                variant="solid"
                size="base"
                suffix={<ChevronRight />}
              >
                Suffix
              </Button.Primary>
            </div>
            <Button.Primary
              variant="solid"
              size="base"
              prefix={<ChevronLeft />}
              suffix={<ChevronRight />}
            >
              Prefix & Suffix
            </Button.Primary>
          </div>

          {/* States */}
          <div className="space-y-2">
            <Typography.Paragraph className="text-sm text-primary-300">
              States:
            </Typography.Paragraph>
            <div className="flex flex-wrap gap-2">
              <Button.Primary
                variant="solid"
                size="base"
                prefix={<ChevronLeft />}
              >
                Enabled
              </Button.Primary>
              <Button.Primary
                variant="solid"
                size="base"
                prefix={<ChevronLeft />}
                disabled
              >
                Disabled
              </Button.Primary>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button.Primary
                variant="outline"
                size="base"
                prefix={<ChevronLeft />}
              >
                Enabled
              </Button.Primary>
              <Button.Primary
                variant="outline"
                size="base"
                prefix={<ChevronLeft />}
                disabled
              >
                Disabled
              </Button.Primary>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button.Primary
                variant="text"
                size="base"
                prefix={<ChevronLeft />}
              >
                Enabled
              </Button.Primary>
              <Button.Primary
                variant="text"
                size="base"
                prefix={<ChevronLeft />}
                disabled
              >
                Disabled
              </Button.Primary>
            </div>
          </div>

          {/* Full Width */}
          <div className="space-y-2">
            <Typography.Paragraph className="text-sm text-primary-300">
              Full Width:
            </Typography.Paragraph>
            <Button.Primary variant="solid" size="base" fullWidth>
              Full Width Primary
            </Button.Primary>
            <Button.Primary
              variant="solid"
              size="base"
              fullWidth
              prefix={<ChevronLeft />}
              suffix={<ChevronRight />}
            >
              Full Width Primary with Icons
            </Button.Primary>
          </div>
        </div>
      </div>
    </>
  );
}
