"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { z } from "zod";

import { Button } from "@/components/button";
import { Form } from "@/components/form";
import { Typography } from "@/components/typography";
import { useCities, useProvinces } from "@/hooks/useIndonesiaRegions";
import { formatZodError } from "@/lib/formValidation";
import {
  type AccountInfoFormData,
  accountInfoSchema,
} from "@/schemas/authSetup";
import {
  setAccountInfoErrors,
  setCityName,
  setProvinceName,
  updateAccountInfoField,
  useAppDispatch,
  useAppSelector,
} from "@/store";
import type { City, Province } from "@/types/api/Indonesia";
import type { SelectOption } from "@/types/Form";

import Stepper from "./Stepper";

type InformationProps = {
  showStepper?: boolean;
};

export default function Information({ showStepper = true }: InformationProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Select state from Redux store
  const accountInfo = useAppSelector((state) => state.authSetup.accountInfo);
  const errors = useAppSelector((state) => state.authSetup.accountInfoErrors);
  const ageValue = accountInfo.age === "" ? "" : Number(accountInfo.age);

  const {
    data: provincesData,
    error: provincesError,
    isLoading: isLoadingProvinces,
  } = useProvinces();
  const {
    data: citiesData,
    error: citiesError,
    isLoading: isLoadingCities,
  } = useCities(accountInfo.province);

  const provinces = useMemo<SelectOption[]>(() => {
    const list = provincesData?.data ?? [];
    return list.map((province: Province) => ({
      value: province.id,
      label: province.name,
    }));
  }, [provincesData]);

  const cities = useMemo<SelectOption[]>(() => {
    const list = citiesData?.data ?? [];
    return list.map((city: City) => ({
      value: city.id,
      label: city.name,
    }));
  }, [citiesData]);

  const provincesErrorMessage =
    provincesError instanceof Error ? provincesError.message : "";
  const citiesErrorMessage =
    citiesError instanceof Error ? citiesError.message : "";

  // Handle input change
  const handleInputChange = (
    field: keyof AccountInfoFormData,
    value: string,
  ) => {
    dispatch(updateAccountInfoField({ field, value }));

    // Set province/city name when selected
    if (field === "province") {
      const selectedProvince = provinces.find((p) => p.value === value);
      if (selectedProvince) {
        dispatch(setProvinceName(selectedProvince.label));
      }
    }

    if (field === "city") {
      const selectedCity = cities.find((c) => c.value === value);
      if (selectedCity) {
        dispatch(setCityName(selectedCity.label));
      }
    }
  };

  // Validate form using Zod
  const validateForm = (): boolean => {
    try {
      accountInfoSchema.parse(accountInfo);
      dispatch(setAccountInfoErrors({}));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        dispatch(
          setAccountInfoErrors(formatZodError<AccountInfoFormData>(error)),
        );
      }
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
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
              name="realName"
              label="Real Name"
              placeholder="Enter your full name"
              value={accountInfo.realName}
              onChange={(e) => handleInputChange("realName", e.target.value)}
              error={errors.realName}
              helperText="Your legal full name"
              autoComplete="name"
              fullWidth
            />

            {/* FiveM Account Name */}
            <Form.Text
              name="fivemName"
              label="FiveM Account Name"
              placeholder="Enter your FiveM in-game name"
              value={accountInfo.fivemName}
              onChange={(e) => handleInputChange("fivemName", e.target.value)}
              error={errors.fivemName}
              helperText="Your in-game name (alphanumeric + underscore)"
              autoComplete="username"
              fullWidth
            />

            {/* Age and Birth Date - Two columns on larger screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Form.Number
                name="age"
                label="Age"
                placeholder="Enter your age"
                value={ageValue}
                onChange={(e) => handleInputChange("age", e.target.value)}
                error={errors.age}
                helperText="Players must be 13+ years old"
                min={13}
                max={120}
                fullWidth
              />

              <Form.Date
                name="birthDate"
                label="Birth Date"
                placeholder="Select your birth date"
                value={accountInfo.birthDate}
                onChange={(value) => handleInputChange("birthDate", value)}
                error={errors.birthDate}
                helperText="For age verification"
                max={new Date().toISOString().split("T")[0]}
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
                value={accountInfo.province}
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
                  !accountInfo.province
                    ? "Select province first"
                    : isLoadingCities
                      ? "Loading..."
                      : "Select city"
                }
                options={cities}
                value={accountInfo.city}
                onChange={(value) => handleInputChange("city", value)}
                error={errors.city || citiesErrorMessage}
                helperText="Select your city"
                disabled={!accountInfo.province || isLoadingCities}
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
