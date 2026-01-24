"use client";

import { useRouter } from "next/navigation";
import { z } from "zod";

import { Button } from "@/components/button";
import { Form } from "@/components/form";
import { Typography } from "@/components/typography";
import { formatZodError } from "@/lib/formValidation";
import { type PasswordFormData,passwordSchema } from "@/schemas/authSetup";
import {
  setPasswordErrors,
  updatePasswordField,
  useAppDispatch,
  useAppSelector,
} from "@/store";

import Stepper from "./Stepper";

type CredentialsProps = {
  showStepper?: boolean;
};

export default function Credentials({ showStepper = true }: CredentialsProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Select state from Redux store
  const password = useAppSelector((state) => state.authSetup.password);
  const errors = useAppSelector((state) => state.authSetup.passwordErrors);

  // Handle input change
  const handleInputChange = (field: keyof PasswordFormData, value: string) => {
    dispatch(updatePasswordField({ field, value }));
  };

  // Validate form using Zod
  const validateForm = (): boolean => {
    try {
      passwordSchema.parse(password);
      dispatch(setPasswordErrors({}));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        dispatch(setPasswordErrors(formatZodError<PasswordFormData>(error)));
      }
      return false;
    }
  };

  // Handle back navigation
  const handleBack = () => {
    router.push("/auth/setup?step=1");
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        sessionStorage.setItem(
          "auth_setup_credentials",
          JSON.stringify({
            email: password.email,
            password: password.password,
            confirmPassword: password.confirmPassword,
          }),
        );
      } catch {
        // Ignore storage failures (private mode, quota, etc.)
      }

      router.push("/auth/setup?step=3");
    }
  };

  return (
    <>
      {showStepper && <Stepper currentStep={2} />}
      <div className="relative z-10 container mx-auto flex flex-col items-center justify-center">
        <div className="bg-primary-900/50 backdrop-blur-lg w-full p-10 rounded border border-secondary-500">
          <Typography.Heading
            type="display"
            level={3}
            className="text-primary-100 uppercase tracking-widest text-center"
          >
            Credentials
          </Typography.Heading>
          <div className="h-1 w-24 bg-secondary-700 mt-6 mb-10 mx-auto" />

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Address */}
          <Form.Text
            name="email"
            label="Email Address"
            type="email"
            placeholder="Enter your email address"
            value={password.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            error={errors.email}
            helperText="We'll send account updates to this email"
            autoComplete="email"
            fullWidth
          />

          {/* Password */}
          <Form.Text
            name="password"
            label="Password"
            type="password"
            placeholder="Create a strong password"
            value={password.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            error={errors.password}
            helperText="Min 8 chars, 1 uppercase, 1 lowercase, 1 number"
            autoComplete="new-password"
            fullWidth
          />

          {/* Confirm Password */}
          <Form.Text
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Re-enter your password"
            value={password.confirmPassword}
            onChange={(e) =>
              handleInputChange("confirmPassword", e.target.value)
            }
            error={errors.confirmPassword}
            helperText="Must match your password above"
            autoComplete="new-password"
            fullWidth
          />

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button.Secondary
              variant="outline"
              type="button"
              onClick={handleBack}
              className="min-w-32"
            >
              Back
            </Button.Secondary>
            <Button.Primary
              variant="solid"
              type="submit"
              className="min-w-32"
            >
              Continue
            </Button.Primary>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}
