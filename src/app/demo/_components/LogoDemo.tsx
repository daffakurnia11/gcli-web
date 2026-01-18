import { Logo } from "@/components";
import { Typography } from "@/components/typography";

export default function LogoDemo() {
  return (
    <>
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
    </>
  );
}
