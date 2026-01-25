"use client";

import { SiDiscord } from "@icons-pack/react-simple-icons";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

import { Button } from "@/components/button";
import { Form } from "@/components/form";
import { Typography } from "@/components/typography";

type FormData = {
  email: string;
  password: string;
};

type FormErrors = {
  email?: string;
  password?: string;
};

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    // Clear submit error
    if (submitError) {
      setSubmitError("");
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSubmitError("");

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setSubmitError("Invalid email or password");
      } else if (result?.ok) {
        router.push("/");
        router.refresh();
      }
    } catch {
      setSubmitError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscordSignIn = () => {
    signIn("discord", { callbackUrl: "/" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative z-10 container mx-auto flex flex-col items-center justify-center bg-primary-900/50 backdrop-blur-lg w-full max-w-md p-10 rounded border border-secondary-500"
    >
      <Typography.Heading
        type="display"
        level={3}
        className="text-primary-100 uppercase tracking-widest text-center"
      >
        Login
      </Typography.Heading>
      <div className="h-1 w-24 bg-secondary-700 mt-6 mb-8 mx-auto" />

      {/* Email/Password Form */}
      <form onSubmit={handleEmailLogin} className="w-full flex flex-col gap-4">
        <Form.Text
          name="email"
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          error={errors.email}
          autoComplete="email"
          fullWidth
        />
        <Form.Text
          name="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={(e) => handleChange("password", e.target.value)}
          error={errors.password}
          autoComplete="current-password"
          fullWidth
        />

        {submitError && (
          <Typography.Small className="text-tertiary-red text-center">
            {submitError}
          </Typography.Small>
        )}

        <Button.Primary
          type="submit"
          variant="solid"
          size="base"
          fullWidth
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button.Primary>
      </form>

      {/* Divider */}
      <div className="flex items-center w-full my-4">
        <div className="flex-1 h-px w-full bg-secondary-500" />
        <Typography.Small className="text-primary-400 px-4">OR</Typography.Small>
        <div className="flex-1 h-px w-full bg-secondary-500" />
      </div>

      {/* Social Login */}
      <div className="w-full flex flex-col gap-3 mb-6">
        <Button.Primary
          size="base"
          fullWidth
          className="bg-[#5865F2]! border-[#5865F2]! cursor-pointer"
          prefix={<SiDiscord className="text-tertiary-white" size={16} />}
          onClick={handleDiscordSignIn}
        >
          Continue with Discord
        </Button.Primary>
      </div>

      {/* Register CTA */}
      <div className="w-full text-center pt-4 border-t-[1.5px] border-secondary-500">
        <Typography.Small className="text-primary-300">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/auth/setup?step=1")}
            className="text-secondary-500 hover:text-secondary-700 underline cursor-pointer"
          >
            Register here
          </button>
        </Typography.Small>
      </div>

      {/* Footer Text */}
      <Typography.Small className="text-primary-300 mt-6 text-center">
        By continuing, you agree to our{" "}
        <span className="text-secondary-500">Terms of Service</span> and{" "}
        <span className="text-secondary-500">Privacy Policy</span>
      </Typography.Small>
    </motion.div>
  );
}
