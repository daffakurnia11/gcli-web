"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import { Typography } from "@/components/typography";

export default function Vision() {
  return (
    <section className="py-18 px-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1602033843959-89d058e8c661?q=80&w=2342&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          width={0}
          height={0}
          sizes="100vw"
          alt="Street Background"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-linear-to-b from-primary-900 via-primary-900/60 to-primary-900" />
      </div>
      <div className="w-full max-w-4xl mx-auto flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="border border-secondary-500 py-4 px-6 w-full bg-primary-900/50 backdrop-blur-lg"
        >
          <Typography.Heading level={5} type="display" className="uppercase">
            Vision
          </Typography.Heading>
          <Typography.Paragraph className="text-gray-light mb-4">
            To become a{" "}
            <strong>
              fair, structured, and sustainable competitive ecosystem
            </strong>{" "}
            in FiveM, where teams are measured by{" "}
            <strong>preparation, discipline, and long-term performance</strong>,
            not instant power or randomness.
          </Typography.Paragraph>
        </motion.div>
      </div>
    </section>
  );
}
