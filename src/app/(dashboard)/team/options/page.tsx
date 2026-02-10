"use client";

import { useEffect, useState } from "react";
import { z } from "zod";

import {
  DashboardCard,
  DashboardSection,
} from "@/app/(dashboard)/_components/dashboard";
import { Modal } from "@/components";
import { Button } from "@/components/button";
import { Form } from "@/components/form";
import { Typography } from "@/components/typography";
import { formatZodError } from "@/lib/formValidation";
import { updateTeamNameSchema } from "@/schemas/teamOptions";
import { useTeamOptionsApi } from "@/services/hooks/api/useTeamOptionsApi";
import { useApiSWR } from "@/services/swr";

type TeamOptionsForm = {
  name: string;
};

type TeamOptionsFormErrors = Partial<Record<keyof TeamOptionsForm, string>>;

export default function TeamOptionsPage() {
  const { updateTeamName, deleteTeam } = useTeamOptionsApi();
  const { data, error, isLoading, mutate } = useApiSWR<TeamInfoResponse>(
    "/api/user/gang",
  );

  const [form, setForm] = useState<TeamOptionsForm>({ name: "" });
  const [formErrors, setFormErrors] = useState<TeamOptionsFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isBoss = data?.currentMember?.isBoss === true;

  useEffect(() => {
    if (data?.team?.name) {
      setForm({ name: data.team.name });
    }
  }, [data?.team?.name]);

  const handleUpdateName = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!data?.team) {
      setActionError("You are not currently assigned to a team.");
      return;
    }

    if (!isBoss) {
      setActionError("Only team boss can update team options.");
      return;
    }

    try {
      const parsed = updateTeamNameSchema.parse({ name: form.name.trim() });
      setFormErrors({});
      setActionError("");
      setSuccessMessage("");
      setIsSubmitting(true);

      const result = await updateTeamName(parsed);
      await mutate();

      setSuccessMessage(result.message ?? "Team name updated successfully.");
    } catch (submitError) {
      if (submitError instanceof z.ZodError) {
        setFormErrors(formatZodError<TeamOptionsForm>(submitError));
      } else {
        setActionError(
          submitError instanceof Error
            ? submitError.message
            : "Failed to update team name.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = () => {
    setActionError("");
    setSuccessMessage("");
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (isDeleting) {
      return;
    }
    setIsDeleteModalOpen(false);
  };

  const handleDeleteTeam = async () => {
    if (!isBoss) {
      setActionError("Only team boss can delete team.");
      return;
    }

    setActionError("");
    setSuccessMessage("");
    setIsDeleting(true);

    try {
      await deleteTeam();
      await mutate();
      closeDeleteModal();
      setSuccessMessage("Team deleted successfully.");
      setTimeout(() => {
        window.location.href = "/team/create";
      }, 800);
    } catch (deleteError) {
      setActionError(
        deleteError instanceof Error ? deleteError.message : "Failed to delete team.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Typography.Heading
          level={4}
          as="h2"
          type="display"
          className="uppercase tracking-wider text-primary-100"
        >
          Team Options
        </Typography.Heading>
        <Typography.Paragraph className="text-primary-300 text-sm mt-1">
          Manage your team profile.
        </Typography.Paragraph>
      </div>

      <DashboardSection title="Team Settings">
        <DashboardCard>
          {isLoading ? (
            <Typography.Paragraph className="text-primary-300">
              Loading team settings...
            </Typography.Paragraph>
          ) : null}

          {error ? (
            <Typography.Paragraph className="text-tertiary-red">
              {error.message}
            </Typography.Paragraph>
          ) : null}

          {!isLoading && !error && data?.team ? (
            <form onSubmit={handleUpdateName} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Form.Text
                  name="name"
                  label="Team Name"
                  value={form.name}
                  onChange={(event) =>
                    setForm({ name: event.target.value })
                  }
                  error={formErrors.name}
                  required
                  fullWidth
                />

                <Form.Text
                  name="code"
                  label="Team Code"
                  value={data.team.code}
                  disabled
                  helperText="Team code cannot be changed"
                  fullWidth
                />
              </div>

              {!isBoss ? (
                <Typography.Paragraph className="text-primary-300 text-sm">
                  Only team boss can update team options.
                </Typography.Paragraph>
              ) : null}

              {actionError ? (
                <Typography.Paragraph className="text-tertiary-red">
                  {actionError}
                </Typography.Paragraph>
              ) : null}

              {successMessage ? (
                <Typography.Paragraph className="text-green-400">
                  {successMessage}
                </Typography.Paragraph>
              ) : null}

              <Button.Primary
                type="submit"
                variant="solid"
                disabled={isSubmitting || !isBoss}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button.Primary>
            </form>
          ) : null}

          {!isLoading && !error && !data?.team ? (
            <Typography.Paragraph className="text-primary-300">
              {data?.message ?? "You are not currently assigned to a team."}
            </Typography.Paragraph>
          ) : null}
        </DashboardCard>
      </DashboardSection>

      <DashboardSection title="Danger Zone">
        <DashboardCard className="border-tertiary-red">
          <div className="space-y-4">
            <Typography.Paragraph className="text-primary-200">
              Deleting your team is permanent. All members will be removed from this team and set to no gang.
            </Typography.Paragraph>

            {!isBoss ? (
              <Typography.Paragraph className="text-primary-300 text-sm">
                Only team boss can delete the team.
              </Typography.Paragraph>
            ) : null}

            <Button.Secondary
              type="button"
              variant="outline"
              onClick={openDeleteModal}
              disabled={!isBoss || !data?.team}
              className="border-tertiary-red text-tertiary-red hover:bg-tertiary-red/10"
            >
              Delete Team
            </Button.Secondary>
          </div>
        </DashboardCard>
      </DashboardSection>

      <Modal.Global
        open={isDeleteModalOpen}
        title="Delete Team"
        onClose={closeDeleteModal}
        footer={
          <div className="flex justify-end gap-2">
            <Button.Secondary
              type="button"
              variant="outline"
              onClick={closeDeleteModal}
              disabled={isDeleting}
            >
              Cancel
            </Button.Secondary>
            <Button.Primary
              type="button"
              variant="outline"
              onClick={() => void handleDeleteTeam()}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Team"}
            </Button.Primary>
          </div>
        }
      >
        <div className="space-y-3">
          <Typography.Paragraph className="text-primary-200">
            Delete team <span className="font-semibold text-primary-100">{data?.team?.name ?? ""}</span> ({data?.team?.code?.toUpperCase() ?? ""})?
          </Typography.Paragraph>
          <Typography.Paragraph className="text-sm text-tertiary-red">
            This cannot be undone. All team members will be set to no gang.
          </Typography.Paragraph>
        </div>
      </Modal.Global>
    </div>
  );
}
