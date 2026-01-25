"use client";

import { motion } from "framer-motion";

import { Typography } from "@/components/typography";
import { CorePillarsMolecules } from "@/molecules";

export default function CorePillars() {
  return (
    <section className="container mx-auto py-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.5 }}
      >
        <Typography.Heading
          level={3}
          as={"h2"}
          className="text-center uppercase tracking-widest"
        >
          Core Pillars
        </Typography.Heading>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="h-1 w-24 bg-secondary-700 mt-6 mb-10 content-none mx-auto"
      />
      <CorePillarsMolecules />
    </section>
  );
}
