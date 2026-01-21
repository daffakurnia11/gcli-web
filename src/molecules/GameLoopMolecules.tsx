"use client";

import { motion } from "framer-motion";
import {
  Anvil,
  ArrowRight,
  Pickaxe,
  Repeat,
  Swords,
  Trophy,
} from "lucide-react";
import { Fragment } from "react";

import { Typography } from "@/components/typography";

export default function GameLoopMolecules() {
  const loopItems = [
    {
      icon: <Pickaxe size={32} />,
      title: "Farm",
      subtitle: "Gather resources in PFA safe zones.",
    },
    {
      icon: <Anvil size={32} />,
      title: "Craft",
      subtitle: "Forge weapons and gear for your team.",
    },
    {
      icon: <Swords size={32} />,
      title: "War",
      subtitle: "Engage in TvT battles and turf wars.",
    },
    {
      icon: <Trophy size={32} />,
      title: "Climb",
      subtitle: "Go up the leaderboard and win prizes.",
    },
    {
      icon: <Repeat size={32} />,
      title: "Loop",
      subtitle: "Repeat and prepare for the next round.",
    },
  ];

  return (
    <div className="mx-auto w-xs md:w-3xl xl:w-full flex items-center justify-center flex-wrap gap-6">
      {loopItems.map((item, index) => (
        <Fragment key={item.title}>
          <div className="flex flex-col gap-2 items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.8 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="mx-auto border-2 border-primary-700 w-24 h-24 rounded-full flex items-center justify-center hover:shadow-[0_0_20px_rgba(209,154,28,0.5)] hover:border-secondary-700 hover:text-secondary-700 transition-all duration-300 mb-6 hover:scale-110"
            >
              {item.icon}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.8 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <Typography.Heading
                type="display"
                level={6}
                as={"p"}
                className="font-display! text-center font-bold uppercase"
              >
                {item.title}
              </Typography.Heading>
              <Typography.Paragraph className="text-center w-44 text-primary-300">
                {item.subtitle}
              </Typography.Paragraph>
            </motion.div>
          </div>
          {index < loopItems.length - 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.8 }}
              transition={{ duration: 0.5, delay: index * 0.2 + 0.5 }}
              className={`w-full md:w-auto items-center justify-center md:mb-28 ${
                index === 2 ? "flex md:hidden xl:flex" : "flex"
              }`}
            >
              <ArrowRight
                size={32}
                className="text-primary-500 rotate-90 md:rotate-0"
              />
            </motion.div>
          )}
        </Fragment>
      ))}
    </div>
  );
}
