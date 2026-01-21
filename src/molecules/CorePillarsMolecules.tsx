"use client";

import { motion } from "framer-motion";
import { Skull, Swords, Trophy } from "lucide-react";

import { Typography } from "@/components/typography";

export default function CorePillarsMolecules() {
  return (
    <div className="flex justify-center flex-wrap gap-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-100 h-auto aspect-square rounded-2xl border border-primary-500 group hover:border-primary-100 hover:scale-105 transition-all duration-300 px-8 py-4 flex flex-col justify-center relative overflow-hidden"
      >
        <div className="absolute bottom-0 left-0 right-0 h-1 w-full content-none bg-linear-to-r from-primary-100 to-transparent group-hover:bg-primary-100 transition-all duration-300" />
        <div className="absolute top-3 right-3">
          <Trophy size={150} className="text-primary-700 opacity-40" />
        </div>
        <div className="relative z-10">
          <div className="w-15 h-15 flex items-center justify-center rounded-full border border-primary-500">
            <Trophy size={28} />
          </div>
          <Typography.Heading
            level={5}
            type="display"
            as="h5"
            className="mt-5 mb-2"
          >
            League-Driven Competition
          </Typography.Heading>
          <Typography.Paragraph className="text-primary-300 mb-4">
            GCLI is built as a competitive league, not a casual PvP playground.
          </Typography.Paragraph>
          <ul className="list-disc ps-4 flex flex-col gap-4">
            <li>
              <Typography.Paragraph className="text-primary-300">
                Matches are scheduled and official
              </Typography.Paragraph>
            </li>
            <li>
              <Typography.Paragraph className="text-primary-300">
                Results directly affect season standings
              </Typography.Paragraph>
            </li>
            <li>
              <Typography.Paragraph className="text-primary-300">
                Success is measured over time and consistency
              </Typography.Paragraph>
            </li>
          </ul>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="w-100 h-auto aspect-square rounded-2xl border border-primary-500 group hover:border-secondary-500 hover:scale-105 transition-all duration-300 px-8 py-4 flex flex-col justify-center relative overflow-hidden"
      >
        <div className="absolute bottom-0 left-0 right-0 h-1 w-full content-none bg-linear-to-r from-secondary-500 to-transparent group-hover:bg-secondary-500 transition-all duration-300" />
        <div className="absolute top-3 right-3">
          <Swords size={150} className="text-primary-700 opacity-40" />
        </div>
        <div className="relative z-10">
          <div className="w-15 h-15 flex items-center justify-center rounded-full border border-primary-500">
            <Swords size={28} />
          </div>
          <Typography.Heading
            level={5}
            type="display"
            as="h5"
            className="mt-5 mb-2"
          >
            Preparation Defines Power
          </Typography.Heading>
          <Typography.Paragraph className="text-primary-300 mb-4">
            Combat strength in GCLI is never instant to reflect the result of
            prior preparation.
          </Typography.Paragraph>
          <ul className="list-disc ps-4 flex flex-col gap-4">
            <li>
              <Typography.Paragraph className="text-primary-300">
                Jobs generate resources
              </Typography.Paragraph>
            </li>
            <li>
              <Typography.Paragraph className="text-primary-300">
                Resources enable crafting
              </Typography.Paragraph>
            </li>
            <li>
              <Typography.Paragraph className="text-primary-300">
                Crafting determines readiness
              </Typography.Paragraph>
            </li>
          </ul>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="w-100 h-auto aspect-square rounded-2xl border border-primary-500 group hover:border-tertiary-red hover:scale-105 transition-all duration-300 px-8 py-4 flex flex-col justify-center relative overflow-hidden"
      >
        <div className="absolute bottom-0 left-0 right-0 h-1 w-full content-none bg-linear-to-r from-tertiary-red to-transparent group-hover:bg-tertiary-red transition-all duration-300" />
        <div className="absolute top-3 right-3">
          <Skull size={150} className="text-primary-700 opacity-40" />
        </div>
        <div className="relative z-10">
          <div className="w-15 h-15 flex items-center justify-center rounded-full border border-primary-500">
            <Skull size={28} />
          </div>
          <Typography.Heading
            level={5}
            type="display"
            as="h5"
            className="mt-5 mb-2"
          >
            Fair Matches, Real Consequences
          </Typography.Heading>
          <Typography.Paragraph className="text-primary-300 mb-4">
            GCLI enforces fairness inside matches and freedom outside them.
          </Typography.Paragraph>
          <ul className="list-disc ps-4 flex flex-col gap-4">
            <li>
              <Typography.Paragraph className="text-primary-300">
                Same rules for all participants during matches
              </Typography.Paragraph>
            </li>
            <li>
              <Typography.Paragraph className="text-primary-300">
                No respawn, one life per match
              </Typography.Paragraph>
            </li>
            <li>
              <Typography.Paragraph className="text-primary-300">
                Lootable inventory on death
              </Typography.Paragraph>
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
