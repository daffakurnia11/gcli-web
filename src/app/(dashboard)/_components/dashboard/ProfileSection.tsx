"use client";

import { User } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import { Button } from "@/components/button";
import { Form } from "@/components/form";
import { Typography } from "@/components/typography";
import { useCities, useProvinces } from "@/hooks/useIndonesiaRegions";
import type { City, Province } from "@/types/api/Indonesia";
import type { SelectOption } from "@/types/Form";

import { Alert, DashboardCard, DashboardSection } from "./index";

const toDateInputValue = (value?: Date | string | null) => {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().split("T")[0];
};

export interface ProfileSectionProps {
  username?: string | null;
  email?: string | null;
  realName?: string | null;
  fivemName?: string | null;
  gender?: "male" | "female" | null;
  birthDate?: Date | string | null;
  provinceId?: string | null;
  provinceName?: string | null;
  cityId?: string | null;
  cityName?: string | null;
  avatarUrl?: string | null;
  allowFivemChange?: boolean;
}

export function ProfileSection({
  username,
  email,
  realName,
  fivemName,
  gender,
  birthDate,
  provinceId,
  provinceName,
  cityId,
  cityName,
  avatarUrl,
  allowFivemChange = true,
}: ProfileSectionProps) {
  const initialFormValues = () => ({
    realName: realName ?? "",
    fivemName: fivemName ?? "",
    gender: gender ?? "",
    birthDate: toDateInputValue(birthDate),
    provinceId: provinceId ?? "",
    cityId: cityId ?? "",
  });

  const [formValues, setFormValues] = useState(initialFormValues);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    data: provincesData,
    error: provincesError,
    isLoading: isLoadingProvinces,
  } = useProvinces();
  const provinceIdValue = formValues.provinceId || "";

  const {
    data: citiesData,
    error: citiesError,
    isLoading: isLoadingCities,
  } = useCities(provinceIdValue);

  const provinces = useMemo<SelectOption[]>(() => {
    const list = provincesData?.data ?? [];
    return list
      .map((province: Province) => ({
        value: province.id.toString(),
        label: province.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [provincesData]);

  const cities = useMemo<SelectOption[]>(() => {
    const list = citiesData?.data ?? [];
    return list
      .map((city: City) => ({
        value: city.id.toString(),
        label: city.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [citiesData]);

  const provincesErrorMessage =
    provincesError instanceof Error ? provincesError.message : "";
  const citiesErrorMessage =
    citiesError instanceof Error ? citiesError.message : "";
  const today = new Date();
  const minBirthDate = new Date(
    today.getFullYear() - 120,
    today.getMonth(),
    today.getDate(),
  );
  const maxBirthDateValue = today.toISOString().split("T")[0];
  const minBirthDateValue = minBirthDate.toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const selectedProvince = provinces.find(
      (province) => province.value === formValues.provinceId,
    );
    const selectedCity = cities.find(
      (city) => city.value === formValues.cityId,
    );
    const resolvedProvinceName = formValues.provinceId
      ? (selectedProvince?.label ?? provinceName ?? null)
      : null;
    const resolvedCityName = formValues.cityId
      ? (selectedCity?.label ?? cityName ?? null)
      : null;
    const data = {
      realName: formValues.realName,
      ...(allowFivemChange ? { fivemName: formValues.fivemName } : {}),
      gender: formValues.gender || null,
      birthDate: formValues.birthDate || null,
      provinceId: formValues.provinceId || null,
      provinceName: resolvedProvinceName,
      cityId: formValues.cityId || null,
      cityName: resolvedCityName,
    };

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }

      setMessage({ type: "success", text: "Profile updated successfully" });
      setIsEditing(false);

      // Refresh the page to show updated data
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update profile",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardSection title="Profile Information">
      <DashboardCard>
        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <Alert variant={message.type} onDismiss={() => setMessage(null)}>
              {message.text}
            </Alert>
          )}

          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary-700 flex items-center justify-center overflow-hidden border-2 border-secondary-700">
              {avatarUrl ? (
                <Image
                  width={80}
                  height={80}
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="text-primary-300" size={36} />
              )}
            </div>
            <div>
              <Typography.Heading
                level={6}
                type="display"
                className="uppercase"
              >
                {username || "User"}
              </Typography.Heading>
              <Typography.Paragraph className="text-primary-300">
                {email}
              </Typography.Paragraph>
            </div>
          </div>

          {/* Profile Fields */}
          <div className="grid gap-4 md:grid-cols-2">
            <Form.Text
              name="realName"
              label="Real Name"
              value={formValues.realName}
              onChange={(e) =>
                setFormValues((prev) => ({ ...prev, realName: e.target.value }))
              }
              placeholder="Enter your display name"
              disabled={!isEditing}
              helperText="This name will be visible to other users"
            />

            <Form.Text
              name="fivemName"
              label="FiveM Character Name"
              value={formValues.fivemName}
              onChange={(e) =>
                setFormValues((prev) => ({
                  ...prev,
                  fivemName: e.target.value,
                }))
              }
              placeholder="Your in-game character name"
              disabled={!isEditing || !allowFivemChange}
              helperText={
                allowFivemChange
                  ? undefined
                  : "FiveM character name changes are disabled"
              }
            />

            <Form.Select
              name="gender"
              label="Gender"
              placeholder="Select gender"
              options={[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
              ]}
              value={formValues.gender}
              onChange={(value) =>
                setFormValues((prev) => ({ ...prev, gender: value }))
              }
              disabled={!isEditing}
              helperText="Select your gender"
            />

            <Form.Date
              name="birthDate"
              label="Birth Date"
              placeholder="Select your birth date"
              value={formValues.birthDate}
              onChange={(value) =>
                setFormValues((prev) => ({ ...prev, birthDate: value }))
              }
              disabled={!isEditing}
              helperText="For verification"
              min={minBirthDateValue}
              max={maxBirthDateValue}
            />

            <Form.Select
              name="province"
              label="Province"
              placeholder={
                isLoadingProvinces ? "Loading..." : "Select province"
              }
              options={provinces}
              value={formValues.provinceId}
              onChange={(value) =>
                setFormValues((prev) => ({
                  ...prev,
                  provinceId: value,
                  cityId: "",
                }))
              }
              error={provincesErrorMessage}
              helperText="Select your province"
              disabled={!isEditing || isLoadingProvinces}
            />

            <Form.Select
              name="city"
              label="City"
              placeholder={
                !formValues.provinceId
                  ? "Select province first"
                  : isLoadingCities
                    ? "Loading..."
                    : "Select city"
              }
              options={cities}
              value={formValues.cityId}
              onChange={(value) =>
                setFormValues((prev) => ({ ...prev, cityId: value }))
              }
              error={citiesErrorMessage}
              helperText="Select your city"
              disabled={!isEditing || !formValues.provinceId || isLoadingCities}
            />
          </div>

          <div className="flex gap-3">
            {isEditing ? (
              <>
                <Button.Primary
                  type="submit"
                  variant="solid"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button.Primary>
                <Button.Secondary
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormValues(initialFormValues());
                    setIsEditing(false);
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button.Secondary>
              </>
            ) : (
              <Button.Secondary
                type="button"
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button.Secondary>
            )}
          </div>
        </form>
      </DashboardCard>
    </DashboardSection>
  );
}
