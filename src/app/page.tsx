import type { Metadata } from "next";

import { CorePillarsMolecules } from "@/molecules";

import GameLoop from "./_components/GameLoop";
import Hero from "./_components/Hero";
import HomeCTA from "./_components/HomeCTA";
import ServerInfo from "./_components/ServerInfo";
import Standings from "./_components/Standings";
import TeamCarousel from "./_components/TeamCarousel";

export const metadata: Metadata = {
  title: "Home",
  description: "Join GCLI - Indonesia's premier competitive FiveM gaming server. Experience professional GTA V multiplayer leagues, team competitions, and an active gaming community. Check our server stats, team standings, and join the competition today.",
  keywords: [
    "GCLI home",
    "FiveM Indonesia",
    "GTA V competitive server",
    "FiveM league",
    "GTA multiplayer Indonesia",
    "competitive gaming",
    "FiveM server status",
    "GTA V tournaments",
    "Indonesia gaming community",
    "FiveM standings",
  ],
  openGraph: {
    title: "GCLI - Home",
    description: "Join GCLI - Indonesia's premier competitive FiveM gaming server. Experience professional GTA V multiplayer leagues, team competitions, and an active gaming community.",
    url: "/",
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
    title: "GCLI - Home",
    description: "Join GCLI - Indonesia's premier competitive FiveM gaming server. Experience professional GTA V multiplayer leagues and team competitions.",
  },
};

export default function HomePage() {
  return (
    <main className="bg-primary-900 h-full min-h-dvh text-gray-dark">
      <Hero />
      <section className="container mx-auto py-20">
        <CorePillarsMolecules />
      </section>
      <GameLoop />
      <ServerInfo />
      <TeamCarousel />
      <Standings />
      <HomeCTA />
    </main>
  );
}
