"use client";

import { motion } from "framer-motion";
import { Skull, Swords, Trophy } from "lucide-react";

import { Typography } from "@/components/typography";

export default function SellingPoint() {
  return (
    <section className="container mx-auto py-20">
      <div className="flex justify-center flex-wrap gap-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-100 h-auto aspect-square rounded-2xl border border-primary-500 group hover:border-primary-100 hover:scale-105 transition-all duration-300 p-10 flex flex-col justify-center relative overflow-hidden"
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
              League-Based Competition
            </Typography.Heading>
            <Typography.Paragraph className="text-primary-300 mb-4">
              A league system allows teams to compete against each other in a
              structured manner.
            </Typography.Paragraph>
            <ul className="list-disc ps-4 flex flex-col gap-4">
              <li>
                <Typography.Paragraph className="text-primary-300">
                  Scheduled Team vs Team matches
                </Typography.Paragraph>
              </li>
              <li>
                <Typography.Paragraph className="text-primary-300">
                  Season standings & relegation
                </Typography.Paragraph>
              </li>
              <li>
                <Typography.Paragraph className="text-primary-300">
                  Every match affects the table
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
          className="w-100 h-auto aspect-square rounded-2xl border border-primary-500 group hover:border-secondary-500 hover:scale-105 transition-all duration-300 p-10 flex flex-col justify-center relative overflow-hidden"
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
              Preparation Before Combat
            </Typography.Heading>
            <Typography.Paragraph className="text-primary-300 mb-4">
              Teams must work together to prepare before the battle begins to
              ensure victory.
            </Typography.Paragraph>
            <ul className="list-disc ps-4 flex flex-col gap-4">
              <li>
                <Typography.Paragraph className="text-primary-300">
                  Jobs → Resources → Crafting → War
                </Typography.Paragraph>
              </li>
              <li>
                <Typography.Paragraph className="text-primary-300">
                  No instant loadout, no freebies
                </Typography.Paragraph>
              </li>
              <li>
                <Typography.Paragraph className="text-primary-300">
                  Preparation defines power
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
          className="w-100 h-auto aspect-square rounded-2xl border border-primary-500 group hover:border-tertiary-red hover:scale-105 transition-all duration-300 p-10 flex flex-col justify-center relative overflow-hidden"
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
              Death Has Consequences
            </Typography.Heading>
            <Typography.Paragraph className="text-primary-300 mb-4">
              Every death counts and every decision matters, even in the heat of
              battle.
            </Typography.Paragraph>
            <ul className="list-disc ps-4 flex flex-col gap-4">
              <li>
                <Typography.Paragraph className="text-primary-300">
                  No respawn during matches
                </Typography.Paragraph>
              </li>
              <li>
                <Typography.Paragraph className="text-primary-300">
                  Full loot on death
                </Typography.Paragraph>
              </li>
              <li>
                <Typography.Paragraph className="text-primary-300">
                  Every decision matters
                </Typography.Paragraph>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
