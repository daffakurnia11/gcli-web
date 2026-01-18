import Link from "next/link";

import { Footer, Navbar } from "@/components";
import { Button } from "@/components/button";

export default function Home() {
  return (
    <main className="bg-primary-900 h-full min-h-dvh text-gray-dark">
      <Navbar />
      <div className="w-full h-dvh flex items-center justify-center">
        <Link href="/demo">
          <Button.Slant variant="primary">
            Go to Demo Component Page
          </Button.Slant>
        </Link>
      </div>
      <Footer />
    </main>
  );
}
