import CorePillars from "./_components/CorePillars";
import Description from "./_components/Description";
import PlayerToDo from "./_components/PlayerToDo";
import ProsCons from "./_components/ProsCons";
import Title from "./_components/Title";
import Vision from "./_components/Vision";

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
