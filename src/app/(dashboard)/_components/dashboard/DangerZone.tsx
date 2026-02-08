"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";

import { Button } from "@/components/button";
import { Form } from "@/components/form";
import { Typography } from "@/components/typography";
import { clearAuthSetupPayload } from "@/lib/authSetupPayload";
import { useAccountApi } from "@/services/hooks/api/useAccountApi";

import { Alert, DashboardCard, SettingsGroup } from "./index";

export function DangerZone() {
  const { deleteAccount } = useAccountApi();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleDeleteAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsDeleting(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const confirmation = formData.get("confirmation") as string;

    if (confirmation !== "DELETE") {
      setMessage({ type: "error", text: 'Please type "DELETE" to confirm' });
      setIsDeleting(false);
      return;
    }

    try {
      await deleteAccount();

      setMessage({ type: "success", text: "Account deleted. Signing out..." });
      clearAuthSetupPayload();
      await signOut({ redirect: false });
      window.location.href = "/";
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to delete account",
      });
      setIsDeleting(false);
    }
  };

  return (
    <DashboardCard className="border-tertiary-red">
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
          <AlertTriangle className="text-tertiary-red" size={20} />
          <Typography.Heading
            level={6}
            type="display"
            as="h3"
            className="text-tertiary-red"
          >
            Danger Zone
          </Typography.Heading>
        </div>

        <div className="space-y-4">
          <Typography.Paragraph as="p" className="text-primary-200">
            Deleting your account is permanent. All your data will be
            permanently removed and cannot be recovered. This action cannot be
            undone.
          </Typography.Paragraph>

          {!showConfirm ? (
            <Button.Secondary
              variant="outline"
              size="sm"
              onClick={() => setShowConfirm(true)}
              className="border-tertiary-red text-tertiary-red hover:bg-tertiary-red/10"
            >
              Delete Account
            </Button.Secondary>
          ) : (
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <Typography.Small className="text-primary-300 block">
                To confirm deletion, type{" "}
                <span className="text-white font-bold">DELETE</span> below:
              </Typography.Small>

              <Form.Text
                name="confirmation"
                placeholder="Type DELETE to confirm"
                required
                autoComplete="off"
              />

              <div className="flex gap-3">
                <Button.Secondary
                  type="submit"
                  variant="solid"
                  size="sm"
                  disabled={isDeleting}
                  className="bg-tertiary-red text-white hover:bg-tertiary-red/90 border-tertiary-red"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={14} className="animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    "Confirm Deletion"
                  )}
                </Button.Secondary>
                <Button.Secondary
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowConfirm(false);
                    setMessage(null);
                  }}
                  disabled={isDeleting}
                >
                  Cancel
                </Button.Secondary>
              </div>
            </form>
          )}
        </div>
      </SettingsGroup>
    </DashboardCard>
  );
}
