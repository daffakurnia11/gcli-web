"use client";

import { motion } from "framer-motion";

import { Typography } from "@/components/typography";

export default function Title() {
  return (
    <section className="w-full max-w-4xl mx-auto pt-30 pb-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.5 }}
      >
        <Typography.Heading
          level={2}
          as={"h1"}
          className="text-center uppercase tracking-widest"
        >
          About
        </Typography.Heading>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="h-1 w-24 bg-secondary-700 mt-6 mb-4 content-none mx-auto"
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Typography.Paragraph className="text-center text-primary-300">
          GCLI is a team-based competitive league, not a traditional roleplay
          server and not a free-for-all PvP server.
        </Typography.Paragraph>
      </motion.div>
    </section>
  );
}
