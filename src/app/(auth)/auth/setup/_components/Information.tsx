"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { z } from "zod";

import { Button } from "@/components/button";
import { Form } from "@/components/form";
import { Typography } from "@/components/typography";
import { useCities, useProvinces } from "@/hooks/useIndonesiaRegions";
import { useUniqueCheck } from "@/hooks/useUniqueCheck";
import {
  readAuthSetupPayload,
  updateAuthSetupPayload,
} from "@/lib/authSetupPayload";
import { formatZodError } from "@/lib/formValidation";
import {
  type AccountInfoDraft,
  type AccountInfoFormData,
  accountInfoSchema,
  type FormErrors,
} from "@/schemas/authSetup";
import type { City, Province } from "@/types/api/Indonesia";
import type { SelectOption } from "@/types/Form";

import Stepper from "./Stepper";

type InformationProps = {
  showStepper?: boolean;
};

export default function Information({ showStepper = true }: InformationProps) {
  const router = useRouter();

  const [accountInfo, setAccountInfo] = useState<AccountInfoDraft>(() => {
    const payload = readAuthSetupPayload() as {
      accountInfo?: AccountInfoFormData & {
        realName?: string;
        fivemName?: string;
        province?: unknown;
        city?: unknown;
      };
      provinceName?: string;
      cityName?: string;
    };

    if (payload.accountInfo) {
      const raw = payload.accountInfo as AccountInfoFormData & {
        realName?: string;
        fivemName?: string;
        province?: unknown;
        city?: unknown;
      };
      const resolvedGender =
        raw.gender === "male" || raw.gender === "female" ? raw.gender : "";
      return {
        name: raw.name || raw.realName || "",
        username: raw.username || raw.fivemName || "",
        gender: resolvedGender,
        birthDate: raw.birthDate ?? "",
        province: {
          id:
            typeof raw.province === "object" &&
            raw.province !== null &&
            "id" in raw.province
              ? Number(raw.province.id)
              : Number.parseInt(
                  typeof raw.province === "string" ? raw.province : "0",
                  10,
                ),
          name:
            typeof raw.province === "object" &&
            raw.province !== null &&
            "name" in raw.province
              ? String(raw.province.name)
              : (payload.provinceName ?? ""),
        },
        city: {
          id:
            typeof raw.city === "object" &&
            raw.city !== null &&
            "id" in raw.city
              ? Number(raw.city.id)
              : Number.parseInt(
                  typeof raw.city === "string" ? raw.city : "0",
                  10,
                ),
          name:
            typeof raw.city === "object" &&
            raw.city !== null &&
            "name" in raw.city
              ? String(raw.city.name)
              : (payload.cityName ?? ""),
        },
      };
    }

    return {
      name: "",
      username: "",
      gender: "",
      birthDate: "",
      province: { id: 0, name: "" },
      city: { id: 0, name: "" },
    };
  });
  const [errors, setErrors] = useState<FormErrors<AccountInfoFormData>>({});
  const today = new Date();
  const minBirthDate = new Date(
    today.getFullYear() - 120,
    today.getMonth(),
    today.getDate(),
  );
  const maxBirthDateValue = today.toISOString().split("T")[0];
  const minBirthDateValue = minBirthDate.toISOString().split("T")[0];

  const {
    data: provincesData,
    error: provincesError,
    isLoading: isLoadingProvinces,
  } = useProvinces();
  const provinceIdValue = accountInfo.province.id
    ? accountInfo.province.id.toString()
    : "";
  const cityIdValue = accountInfo.city.id ? accountInfo.city.id.toString() : "";

  const {
    data: citiesData,
    error: citiesError,
    isLoading: isLoadingCities,
  } = useCities(provinceIdValue);

  const provinces = useMemo<SelectOption[]>(() => {
    const list = provincesData?.data ?? [];
    return list
      .map((province: Province) => ({
        value: province.id,
        label: province.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [provincesData]);

  const cities = useMemo<SelectOption[]>(() => {
    const list = citiesData?.data ?? [];
    return list
      .map((city: City) => ({
        value: city.id,
        label: city.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [citiesData]);

  const provincesErrorMessage =
    provincesError instanceof Error ? provincesError.message : "";
  const citiesErrorMessage =
    citiesError instanceof Error ? citiesError.message : "";
  const usernameValidation = useUniqueCheck(
    "username",
    accountInfo.username,
    (value) => /^[a-zA-Z0-9_]+$/.test(value),
  );
  const usernameTaken = usernameValidation.isValid && usernameValidation.exists;

  // Handle input change
  const handleInputChange = (field: keyof AccountInfoDraft, value: string) => {
    if (field === "province") {
      if (errors.province) {
        setErrors((prev) => ({ ...prev, province: undefined }));
      }
      if (errors.city) {
        setErrors((prev) => ({ ...prev, city: undefined }));
      }
      const selectedProvince = provinces.find((p) => p.value === value);
      setAccountInfo((prev) => ({
        ...prev,
        province: {
          id: Number.parseInt(selectedProvince?.value ?? "0", 10),
          name: selectedProvince?.label ?? "",
        },
        city: { id: 0, name: "" },
      }));
      return;
    }

    if (field === "city") {
      if (errors.city) {
        setErrors((prev) => ({ ...prev, city: undefined }));
      }
      const selectedCity = cities.find((c) => c.value === value);
      setAccountInfo((prev) => ({
        ...prev,
        city: {
          id: Number.parseInt(selectedCity?.value ?? "0", 10),
          name: selectedCity?.label ?? "",
        },
      }));
      return;
    }

    if (field === "gender") {
      setAccountInfo((prev) => ({
        ...prev,
        gender: value as AccountInfoDraft["gender"],
      }));
      if (errors.gender) {
        setErrors((prev) => ({ ...prev, gender: undefined }));
      }
      return;
    }

    setAccountInfo((prev) => ({ ...prev, [field]: value }));
    if (field in errors) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Validate form using Zod
  const validateForm = (): boolean => {
    try {
      accountInfoSchema.parse(accountInfo as AccountInfoFormData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(formatZodError<AccountInfoFormData>(error));
      }
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      updateAuthSetupPayload({
        accountInfo: accountInfo as AccountInfoFormData,
      });
      router.push("/auth/setup?step=2");
    }
  };

  return (
    <>
      {showStepper && <Stepper currentStep={1} />}
      <div className="relative z-10 container mx-auto flex flex-col items-center justify-center">
        <div className="bg-primary-900/50 backdrop-blur-lg w-full p-10 rounded border border-secondary-500">
          <Typography.Heading
            type="display"
            level={3}
            className="text-primary-100 uppercase tracking-widest text-center"
          >
            Information
          </Typography.Heading>
          <div className="h-1 w-24 bg-secondary-700 mt-6 mb-10 mx-auto" />

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Real Name */}
            <Form.Text
              name="name"
              label="Real Name"
              placeholder="Enter your full name"
              value={accountInfo.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              error={errors.name}
              helperText="Your legal full name"
              autoComplete="name"
              fullWidth
            />

            {/* FiveM Account Name */}
            <Form.Text
              name="username"
              label="FiveM Account Name"
              placeholder="Enter your FiveM in-game name"
              value={accountInfo.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              error={
                errors.username ||
                (usernameTaken ? "FiveM name already exists" : "")
              }
              helperText={
                usernameValidation.isLoading
                  ? "Checking availability..."
                  : "Your in-game name (alphanumeric + underscore)"
              }
              autoComplete="username"
              fullWidth
            />

            {/* Gender and Birth Date - Two columns on larger screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Form.Select
                name="gender"
                label="Gender"
                placeholder="Select gender"
                options={[
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                ]}
                value={accountInfo.gender}
                onChange={(value) => handleInputChange("gender", value)}
                error={errors.gender}
                helperText="Select your gender"
                fullWidth
              />

              <Form.Date
                name="birthDate"
                label="Birth Date"
                placeholder="Select your birth date"
                value={accountInfo.birthDate}
                onChange={(value) => handleInputChange("birthDate", value)}
                error={errors.birthDate}
                helperText="For verification"
                min={minBirthDateValue}
                max={maxBirthDateValue}
                fullWidth
              />
            </div>

            {/* Province and City - Two columns on larger screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Form.Select
                name="province"
                label="Province"
                placeholder={
                  isLoadingProvinces ? "Loading..." : "Select province"
                }
                options={provinces}
                value={provinceIdValue}
                onChange={(value) => handleInputChange("province", value)}
                error={errors.province || provincesErrorMessage}
                helperText="Select your province"
                disabled={isLoadingProvinces}
                fullWidth
              />

              <Form.Select
                name="city"
                label="City"
                placeholder={
                  !accountInfo.province.id
                    ? "Select province first"
                    : isLoadingCities
                      ? "Loading..."
                      : "Select city"
                }
                options={cities}
                value={cityIdValue}
                onChange={(value) => handleInputChange("city", value)}
                error={errors.city || citiesErrorMessage}
                helperText="Select your city"
                disabled={!accountInfo.province.id || isLoadingCities}
                fullWidth
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              <Link href={"/auth/"}>
                <Button.Secondary
                  variant="outline"
                  type="submit"
                  className="min-w-32"
                >
                  Back to Login
                </Button.Secondary>
              </Link>
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
