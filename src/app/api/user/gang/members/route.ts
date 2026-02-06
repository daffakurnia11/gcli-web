import { NextResponse } from "next/server";

import { getAccountIdFromRequest } from "@/lib/apiAuth";
import { prisma } from "@/lib/prisma";
import { resolveCitizenIdForAccount } from "@/lib/userCitizenId";

type ParsedGang = {
  name?: string;
  label?: string;
  isboss?: boolean;
  grade?: {
    level?: number;
    name?: string;
  };
};

type ParsedCharinfo = {
  firstname?: string;
  lastname?: string;
};

type FiveMPlayer = {
  id: number;
  name: string;
  ping: number;
  endpoint: string;
  identifiers: string[];
};

const FIVEM_API_BASE =
  process.env.FIVEM_API_BASE ?? process.env.FIVEM_API_BASE_URL ?? null;

const parseJson = <T>(value: string | null): T | null => {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const normalizeName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const getNameVariants = (value: string) => {
  const normalized = normalizeName(value);
  const variants = new Set<string>([normalized]);

  const splitDash = normalized.split(" - ");
  if (splitDash.length > 1) {
    variants.add(splitDash[splitDash.length - 1]);
    variants.add(splitDash.slice(1).join(" - "));
  }

  return variants;
};

export async function GET(request: Request) {
  try {
    const accountId = await getAccountIdFromRequest(request);
    if (!accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolved = await resolveCitizenIdForAccount(accountId);
    if (!resolved?.citizenId) {
      return NextResponse.json(
        {
          team: null,
          currentMember: null,
          grades: [],
          members: [],
          message: "No linked character was found for this account.",
        },
        { status: 200 },
      );
    }

    const player = await prisma.players.findUnique({
      where: { citizenid: resolved.citizenId },
      select: { gang: true },
    });
    const parsedGang = parseJson<ParsedGang>(player?.gang ?? null);
    const gangName = parsedGang?.name?.toLowerCase();

    if (!gangName || gangName === "none") {
      return NextResponse.json(
        {
          team: null,
          currentMember: null,
          grades: [],
          members: [],
          message: "You are not currently assigned to a team.",
        },
        { status: 200 },
      );
    }

    const actorGradeLevel = parsedGang?.grade?.level ?? 0;
    const actorIsBoss = Boolean(parsedGang?.isboss);

    const [team, grades, groupMembers] = await Promise.all([
      prisma.tl_gangs.findUnique({
        where: { name: gangName },
        select: { name: true, label: true },
      }),
      prisma.tl_gang_grades.findMany({
        where: { gang_name: gangName },
        select: { grade: true, name: true },
      }),
      prisma.player_groups.findMany({
        where: {
          type: "gang",
          group: gangName,
        },
        select: {
          citizenid: true,
          grade: true,
        },
        orderBy: [{ grade: "desc" }, { citizenid: "asc" }],
      }),
    ]);

    const gradeMap = new Map<number, string>();
    grades.forEach((grade) => {
      gradeMap.set(grade.grade, grade.name);
    });

    const citizenIds = groupMembers.map((member) => member.citizenid);

    const playerRows = citizenIds.length
      ? await prisma.players.findMany({
          where: {
            citizenid: { in: citizenIds },
          },
          select: {
            citizenid: true,
            name: true,
            charinfo: true,
            last_updated: true,
            last_logged_out: true,
          },
        })
      : [];

    const playerMap = new Map(playerRows.map((member) => [member.citizenid, member]));

    let liveNameSet = new Set<string>();
    if (FIVEM_API_BASE) {
      try {
        const liveResponse = await fetch(`${FIVEM_API_BASE}/players.json`, {
          cache: "no-store",
        });
        if (liveResponse.ok) {
          const livePlayers = (await liveResponse.json()) as FiveMPlayer[];
          liveNameSet = livePlayers.reduce((acc, livePlayer) => {
            if (!livePlayer?.name) {
              return acc;
            }
            const variants = getNameVariants(livePlayer.name);
            variants.forEach((variant) => acc.add(variant));
            return acc;
          }, new Set<string>());
        }
      } catch {
        liveNameSet = new Set<string>();
      }
    }

    const members = groupMembers.map((member) => {
      const profile = playerMap.get(member.citizenid);
      const charinfo = parseJson<ParsedCharinfo>(profile?.charinfo ?? null);
      const characterName = [charinfo?.firstname, charinfo?.lastname]
        .filter((value): value is string => Boolean(value && value.trim()))
        .join(" ")
        .trim();
      const candidateNames = new Set<string>();
      if (characterName) {
        getNameVariants(characterName).forEach((variant) =>
          candidateNames.add(variant),
        );
      }
      if (profile?.name) {
        getNameVariants(profile.name).forEach((variant) => candidateNames.add(variant));
      }

      const status = Array.from(candidateNames).some((candidate) =>
        liveNameSet.has(candidate),
      )
        ? "online"
        : "offline";

      return {
        citizenId: member.citizenid,
        playerName: profile?.name ?? null,
        characterName: characterName || profile?.name || member.citizenid,
        gradeLevel: member.grade,
        gradeName: gradeMap.get(member.grade) ?? `Grade ${member.grade}`,
        status,
        lastUpdated: profile?.last_updated ?? null,
        lastLoggedOut: profile?.last_logged_out ?? null,
        canManage:
          actorIsBoss &&
          member.citizenid !== resolved.citizenId &&
          member.grade < actorGradeLevel,
      };
    });

    return NextResponse.json(
      {
        team: {
          code: team?.name ?? gangName,
          name: team?.label ?? parsedGang?.label ?? gangName,
        },
        currentMember: {
          citizenId: resolved.citizenId,
          gradeLevel: actorGradeLevel,
          isBoss: actorIsBoss,
        },
        grades: grades
          .map((grade) => ({
            level: grade.grade,
            name: grade.name,
          }))
          .sort((a, b) => a.level - b.level),
        members,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Team members fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
