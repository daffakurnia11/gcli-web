"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

import { Button } from "@/components/button";
import { Typography } from "@/components/typography";

const standingsData = [
  { rank: 1, team: "Garuda Esports", win: 12, lose: 2, points: 36 },
  { rank: 2, team: "Naga Pride", win: 10, lose: 4, points: 30 },
  { rank: 3, team: "Borneo Warriors", win: 8, lose: 6, points: 24 },
  { rank: 4, team: "Jakarta Elite", win: 6, lose: 8, points: 18 },
  { rank: 5, team: "Sumatra Strikers", win: 4, lose: 10, points: 12 },
];

export default function Standings() {
  return (
    <section className="container mx-auto py-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.5 }}
      >
        <Typography.Heading
          level={2}
          as={"h2"}
          className="text-center uppercase tracking-widest"
        >
          Standings
        </Typography.Heading>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="h-1 w-24 bg-secondary-700 mt-6 mb-10 content-none mx-auto"
      />

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="overflow-x-auto"
      >
        <table className="w-full max-w-3xl mx-auto border-collapse">
          <thead>
            <tr className="border-b border-primary-700">
              <th className="py-6 sm:px-6 px-4 text-center">
                <Typography.Small className="text-primary-300 uppercase tracking-wider">
                  Rank
                </Typography.Small>
              </th>
              <th className="py-6 sm:px-6 px-4 text-left">
                <Typography.Small className="text-primary-300 uppercase tracking-wider">
                  Team
                </Typography.Small>
              </th>
              <th className="py-6 sm:px-6 px-4 text-center">
                <Typography.Small className="text-primary-300 uppercase tracking-wider">
                  Win
                </Typography.Small>
              </th>
              <th className="py-6 sm:px-6 px-4 text-center">
                <Typography.Small className="text-primary-300 uppercase tracking-wider">
                  Lose
                </Typography.Small>
              </th>
              <th className="py-6 sm:px-6 px-4 text-center">
                <Typography.Small className="text-primary-300 uppercase tracking-wider">
                  Points
                </Typography.Small>
              </th>
            </tr>
          </thead>
          <tbody>
            {standingsData.map((team, index) => (
              <motion.tr
                key={team.rank}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                className="border-b border-primary-700 hover:bg-primary-700/30 transition-colors"
              >
                <td className="py-6 sm:px-6 px-4 text-center">
                  {team.rank === 1 ? (
                    <Trophy size={24} className="mx-auto text-secondary-500" />
                  ) : (
                    <Typography.Heading type="display" level={6} as={"p"}>
                      #{team.rank}
                    </Typography.Heading>
                  )}
                </td>
                <td className="py-6 sm:px-6 px-4">
                  <Typography.Paragraph as={"p"} className="font-semibold">
                    {team.team}
                  </Typography.Paragraph>
                </td>
                <td className="py-6 sm:px-6 px-4 text-center">
                  <Typography.Paragraph as={"p"} className="text-green-500">
                    {team.win}
                  </Typography.Paragraph>
                </td>
                <td className="py-6 sm:px-6 px-4 text-center">
                  <Typography.Paragraph as={"p"} className="text-red-500">
                    {team.lose}
                  </Typography.Paragraph>
                </td>
                <td className="py-6 sm:px-6 px-4 text-center">
                  <Typography.Heading
                    level={6}
                    as={"p"}
                    className="text-secondary-700"
                  >
                    {team.points}
                  </Typography.Heading>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="flex justify-center mt-10"
      >
        <Button.Secondary>View More</Button.Secondary>
      </motion.div>
    </section>
  );
}
