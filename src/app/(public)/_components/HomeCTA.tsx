"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/button";
import { Typography } from "@/components/typography";

export default function HomeCTA() {
  const DISCORD_INVITE_CODE = process.env.NEXT_PUBLIC_DISCORD_INVITE;

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1621364525332-f9c381f3bfe8?q=80&w=3132&auto=format&fit=crop"
          width={0}
          height={0}
          sizes="100vw"
          alt="Street Background"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-linear-to-b from-primary-900 via-primary-900/60 to-primary-900" />
      </div>
      <div className="container mx-auto flex flex-col items-center gap-4 px-6 z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Typography.Heading
            type="display"
            level={1}
            as={"h2"}
            className="uppercase tracking-wide text-center"
          >
            Ready to <span className="text-secondary-500">Dominate?</span>
          </Typography.Heading>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Typography.Paragraph className="font-semibold w-full max-w-xl text-center">
            Start your journey today. Support the server to get exclusive skins,
            priority queue, and faction perks.
          </Typography.Paragraph>
        </motion.div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button.Slant variant="primary" size="lg">
              Register Now
            </Button.Slant>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link
              href={`https://discord.gg/${DISCORD_INVITE_CODE}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button.Secondary variant="outline" size="lg">
                Join Discord
              </Button.Secondary>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
