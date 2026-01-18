import ButtonDemo from "./_components/ButtonDemo";
import ColorPaletteDemo from "./_components/ColorPaletteDemo";
import LogoDemo from "./_components/LogoDemo";
import TypographyDemo from "./_components/TypographyDemo";

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-primary-900 text-gray-dark p-6 sm:p-10">
      <div className="max-w-4xl mx-auto space-y-12">
        <TypographyDemo />
        <ButtonDemo />
        <LogoDemo />
        <ColorPaletteDemo />
      </div>
    </main>
  );
}
