"use client";

import { KeyRound } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/button";
import { Form } from "@/components/form";
import { Typography } from "@/components/typography";

import { Alert, DashboardCard, SettingsGroup } from "./index";

export function PasswordSettings() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      currentPassword: formData.get("currentPassword") as string,
      newPassword: formData.get("newPassword") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    if (data.newPassword !== data.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update password");
      }

      setMessage({ type: "success", text: "Password updated successfully" });
      setIsEditing(false);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardCard>
      <form onSubmit={handleSubmit}>
        {message && (
          <Alert variant={message.type} onDismiss={() => setMessage(null)} className="mb-4">
            {message.text}
          </Alert>
        )}

        <SettingsGroup>
          <div className="flex items-center gap-3 mb-4">
            <KeyRound className="text-secondary-700" size={20} />
            <Typography.Heading level={6} type="display" as="h3">
              Password
            </Typography.Heading>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <Form.Text
                name="currentPassword"
                label="Current Password"
                type="password"
                placeholder="Enter your current password"
                required
                autoComplete="current-password"
              />

              <Form.Text
                name="newPassword"
                label="New Password"
                type="password"
                placeholder="Enter your new password"
                required
                autoComplete="new-password"
                helperText="Password must be at least 8 characters long"
              />

              <Form.Text
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                placeholder="Confirm your new password"
                required
                autoComplete="new-password"
              />

              <div className="flex gap-3">
                <Button.Primary type="submit" variant="solid" size="sm" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Password"}
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
              </div>
            </div>
          ) : (
            <div>
              <Typography.Paragraph as="p" className="text-primary-300">
                Use a strong password with at least 8 characters, including letters, numbers, and
                symbols.
              </Typography.Paragraph>
              <div className="mt-4">
                <Button.Secondary
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Change Password
                </Button.Secondary>
              </div>
            </div>
          )}
        </SettingsGroup>
      </form>
    </DashboardCard>
  );
}
