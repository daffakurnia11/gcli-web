"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import { Typography } from "@/components/typography";

// Mock data using generic esports logos or placeholders
const teams = [
  {
    id: 1,
    img: "https://ui-avatars.com/api/?name=Alpha&background=484848&color=fff&size=128&rounded=true&bold=true",
  },
  {
    id: 2,
    img: "https://ui-avatars.com/api/?name=Bravo&background=D19A1C&color=fff&size=128&rounded=true&bold=true",
  },
  {
    id: 3,
    img: "https://ui-avatars.com/api/?name=Charlie&background=8C8C8C&color=fff&size=128&rounded=true&bold=true",
  },
  {
    id: 4,
    img: "https://ui-avatars.com/api/?name=Delta&background=2D2D2D&color=fff&size=128&rounded=true&bold=true",
  },
  {
    id: 5,
    img: "https://ui-avatars.com/api/?name=Echo&background=DDB247&color=fff&size=128&rounded=true&bold=true",
  },
  {
    id: 6,
    img: "https://ui-avatars.com/api/?name=Foxtrot&background=141414&color=fff&size=128&rounded=true&bold=true",
  },
  {
    id: 7,
    img: "https://ui-avatars.com/api/?name=Golf&background=BA0006&color=fff&size=128&rounded=true&bold=true",
  },
  {
    id: 8,
    img: "https://ui-avatars.com/api/?name=Hotel&background=F6CD6B&color=fff&size=128&rounded=true&bold=true",
  },
];

const TeamCarousel: React.FC = () => {
  return (
    <div className="w-full bg-primary-700 border-y border-primary-700 py-10 overflow-hidden relative">
      <div className="absolute inset-y-0 left-0 w-24 bg-linear-to-r from-primary-700 to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-24 bg-linear-to-l from-primary-700 to-transparent z-10" />

      <div className="container mx-auto mb-6 text-center">
        <Typography.Heading level={6} as={"p"}>
          Registered Team
        </Typography.Heading>
      </div>

      <motion.div
        className="flex gap-16 w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 30,
        }}
      >
        {[...teams, ...teams].map((team, index) => (
          <div
            key={`${team.id}-${index}`}
            className="shrink-0 grayscale hover:grayscale-0 transition-all duration-300 opacity-50 hover:opacity-100 hover:scale-110 cursor-pointer"
          >
            <Image
              src={team.img}
              alt={`Team ${team.id}`}
              width={80}
              height={80}
              unoptimized
              className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-primary-900 shadow-lg object-cover"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default TeamCarousel;
