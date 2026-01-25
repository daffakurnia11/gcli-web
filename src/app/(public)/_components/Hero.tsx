"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import { Logo } from "@/components";
import { Button } from "@/components/button";
import { Typography } from "@/components/typography";

export default function Hero() {
  return (
    <section className="relative h-dvh min-h-155 flex flex-col items-center justify-center">
      {/* Background Image - Los Santos/City Style */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://i.pinimg.com/1200x/55/21/d9/5521d959336374299af9f8be9382ba47.jpg"
          width={0}
          height={0}
          sizes="100vw"
          alt="Los Santos Background"
          className="w-full h-full object-cover"
        />
        {/* Dark overlay to ensure text readability */}
        <div className="absolute inset-0 bg-primary-900/70" />
        <div className="absolute inset-0 bg-linear-to-t from-primary-900 via-transparent to-primary-900/60" />
        <div className="absolute inset-0 bg-linear-to-b from-primary-900/50 via-transparent to-primary-900" />
      </div>
      <div className="container mx-auto px-4 z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-52 mx-auto mb-5 drop-shadow-[0_0_35px_rgba(209,154,28,0.3)]"
        >
          <Logo variant="icon" color="white" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Typography.Heading
            type="display"
            level={1}
            className="text-5xl! sm:text-7xl! text-center uppercase"
          >
            GTA <span className="text-secondary-700">Competitive</span> League
          </Typography.Heading>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Typography.Heading
            type="heading"
            level={6}
            as={"h2"}
            className="text-center text-gray-light mt-2"
          >
            Structured Faction Warfare. Real Consequences. Seasonal Rankings.
          </Typography.Heading>
        </motion.div>
        <div className="flex items-center justify-center gap-6 mt-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button.Slant variant="primary" size="lg">
              Join Now
            </Button.Slant>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Button.Secondary variant="outline" size="lg">
              Learn More
            </Button.Secondary>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
