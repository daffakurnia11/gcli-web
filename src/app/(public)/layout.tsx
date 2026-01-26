import type { ReactNode } from "react";

import { Footer, Navbar } from "@/components";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
