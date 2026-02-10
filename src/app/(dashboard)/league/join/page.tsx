"use client";

import { useMemo, useState } from "react";

import {
  DashboardCard,
  DashboardSection,
} from "@/app/(dashboard)/_components/dashboard";
import { Modal } from "@/components";
import { Button } from "@/components/button";
import { Form } from "@/components/form";
import { Typography } from "@/components/typography";
import { useLeagueJoinApi } from "@/services/hooks/api/useLeagueJoinApi";
import { useApiSWR } from "@/services/swr";

const formatAmount = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function LeagueJoinPage() {
  const { createLeagueJoinCheckout } = useLeagueJoinApi();
  const { data, error, isLoading } = useApiSWR<LeagueJoinListResponse>(
    "/api/user/league/join",
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeagueId, setSelectedLeagueId] = useState("");
  const [actionError, setActionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableLeagues = useMemo(
    () => (data?.leagues ?? []).filter((league) => !league.alreadyJoined),
    [data?.leagues],
  );

  const leagueOptions = useMemo(
    () =>
      availableLeagues.map((league) => ({
        value: String(league.id),
        label: `${league.name} (${league.status}) - $${formatAmount(league.price)}`,
      })),
    [availableLeagues],
  );

  const openModal = () => {
    setActionError("");
    setSelectedLeagueId(leagueOptions[0]?.value ?? "");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) {
      return;
    }
    setIsModalOpen(false);
    setActionError("");
  };

  const selectedLeague = availableLeagues.find(
    (league) => String(league.id) === selectedLeagueId,
  );

  const submitJoin = async () => {
    const leagueId = Number.parseInt(selectedLeagueId, 10);
    if (!Number.isInteger(leagueId) || leagueId < 1) {
      setActionError("Please select a league first.");
      return;
    }

    setActionError("");
    setIsSubmitting(true);

    try {
      const result = await createLeagueJoinCheckout({ leagueId });

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }

      setActionError(
        "Payment created but checkout URL was not returned. Please contact admin.",
      );
    } catch (submitError) {
      setActionError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to create payment checkout.",
      );
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
          League Join
        </Typography.Heading>
        <Typography.Paragraph className="text-primary-300 text-sm mt-1">
          Join a league and continue payment with DOKU QRIS.
        </Typography.Paragraph>
      </div>

      <DashboardSection title="Join League">
        <DashboardCard>
          {isLoading ? (
            <Typography.Paragraph className="text-primary-300">
              Loading available leagues...
            </Typography.Paragraph>
          ) : null}

          {error ? (
            <Typography.Paragraph className="text-tertiary-red">
              {error.message}
            </Typography.Paragraph>
          ) : null}

          {!isLoading && !error && data && availableLeagues.length === 0 ? (
            <Typography.Paragraph className="text-primary-300">
              No available leagues to join right now.
            </Typography.Paragraph>
          ) : null}

          {!isLoading && !error && data && availableLeagues.length > 0 ? (
            <Button.Primary type="button" variant="solid" onClick={openModal}>
              Join League
            </Button.Primary>
          ) : null}
        </DashboardCard>
      </DashboardSection>

      <Modal.Global
        open={isModalOpen}
        title="Join League"
        onClose={closeModal}
        footer={
          <div className="flex justify-end gap-2">
            <Button.Secondary
              type="button"
              variant="outline"
              onClick={closeModal}
              disabled={isSubmitting}
            >
              Cancel
            </Button.Secondary>
            <Button.Primary
              type="button"
              variant="solid"
              onClick={() => void submitJoin()}
              disabled={isSubmitting || !selectedLeagueId}
            >
              {isSubmitting ? "Processing..." : "Continue To QRIS"}
            </Button.Primary>
          </div>
        }
      >
        <div className="space-y-4">
          <Typography.Paragraph className="text-primary-200">
            Choose a league to join as boss of <span className="font-semibold">{data?.teamName ?? "your team"}</span>.
          </Typography.Paragraph>

          <Form.Select
            name="league"
            label="League"
            placeholder="Select league"
            options={leagueOptions}
            value={selectedLeagueId}
            onChange={(value) => setSelectedLeagueId(value)}
            fullWidth
          />

          {selectedLeague ? (
            <div className="rounded border border-primary-700 bg-primary-800/40 p-3">
              <Typography.Paragraph className="text-primary-100">
                League: {selectedLeague.name}
              </Typography.Paragraph>
              <Typography.Paragraph className="text-primary-300 text-sm">
                Status: {selectedLeague.status}
              </Typography.Paragraph>
              <Typography.Paragraph className="text-primary-300 text-sm">
                Price: ${formatAmount(selectedLeague.price)}
              </Typography.Paragraph>
            </div>
          ) : null}

          {actionError ? (
            <Typography.Paragraph className="text-tertiary-red text-sm">
              {actionError}
            </Typography.Paragraph>
          ) : null}
        </div>
      </Modal.Global>
    </div>
  );
}
