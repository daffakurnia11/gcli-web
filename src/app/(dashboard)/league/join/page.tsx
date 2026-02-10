"use client";

import { useEffect, useMemo, useState } from "react";

import {
  DashboardCard,
  DashboardSection,
} from "@/app/(dashboard)/_components/dashboard";
import { Button } from "@/components/button";
import { Form } from "@/components/form";
import { DataTable, type DataTableColumn } from "@/components/table";
import { Typography } from "@/components/typography";
import { useLeagueJoinApi } from "@/services/hooks/api/useLeagueJoinApi";
import { useApiSWR } from "@/services/swr";

const formatAmount = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const memberColumns: Array<DataTableColumn<TeamMember>> = [
  {
    key: "character",
    header: "Member",
    render: (member) => (
      <div className="flex flex-col gap-1">
        <Typography.Paragraph as="p" className="text-primary-100 font-semibold">
          {member.characterName}
        </Typography.Paragraph>
        <Typography.Small as="p" className="text-primary-300">
          {member.playerName ?? "Unknown player"}
        </Typography.Small>
      </div>
    ),
  },
  {
    key: "grade",
    header: "Grade",
    render: (member) => (
      <Typography.Paragraph as="p" className="text-primary-100">
        {member.gradeName} ({member.gradeLevel})
      </Typography.Paragraph>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (member) => (
      <span
        className={
          member.status === "online"
            ? "inline-flex rounded-full bg-green-500/20 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-green-300"
            : "inline-flex rounded-full bg-primary-700 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary-300"
        }
      >
        {member.status}
      </span>
    ),
  },
];

export default function LeagueJoinPage() {
  const { createLeagueJoinCheckout } = useLeagueJoinApi();

  const {
    data: leagueData,
    error: leagueError,
    isLoading: isLoadingLeague,
  } = useApiSWR<LeagueJoinListResponse>("/api/user/league/join");

  const {
    data: teamInfo,
    error: teamInfoError,
    isLoading: isLoadingTeamInfo,
  } = useApiSWR<TeamInfoResponse>("/api/user/gang");

  const {
    data: membersData,
    error: membersError,
    isLoading: isLoadingMembers,
  } = useApiSWR<TeamMembersResponse>("/api/user/gang/members");

  const [selectedLeagueId, setSelectedLeagueId] = useState("");
  const [actionError, setActionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableLeagues = useMemo(
    () => (leagueData?.leagues ?? []).filter((league) => !league.alreadyJoined),
    [leagueData?.leagues],
  );

  const leagueOptions = useMemo(
    () =>
      availableLeagues.map((league) => ({
        value: String(league.id),
        label: `${league.name} (${league.status}) - $${formatAmount(league.price)}`,
      })),
    [availableLeagues],
  );

  useEffect(() => {
    if (!selectedLeagueId && leagueOptions.length > 0) {
      setSelectedLeagueId(leagueOptions[0].value);
    }
  }, [leagueOptions, selectedLeagueId]);

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
          Review your team summary and choose a league to join.
        </Typography.Paragraph>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-6">
        <div className="xl:col-span-4 space-y-4">
          <DashboardSection title="Team Summary">
            <DashboardCard>
              {isLoadingTeamInfo ? (
                <Typography.Paragraph className="text-primary-300">
                  Loading team summary...
                </Typography.Paragraph>
              ) : null}

              {teamInfoError ? (
                <Typography.Paragraph className="text-tertiary-red">
                  {teamInfoError.message}
                </Typography.Paragraph>
              ) : null}

              {!isLoadingTeamInfo && !teamInfoError && teamInfo?.team ? (
                <div className="space-y-3">
                  <Typography.Heading level={5} className="text-primary-100">
                    {teamInfo.team.name}
                  </Typography.Heading>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Typography.Paragraph className="text-primary-300 text-sm">
                      Team Code: <span className="text-primary-100 uppercase">{teamInfo.team.code}</span>
                    </Typography.Paragraph>
                    <Typography.Paragraph className="text-primary-300 text-sm">
                      Members: <span className="text-primary-100">{teamInfo.stats?.memberCount ?? 0}</span>
                    </Typography.Paragraph>
                    <Typography.Paragraph className="text-primary-300 text-sm">
                      Bosses: <span className="text-primary-100">{teamInfo.stats?.bossCount ?? 0}</span>
                    </Typography.Paragraph>
                    <Typography.Paragraph className="text-primary-300 text-sm">
                      Your Role: <span className="text-primary-100">{teamInfo.currentMember?.gradeName ?? "Unknown"}</span>
                    </Typography.Paragraph>
                  </div>
                </div>
              ) : null}

              {!isLoadingTeamInfo && !teamInfoError && !teamInfo?.team ? (
                <Typography.Paragraph className="text-primary-300">
                  {teamInfo?.message ?? "No team information available."}
                </Typography.Paragraph>
              ) : null}
            </DashboardCard>
          </DashboardSection>

          <DashboardSection title="Team Members">
            <DashboardCard>
              {isLoadingMembers ? (
                <Typography.Paragraph className="text-primary-300">
                  Loading members...
                </Typography.Paragraph>
              ) : null}

              {membersError ? (
                <Typography.Paragraph className="text-tertiary-red">
                  {membersError.message}
                </Typography.Paragraph>
              ) : null}

              {!isLoadingMembers && !membersError && membersData?.members && membersData.members.length > 0 ? (
                <DataTable
                  columns={memberColumns}
                  rows={membersData.members}
                  rowKey={(member) => member.citizenId}
                  className="w-full!"
                />
              ) : null}

              {!isLoadingMembers && !membersError && (!membersData?.members || membersData.members.length === 0) ? (
                <Typography.Paragraph className="text-primary-300">
                  {membersData?.message ?? "No members found."}
                </Typography.Paragraph>
              ) : null}
            </DashboardCard>
          </DashboardSection>
        </div>

        <div className="xl:col-span-2">
          <DashboardSection title="Join League">
            <DashboardCard className="space-y-4">
              {isLoadingLeague ? (
                <Typography.Paragraph className="text-primary-300">
                  Loading available leagues...
                </Typography.Paragraph>
              ) : null}

              {leagueError ? (
                <Typography.Paragraph className="text-tertiary-red">
                  {leagueError.message}
                </Typography.Paragraph>
              ) : null}

              {!isLoadingLeague && !leagueError && leagueData && availableLeagues.length > 0 ? (
                <>
                  <Typography.Paragraph className="text-primary-200">
                    Choose a league to join as boss of <span className="font-semibold">{leagueData.teamName}</span>.
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

                  <Button.Primary
                    type="button"
                    variant="solid"
                    onClick={() => void submitJoin()}
                    disabled={isSubmitting || !selectedLeagueId}
                    className="w-full"
                  >
                    {isSubmitting ? "Processing..." : "Continue to payment"}
                  </Button.Primary>
                </>
              ) : null}

              {!isLoadingLeague && !leagueError && leagueData && availableLeagues.length === 0 ? (
                <Typography.Paragraph className="text-primary-300">
                  No available leagues to join right now.
                </Typography.Paragraph>
              ) : null}
            </DashboardCard>
          </DashboardSection>
        </div>
      </div>
    </div>
  );
}
