import { CorePillarsMolecules } from "@/molecules";

import GameLoop from "./_components/GameLoop";
import Hero from "./_components/Hero";
import HomeCTA from "./_components/HomeCTA";
import ServerInfo from "./_components/ServerInfo";
import Standings from "./_components/Standings";
import TeamCarousel from "./_components/TeamCarousel";

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
