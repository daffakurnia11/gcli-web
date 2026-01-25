"use client";

import { User } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/button";
import { Form } from "@/components/form";
import { Typography } from "@/components/typography";

import { Alert, DashboardCard, DashboardSection } from "./index";

export interface ProfileSectionProps {
  username?: string | null;
  email?: string | null;
  realName?: string | null;
  fivemName?: string | null;
  avatarUrl?: string | null;
  allowFivemChange?: boolean;
}

export function ProfileSection({
  username,
  email,
  realName,
  fivemName,
  avatarUrl,
  allowFivemChange = true,
}: ProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      realName: formData.get("realName") as string,
      ...(allowFivemChange
        ? { fivemName: formData.get("fivemName") as string }
        : {}),
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
              defaultValue={realName || ""}
              placeholder="Enter your display name"
              disabled={!isEditing}
              helperText="This name will be visible to other users"
            />

            <Form.Text
              name="fivemName"
              label="FiveM Character Name"
              defaultValue={fivemName || ""}
              placeholder="Your in-game character name"
              disabled={!isEditing || !allowFivemChange}
              helperText={
                allowFivemChange
                  ? undefined
                  : "FiveM character name changes are disabled"
              }
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
                  onClick={() => setIsEditing(false)}
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
