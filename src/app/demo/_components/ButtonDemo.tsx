import { Typography } from "@/components/typography";

import LeftSlantButtonDemo from "./LeftSlantButtonDemo";
import PrimaryButtonDemo from "./PrimaryButtonDemo";
import RightSlantButtonDemo from "./RightSlantButtonDemo";
import SecondaryButtonDemo from "./SecondaryButtonDemo";

export default function ButtonDemo() {
  return (
    <>
      {/* ===== BUTTONS SECTION ===== */}
      <section className="space-y-4">
        <Typography.Heading level={2} className="text-secondary-500">
          Button Component
        </Typography.Heading>

        {/* Combined Grid - All Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <PrimaryButtonDemo />
          <SecondaryButtonDemo />
        </div>
      </section>

      {/* ===== SLANT BUTTONS SECTION ===== */}
      <section className="space-y-4">
        <Typography.Heading level={2} className="text-secondary-500">
          Slant Button Component
        </Typography.Heading>

        {/* Combined Grid - All Slant Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <LeftSlantButtonDemo />
          <RightSlantButtonDemo />
        </div>
      </section>
    </>
  );
}
