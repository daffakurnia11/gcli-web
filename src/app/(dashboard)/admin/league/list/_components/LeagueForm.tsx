"use client";

import { useState } from "react";
import { z } from "zod";

import { Button } from "@/components/button";
import { Form } from "@/components/form";
import { Typography } from "@/components/typography";
import { formatZodError } from "@/lib/formValidation";
import { leagueFormSchema, toLeaguePayload } from "@/schemas/league";

type LeagueFormProps = {
  mode: "create" | "edit";
  initialValues: LeagueFormValues;
  isSubmitting: boolean;
  actionError: string;
  onCancel: () => void;
  onSubmit: (payload: AdminLeagueUpsertPayload) => Promise<void>;
};

export function LeagueForm({
  mode,
  initialValues,
  isSubmitting,
  actionError,
  onCancel,
  onSubmit,
}: LeagueFormProps) {
  const [values, setValues] = useState<LeagueFormValues>(initialValues);
  const [errors, setErrors] = useState<LeagueFormErrors>({});

  const updateField = <K extends keyof LeagueFormValues>(
    field: K,
    value: LeagueFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const parsed = leagueFormSchema.parse(values);
      setErrors({});
      await onSubmit(toLeaguePayload(parsed));
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(formatZodError<LeagueFormValues>(error));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Form.Text
          name="name"
          label="League Name"
          value={values.name}
          onChange={(event) => updateField("name", event.target.value)}
          error={errors.name}
          required
          fullWidth
        />

        <Form.Select
          name="status"
          label="Status"
          value={values.status}
          onChange={(value) => updateField("status", value as LeagueStatus)}
          options={[
            { value: "upcoming", label: "Upcoming" },
            { value: "active", label: "Active" },
            { value: "finished", label: "Finished" },
          ]}
          error={errors.status}
          required
          fullWidth
        />

        <Form.Number
          name="price"
          label="Registration Fee"
          value={values.price}
          min={0}
          onChange={(event) => updateField("price", event.target.value)}
          error={errors.price}
          required
          fullWidth
        />

        <Form.Number
          name="maxTeam"
          label="Max Team"
          value={values.maxTeam}
          min={0}
          onChange={(event) => updateField("maxTeam", event.target.value)}
          error={errors.maxTeam}
          helperText="Use 0 for unlimited"
          required
          fullWidth
        />

        <Form.Date
          name="startAt"
          label="Start At"
          value={values.startAt}
          onChange={(value) => updateField("startAt", value)}
          enableTime
          error={errors.startAt}
          fullWidth
        />

        <Form.Date
          name="endAt"
          label="End At"
          value={values.endAt}
          onChange={(value) => updateField("endAt", value)}
          enableTime
          error={errors.endAt}
          fullWidth
        />
      </div>
      <Form.Textarea
        name="rulesJson"
        label="Rules JSON (optional)"
        value={values.rulesJson}
        onChange={(event) => updateField("rulesJson", event.target.value)}
        error={errors.rulesJson}
        placeholder='{"points":{"win":3,"draw":1}}'
        rows={4}
        fullWidth
      />

      {actionError ? (
        <Typography.Paragraph className="text-sm text-tertiary-red">
          {actionError}
        </Typography.Paragraph>
      ) : null}

      <div className="flex items-center gap-2">
        <Button.Primary type="submit" variant="solid" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : mode === "edit"
              ? "Update League"
              : "Create League"}
        </Button.Primary>
        <Button.Secondary
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          Cancel
        </Button.Secondary>
      </div>
    </form>
  );
}
