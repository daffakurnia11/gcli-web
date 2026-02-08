"use client";

import { Mail } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/button";
import { Form } from "@/components/form";
import { Typography } from "@/components/typography";
import { useAccountApi } from "@/services/hooks/api/useAccountApi";

import { Alert, DashboardCard, SettingsGroup } from "./index";

export interface EmailSettingsProps {
  currentEmail?: string | null;
}

export function EmailSettings({ currentEmail }: EmailSettingsProps) {
  const { updateEmail } = useAccountApi();
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
      newEmail: formData.get("newEmail") as string,
      password: formData.get("password") as string,
    };

    try {
      await updateEmail(data);

      setMessage({ type: "success", text: "Email updated successfully" });
      setIsEditing(false);

      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update email",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardCard>
      <form onSubmit={handleSubmit}>
        {message && (
          <Alert
            variant={message.type}
            onDismiss={() => setMessage(null)}
            className="mb-4"
          >
            {message.text}
          </Alert>
        )}

        <SettingsGroup>
          <div className="flex items-center gap-3 mb-4">
            <Mail className="text-secondary-700" size={20} />
            <Typography.Heading level={6} type="display" as="h3">
              Email Address
            </Typography.Heading>
          </div>

          <div className="space-y-4">
            <div>
              <Typography.Small className="text-primary-300 block mb-2">
                Current Email
              </Typography.Small>
              <Typography.Paragraph as="p" className="text-primary-100">
                {currentEmail || "No email set"}
              </Typography.Paragraph>
            </div>

            {isEditing && (
              <div className="space-y-4 pt-4 border-t border-primary-700">
                <Form.Text
                  name="newEmail"
                  label="New Email"
                  type="email"
                  placeholder="Enter your new email address"
                  required
                  autoComplete="email"
                />

                <Form.Text
                  name="password"
                  label="Confirm Password"
                  type="password"
                  placeholder="Enter your password to confirm"
                  required
                  autoComplete="current-password"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-4">
            {isEditing ? (
              <>
                <Button.Primary
                  type="submit"
                  variant="solid"
                  size="sm"
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : "Update Email"}
                </Button.Primary>
                <Button.Secondary
                  type="button"
                  variant="outline"
                  size="sm"
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
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Change Email
              </Button.Secondary>
            )}
          </div>
        </SettingsGroup>
      </form>
    </DashboardCard>
  );
}
