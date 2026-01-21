"use client";

import { SiDiscord, SiSteam } from "@icons-pack/react-simple-icons";
import { motion } from "framer-motion";

import { Button } from "@/components/button";
import { Typography } from "@/components/typography";

export default function Login() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative z-10 container mx-auto flex flex-col items-center justify-center bg-primary-900/50 backdrop-blur-lg w-fit p-10 rounded border border-secondary-500"
    >
      <Typography.Heading
        type="display"
        level={3}
        className="text-primary-100 uppercase tracking-widest"
      >
        Join GCLI
      </Typography.Heading>
      <div className="h-1 w-24 bg-secondary-700 mt-6 mb-10 content-none mx-auto" />
      <div className="w-sm flex flex-col gap-4">
        <Button.Primary
          size="lg"
          fullWidth
          className="bg-[#5865F2]! border-[#5865F2]! cursor-pointer"
          prefix={<SiDiscord className="text-tertiary-white" />}
        >
          Continue with Discord
        </Button.Primary>
        <Button.Primary
          size="lg"
          fullWidth
          className="bg-[#000000]! border-[#000000]! text-tertiary-white cursor-pointer"
          prefix={<SiSteam className="text-tertiary-white" />}
        >
          Continue with Steam
        </Button.Primary>
      </div>
      <Typography.Small className="text-primary-300 mt-10">
        By continuing, you agree to our{" "}
        <span className="text-secondary-500">Terms of Service</span> and{" "}
        <span className="text-secondary-500">Privacy Policy</span>
      </Typography.Small>
      <Typography.Small className="text-primary-300 mt-2">
        Discord & Steam are required to join GCLI Server via FiveM.
      </Typography.Small>
    </motion.div>
  );
}
