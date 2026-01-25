"use client";

import { motion } from "framer-motion";

import { Typography } from "@/components/typography";

export default function Description() {
  return (
    <section className="w-full max-w-4xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Typography.Heading
          type="display"
          level={4}
          as={"h2"}
          className="uppercase mb-4"
        >
          What is GCLI?
        </Typography.Heading>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Typography.Paragraph className="text-gray-light mb-4">
          GCLI (GTA Competitive League Indonesia) is a standalone project
          designed to strip away the chaos of Roleplay (RP) and Free-For-All
          (FFA) servers, replacing it with a rigorous, season-based competitive
          format. We provide a platform for organized teams to compete in
          objectives that test coordination, shooting mechanics, and driving
          skills.
        </Typography.Paragraph>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
      <Typography.Paragraph className="text-gray-light">
        We are not just a server; we are a league. Our goal is to foster an
        esports ecosystem within the GTA V engine, tailored specifically for the
        Indonesian gaming community.
      </Typography.Paragraph>
      </motion.div>
    </section>
  );
}
