import "./styles.css";

import type { Metadata } from "next";

import { auth } from "@/lib/auth";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Footer, Navbar } from "@/components";

export const metadata: Metadata = {
  title: {
    default: "GCLI - GTA Competitive League Indonesia",
    template: "%s | GCLI",
  },
  description: "GCLI is a competitive FiveM gaming server in Indonesia. Join our community, participate in leagues, and experience competitive GTA V multiplayer gaming.",
  keywords: ["GCLI", "GTA Competitive League Indonesia", "FiveM", "GTA V", "competitive gaming", "Indonesia", "FiveM server", "GTA multiplayer"],
  authors: [{ name: "GCLI" }],
  creator: "GCLI",
  publisher: "GCLI",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "GCLI",
    title: "GCLI - GTA Competitive League Indonesia",
    description: "GCLI is a competitive FiveM gaming server in Indonesia. Join our community, participate in leagues, and experience competitive GTA V multiplayer gaming.",
    images: [
      {
        url: "/Logo/icon.png",
        width: 512,
        height: 512,
        alt: "GCLI Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "GCLI - GTA Competitive League Indonesia",
    description: "GCLI is a competitive FiveM gaming server in Indonesia. Join our community and experience competitive GTA V multiplayer gaming.",
    images: ["/Logo/icon.png"],
  },
  icons: {
    icon: "/Logo/icon.png",
    shortcut: "/Logo/icon.png",
    apple: "/Logo/icon.png",
  },
  manifest: "/manifest.json",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body className="antialiased">
        <SessionProvider session={session}>
          <Navbar />
          {children}
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
