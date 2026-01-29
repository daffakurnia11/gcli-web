"use client";

import { Typography } from "@/components/typography";
import { useApiSWR } from "@/lib/swr";
import type { Character } from "@/types/api/Character";

import CharacterInfo from "./_components/CharacterInfo";
import CharacterStatus from "./_components/CharacterStatus";

export default function CharacterPage() {
  const { data, isLoading } = useApiSWR<Character>("/api/user/character");

  return (
    <div className="space-y-6">
      <div>
        <Typography.Heading
          level={4}
          as="h2"
          type="display"
          className="uppercase tracking-wider text-primary-100"
        >
          Character
        </Typography.Heading>
        <Typography.Paragraph className="text-primary-300 text-sm mt-1">
          Your in-game character information.
        </Typography.Paragraph>
      </div>
      <CharacterInfo data={data} isLoading={isLoading} />
      <CharacterStatus data={data} isLoading={isLoading} />
    </div>
  );
}
