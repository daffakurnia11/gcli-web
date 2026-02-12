import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TARGET_GANGS = ["sot", "sotg"];
const PLAYERS_PER_GANG = 20;

const parseArgs = () => {
  const args = new Set(process.argv.slice(2));
  return {
    dryRun: args.has("--dry-run"),
  };
};

const toName = (gangCode, index) => {
  const gangLabel = gangCode === "sot" ? "Sot" : "Sotg";
  return {
    firstname: `${gangLabel}${String(index).padStart(2, "0")}`,
    lastname: "Member",
  };
};

const buildJobPayload = () => ({
  name: "unemployed",
  label: "Unemployed",
  payment: 0,
  onduty: false,
  isboss: false,
  grade: {
    name: "Freelancer",
    level: 0,
  },
});

const buildGangPayload = (gangName, gangLabel, grade) => ({
  name: gangName,
  label: gangLabel,
  isboss: Boolean(grade.isboss),
  bankAuth: Boolean(grade.bankauth),
  grade: {
    name: grade.name,
    level: grade.grade,
  },
});

const pickGradeForIndex = (grades, index) => {
  const sorted = [...grades].sort((a, b) => a.grade - b.grade);
  const bossGrade = sorted.find((grade) => grade.isboss) ?? sorted[sorted.length - 1];
  const nonBoss = sorted.filter((grade) => !grade.isboss);

  if (index === 1) {
    return bossGrade;
  }

  if (nonBoss.length === 0) {
    return bossGrade;
  }

  const gradeIndex = (index - 2) % nonBoss.length;
  return nonBoss[gradeIndex];
};

const seedGang = async (gang, dryRun) => {
  const gangRecord = await prisma.tl_gangs.findUnique({
    where: { name: gang },
    select: { name: true, label: true },
  });

  if (!gangRecord) {
    throw new Error(`Gang "${gang}" not found in tl_gangs.`);
  }

  const grades = await prisma.tl_gang_grades.findMany({
    where: { gang_name: gang },
    orderBy: { grade: "asc" },
    select: {
      grade: true,
      name: true,
      isboss: true,
      bankauth: true,
    },
  });

  if (grades.length === 0) {
    throw new Error(`No grades found for gang "${gang}" in tl_gang_grades.`);
  }

  let upsertedPlayers = 0;
  let upsertedGroups = 0;

  for (let index = 1; index <= PLAYERS_PER_GANG; index += 1) {
    const suffix = String(index).padStart(2, "0");
    const citizenId = `${gang.toUpperCase()}SEED${suffix}`;
    const license = `license:seed_${gang}_${suffix}`;
    const grade = pickGradeForIndex(grades, index);
    const characterName = toName(gang, index);
    const playerDisplayName = `${characterName.firstname} ${characterName.lastname}`;

    const payload = {
      citizenid: citizenId,
      cid: index,
      license,
      name: playerDisplayName,
      money: JSON.stringify({ cash: 1500, bank: 25000, crypto: 0 }),
      charinfo: JSON.stringify(characterName),
      job: JSON.stringify(buildJobPayload()),
      gang: JSON.stringify(
        buildGangPayload(gangRecord.name, gangRecord.label, grade),
      ),
      position: JSON.stringify({ x: 0, y: 0, z: 0, w: 0 }),
      metadata: JSON.stringify({ hunger: 100, thirst: 100, stress: 0 }),
      inventory: JSON.stringify([]),
      phone_number: null,
      last_updated: new Date(),
      last_logged_out: null,
    };

    if (dryRun) {
      upsertedPlayers += 1;
      upsertedGroups += 1;
      continue;
    }

    await prisma.players.upsert({
      where: { citizenid: citizenId },
      create: payload,
      update: {
        ...payload,
      },
    });
    upsertedPlayers += 1;

    await prisma.$executeRaw`
      INSERT INTO player_groups (citizenid, type, \`group\`, grade)
      VALUES (${citizenId}, ${"gang"}, ${gangRecord.name}, ${grade.grade})
      ON DUPLICATE KEY UPDATE grade = ${grade.grade}
    `;
    upsertedGroups += 1;
  }

  return {
    gang: gangRecord.name,
    label: gangRecord.label,
    players: upsertedPlayers,
    groups: upsertedGroups,
  };
};

const main = async () => {
  const { dryRun } = parseArgs();

  console.warn(
    `[gang-seeder] Starting gang player seeder (${dryRun ? "dry-run" : "apply"})`,
  );

  const results = [];
  for (const gang of TARGET_GANGS) {
    const result = await seedGang(gang, dryRun);
    results.push(result);
    console.warn(
      `[gang-seeder] ${result.gang} (${result.label}): players=${result.players}, groups=${result.groups}`,
    );
  }

  const totalPlayers = results.reduce((total, item) => total + item.players, 0);
  console.warn(`[gang-seeder] Done. total players processed=${totalPlayers}`);
};

main()
  .catch((error) => {
    console.error("[gang-seeder] Failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
