"use client";

import classNames from "classnames";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Fragment } from "react";

import { Typography } from "@/components/typography";
import type { StepperProps } from "@/types/components/Stepper";

export default function Stepper({ currentStep = 1 }: StepperProps) {
  const loopItems = [
    {
      step: 1,
      title: "Information",
      active: currentStep === 1,
      completed: currentStep > 1,
    },
    {
      step: 2,
      title: "Credentials",
      active: currentStep === 2,
      completed: currentStep > 2,
    },
    {
      step: 3,
      title: "Account Link",
      active: currentStep === 3,
      completed: false,
    },
  ];

  return (
    <div className="relative z-10 mx-auto w-full flex items-center justify-center gap-2 mb-8">
      {loopItems.map((item, index) => (
        <Fragment key={item.title}>
          <div className="flex flex-col gap-2 items-center justify-center w-full max-w-30">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.8 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className={classNames(
                "mx-auto border-2 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 mb-2",
                // Completed state - solid green background with white text
                item.completed
                  ? "bg-secondary-700 border-secondary-700 text-white"
                  : item.active
                    ? "border-secondary-700 text-secondary-700"
                    : "border-primary-700 text-primary-300",
              )}
            >
              {item.completed ? (
                <Check size={24} className="text-white" strokeWidth={3} />
              ) : (
                <Typography.Heading
                  level={6}
                  as={"p"}
                  className={item.completed ? "text-white" : ""}
                >
                  {item.step}
                </Typography.Heading>
              )}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.8 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <Typography.Heading
                type="display"
                level={6}
                as={"p"}
                className={classNames(
                  "font-display! text-center font-bold uppercase",
                  item.active || item.completed
                    ? "text-primary-100"
                    : "text-primary-300",
                )}
              >
                {item.title}
              </Typography.Heading>
            </motion.div>
          </div>
          {index < loopItems.length - 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.8 }}
              transition={{ duration: 0.5, delay: index * 0.2 + 0.5 }}
              className={`w-full md:w-auto items-center justify-center md:mb-12 ${
                index === 2 ? "flex md:hidden xl:flex" : "flex"
              }`}
            >
              <ArrowRight
                size={32}
                className="text-primary-500 rotate-90 md:rotate-0"
              />
            </motion.div>
          )}
        </Fragment>
      ))}
    </div>
  );
}
