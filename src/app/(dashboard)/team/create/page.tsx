"use client";

import { useMemo, useState } from "react";
import { z } from "zod";

import {
  DashboardCard,
  DashboardSection,
} from "@/app/(dashboard)/_components/dashboard";
import { Button } from "@/components/button";
import { Form } from "@/components/form";
import { Typography } from "@/components/typography";
import { formatZodError } from "@/lib/formValidation";
import { createTeamSchema } from "@/schemas/teamCreate";
import { useTeamCreateApi } from "@/services/hooks/api/useTeamCreateApi";
import { useApiSWR } from "@/services/swr";

type CreateTeamForm = {
  gangName: string;
  gangShortName: string;
};

type CreateTeamFormErrors = Partial<Record<keyof CreateTeamForm, string>>;

const initialForm: CreateTeamForm = {
  gangName: "",
  gangShortName: "",
};

export default function TeamCreatePage() {
  const { createTeam } = useTeamCreateApi();
  const { data, error, isLoading, mutate } = useApiSWR<TeamInfoResponse>(
    "/api/user/gang",
  );

  const [form, setForm] = useState<CreateTeamForm>(initialForm);
  const [formErrors, setFormErrors] = useState<CreateTeamFormErrors>({});
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canCreate = useMemo(() => {
    if (isLoading || error) {
      return false;
    }

    if (!data) {
      return false;
    }

    return data.team === null;
  }, [data, error, isLoading]);

  const updateField = <K extends keyof CreateTeamForm>(
    field: K,
    value: CreateTeamForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canCreate) {
      setActionError("You are already assigned to a team.");
      return;
    }

    try {
      const parsed = createTeamSchema.parse(form);
      setFormErrors({});
      setActionError("");
      setSuccessMessage("");
      setIsSubmitting(true);

      const result = await createTeam(parsed);
      await mutate();

      setSuccessMessage(result.message ?? "Team created successfully.");
      setForm(initialForm);

      setTimeout(() => {
        window.location.href = "/team/info";
      }, 800);
    } catch (submitError) {
      if (submitError instanceof z.ZodError) {
        setFormErrors(formatZodError<CreateTeamForm>(submitError));
      } else {
        setActionError(
          submitError instanceof Error ? submitError.message : "Failed to create team.",
        );
      }
    } finally {
      setIsSubmitting(false);
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
          Create Team
        </Typography.Heading>
        <Typography.Paragraph className="text-primary-300 text-sm mt-1">
          Create a team and become its first boss member.
        </Typography.Paragraph>
      </div>

      <DashboardSection title="Create Team">
        <DashboardCard>
          {isLoading ? (
            <Typography.Paragraph className="text-primary-300">
              Checking your current team status...
            </Typography.Paragraph>
          ) : null}

          {error ? (
            <Typography.Paragraph className="text-tertiary-red">
              {error.message}
            </Typography.Paragraph>
          ) : null}

          {!isLoading && !error && data?.team ? (
            <div className="space-y-4">
              <Typography.Paragraph className="text-primary-300">
                You are already in team {" "}
                <span className="text-primary-100 font-semibold">{data.team.name}</span>
                {" "}({data.team.code.toUpperCase()}).
              </Typography.Paragraph>
              <Button.Secondary
                type="button"
                variant="outline"
                onClick={() => {
                  window.location.href = "/team/info";
                }}
              >
                Go To Team Info
              </Button.Secondary>
            </div>
          ) : null}

          {!isLoading && !error && canCreate ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Form.Text
                  name="gangName"
                  label="Gang Name"
                  placeholder="e.g. Shadow Hunters"
                  value={form.gangName}
                  onChange={(event) => updateField("gangName", event.target.value)}
                  error={formErrors.gangName}
                  helperText="Displayed team name"
                  required
                  fullWidth
                />

                <Form.Text
                  name="gangShortName"
                  label="Gang Short Name"
                  placeholder="e.g. shd"
                  value={form.gangShortName}
                  onChange={(event) =>
                    updateField("gangShortName", event.target.value)
                  }
                  error={formErrors.gangShortName}
                  helperText="Used as team code (letters, numbers, underscore)"
                  required
                  fullWidth
                />
              </div>

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

              <div>
                <Button.Primary
                  type="submit"
                  variant="solid"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Team"}
                </Button.Primary>
              </div>
            </form>
          ) : null}
        </DashboardCard>
      </DashboardSection>
    </div>
  );
}
