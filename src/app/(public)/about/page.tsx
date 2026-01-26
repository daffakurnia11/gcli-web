import type { Metadata } from "next";

import CorePillars from "./_components/CorePillars";
import Description from "./_components/Description";
import PlayerToDo from "./_components/PlayerToDo";
import ProsCons from "./_components/ProsCons";
import Title from "./_components/Title";
import Vision from "./_components/Vision";

export const metadata: Metadata = {
  title: {
    absolute: "About | GCLI",
  },
  description:
    "Learn about GCLI's vision, core pillars, and what makes us Indonesia's leading competitive FiveM server. Discover our community values, player expectations, and the pros and cons of joining our competitive GTA V gaming league.",
  keywords: [
    "GCLI about",
    "GCLI vision",
    "FiveM server Indonesia",
    "GTA V community",
    "competitive gaming values",
    "GCLI core pillars",
    "FiveM league rules",
    "GTA V competitive",
    "Indonesia gaming server",
    "FiveM community standards",
  ],
  openGraph: {
    title: "About GCLI - Our Vision & Values",
    description:
      "Learn about GCLI's vision, core pillars, and what makes us Indonesia's leading competitive FiveM server.",
    url: "/about",
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
    title: "About GCLI - Our Vision & Values",
    description:
      "Learn about GCLI's vision, core pillars, and what makes us Indonesia's leading competitive FiveM server.",
  },
};

export default function AboutPage() {
  return (
    <main className="bg-primary-900 h-full min-h-dvh text-gray-dark">
      <Title />
      <Description />
      <Vision />
      <CorePillars />
      <PlayerToDo />
      <ProsCons />
    </main>
  );
}
