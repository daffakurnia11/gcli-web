"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { updatePasswordField, useAppDispatch, useAppSelector } from "@/store";

import AccountLinkWrapper from "./_components/AccountLinkWrapper";
import Credentials from "./_components/Credentials";
import Information from "./_components/Information";
import Stepper from "./_components/Stepper";

export default function AuthSetupPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const stepParam = searchParams.get("step") || "1";
  const currentStep = parseInt(stepParam, 10) as 1 | 2 | 3;

  // Select state from Redux to check if steps are completed
  const accountInfo = useAppSelector((state) => state.authSetup.accountInfo);
  const password = useAppSelector((state) => state.authSetup.password);
  const isRehydrated = useAppSelector((state) => state._persist?.rehydrated ?? false);

  useEffect(() => {
    // Wait for redux-persist to rehydrate before validating
    if (!isRehydrated) {
      return;
    }

    // Validate step access
    const validateStepAccess = () => {
      switch (currentStep) {
        case 1:
          // Step 1 is always accessible
          return true;

        case 2:
          // Credentials step requires: all Information fields filled
          if (
            !accountInfo.realName ||
            !accountInfo.fivemName ||
            !accountInfo.age ||
            !accountInfo.birthDate ||
            !accountInfo.province ||
            !accountInfo.city
          ) {
            router.replace("/auth/setup?step=1");
            return false;
          }
          return true;

        case 3:
          // Account Link step requires: Information AND Credentials fields filled
          if (
            !accountInfo.realName ||
            !accountInfo.fivemName ||
            !accountInfo.age ||
            !accountInfo.birthDate ||
            !accountInfo.province ||
            !accountInfo.city
          ) {
            router.replace("/auth/setup?step=1");
            return false;
          }
          if (!password.email || !password.password) {
            try {
              const raw = sessionStorage.getItem("auth_setup_credentials");
              if (raw) {
                const stored = JSON.parse(raw) as {
                  email?: string;
                  password?: string;
                  confirmPassword?: string;
                };

                if (stored.email && stored.password) {
                  dispatch(updatePasswordField({ field: "email", value: stored.email }));
                  dispatch(updatePasswordField({ field: "password", value: stored.password }));
                  dispatch(
                    updatePasswordField({
                      field: "confirmPassword",
                      value: stored.confirmPassword || stored.password,
                    }),
                  );
                  return true;
                }
              }
            } catch {
              // Ignore storage failures and fall back to redirect.
            }

            router.replace("/auth/setup?step=2");
            return false;
          }
          return true;

        default:
          router.replace("/auth/setup?step=1");
          return false;
      }
    };

    validateStepAccess();
  }, [
    currentStep,
    accountInfo,
    password,
    dispatch,
    router,
    isRehydrated,
  ]);

  // Render the appropriate step
  let content: React.ReactNode;

  switch (currentStep) {
    case 1:
      content = <Information showStepper={false} />;
      break;
    case 2:
      content = <Credentials showStepper={false} />;
      break;
    case 3:
      content = <AccountLinkWrapper showStepper={false} />;
      break;
    default:
      content = <Information showStepper={false} />;
  }

  return (
    <>
      <Stepper currentStep={currentStep} />
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
