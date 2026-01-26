import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/button";
import { Typography } from "@/components/typography";

export default function SecondaryButtonDemo() {
  return (
    <>
      {/* Secondary Column */}
      <div className="space-y-6">
        <div className="space-y-3 border-l-2 border-primary-700 pl-6">
          <Typography.Heading level={3}>Secondary (Neutral)</Typography.Heading>
          <Typography.Paragraph className="text-xs text-primary-300 mb-2">
            &lt;Button.Secondary /&gt; with prefix, suffix, fullWidth
          </Typography.Paragraph>

          {/* Sizes */}
          <div className="space-y-2">
            <Typography.Paragraph className="text-sm text-primary-300">
              Sizes:
            </Typography.Paragraph>
            <div className="flex flex-wrap gap-2">
              <Button.Secondary variant="solid" size="lg" className="flex-1">
                Large
              </Button.Secondary>
              <Button.Secondary variant="solid" size="base" className="flex-1">
                Base
              </Button.Secondary>
              <Button.Secondary variant="solid" size="sm" className="flex-1">
                Small
              </Button.Secondary>
            </div>
          </div>

          {/* Variants */}
          <div className="space-y-2">
            <Typography.Paragraph className="text-sm text-primary-300">
              Variants:
            </Typography.Paragraph>
            <div className="flex flex-wrap gap-2">
              <Button.Secondary variant="solid" size="base" className="flex-1">
                Solid
              </Button.Secondary>
              <Button.Secondary
                variant="outline"
                size="base"
                className="flex-1"
              >
                Outline
              </Button.Secondary>
              <Button.Secondary variant="text" size="base" className="flex-1">
                Text
              </Button.Secondary>
            </div>
          </div>

          {/* With Icons */}
          <div className="space-y-2">
            <Typography.Paragraph className="text-sm text-primary-300">
              With Icons:
            </Typography.Paragraph>
            <div className="flex flex-wrap gap-2">
              <Button.Secondary variant="solid" size="base" prefix={<Plus />}>
                Prefix
              </Button.Secondary>
              <Button.Secondary variant="solid" size="base" suffix={<Minus />}>
                Suffix
              </Button.Secondary>
              <Button.Secondary
                variant="solid"
                size="base"
                prefix={<Plus />}
                suffix={<Minus />}
              >
                Prefix & Suffix
              </Button.Secondary>
            </div>
          </div>

          {/* States */}
          <div className="space-y-2">
            <Typography.Paragraph className="text-sm text-primary-300">
              States:
            </Typography.Paragraph>
            <div className="flex flex-wrap gap-2">
              <Button.Secondary variant="solid" size="base" prefix={<Plus />}>
                Enabled
              </Button.Secondary>
              <Button.Secondary
                variant="solid"
                size="base"
                prefix={<Plus />}
                disabled
              >
                Disabled
              </Button.Secondary>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button.Secondary variant="outline" size="base" prefix={<Plus />}>
                Enabled
              </Button.Secondary>
              <Button.Secondary
                variant="outline"
                size="base"
                prefix={<Plus />}
                disabled
              >
                Disabled
              </Button.Secondary>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button.Secondary variant="text" size="base" prefix={<Plus />}>
                Enabled
              </Button.Secondary>
              <Button.Secondary
                variant="text"
                size="base"
                prefix={<Plus />}
                disabled
              >
                Disabled
              </Button.Secondary>
            </div>
          </div>

          {/* Full Width */}
          <div className="space-y-2">
            <Typography.Paragraph className="text-sm text-primary-300">
              Full Width:
            </Typography.Paragraph>
            <Button.Secondary variant="solid" size="base" fullWidth>
              Full Width Secondary
            </Button.Secondary>
            <Button.Secondary
              variant="solid"
              size="base"
              fullWidth
              prefix={<Plus />}
              suffix={<Minus />}
            >
              Full Width Secondary with Icons
            </Button.Secondary>
          </div>
        </div>
      </div>
    </>
  );
}
