"use client";

import { motion } from "framer-motion";
import { Sword, Swords, User, Users } from "lucide-react";
import Image from "next/image";

import { Typography } from "@/components/typography";

export default function ProsCons() {
  return (
    <section className="py-18 px-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://i.pinimg.com/736x/28/b9/cb/28b9cb0a78d66a115a04698ea6356d14.jpg"
          width={0}
          height={0}
          sizes="100vw"
          alt="Street Background"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-linear-to-b from-primary-900 via-primary-900/60 to-primary-900" />
      </div>
      <div className="container mx-auto flex sm:flex-row flex-col items-center justify-center gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="border border-secondary-500 py-4 px-6 w-full max-w-sm bg-primary-900/50 backdrop-blur-lg flex flex-col gap-4 sm:items-end"
        >
          <Typography.Heading level={6} as={"h4"} className="uppercase mb-3">
            Who This Is For
          </Typography.Heading>
          <div className="flex flex-row sm:flex-row-reverse items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-primary-700 bg-primary-900">
              <Users className="text-secondary-500" />
            </div>
            <Typography.Paragraph className="font-bold">
              Team Players
            </Typography.Paragraph>
          </div>
          <div className="flex flex-row sm:flex-row-reverse items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-primary-700 bg-primary-900">
              <Swords className="text-secondary-500" />
            </div>
            <Typography.Paragraph className="font-bold">
              Competitive Mindset
            </Typography.Paragraph>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="border border-tertiary-red py-4 px-6 w-full max-w-sm bg-primary-900/50 backdrop-blur-lg flex flex-col gap-4 items-start"
        >
          <Typography.Heading level={6} as={"h4"} className="uppercase mb-3">
            Who This Is Not For
          </Typography.Heading>
          <div className="flex flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-primary-700 bg-primary-900">
              <User className="text-tertiary-red" />
            </div>
            <Typography.Paragraph className="font-bold">
              Casual PVP
            </Typography.Paragraph>
          </div>
          <div className="flex flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-primary-700 bg-primary-900">
              <Sword className="text-tertiary-red" />
            </div>
            <Typography.Paragraph className="font-bold">
              Solo Hero
            </Typography.Paragraph>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
