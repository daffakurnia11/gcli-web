"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  DashboardCard,
  DashboardSection,
} from "@/app/(dashboard)/_components/dashboard";
import { Button } from "@/components/button";
import { Form } from "@/components/form";
import { DataTable, type DataTableColumn,Pagination } from "@/components/table";
import { Typography } from "@/components/typography";
import { formatDateTime } from "@/services/date";
import { useAdminLeagueApi } from "@/services/hooks/api/useAdminLeagueApi";
import { useApiSWR } from "@/services/swr";

type LeagueDetailPageProps = {
  leagueId: number;
};

const numberFormatter = new Intl.NumberFormat("id-ID");
const DETAIL_ITEMS_PER_PAGE = 10;
const matchStatusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "scheduled", label: "Scheduled" },
  { value: "ongoing", label: "Ongoing" },
  { value: "finished", label: "Finished" },
  { value: "canceled", label: "Canceled" },
];

const statusClassName = (status: string) => {
  const normalized = status.trim().toLowerCase();
  if (normalized === "active") {
    return "text-green-300 bg-green-500/15 border-green-500/40";
  }
  if (normalized === "finished") {
    return "text-primary-200 bg-primary-700/30 border-primary-600";
  }
  return "text-secondary-700 bg-secondary-700/15 border-secondary-700/40";
};

const matchStatusClassName = (status: string) => {
  const normalized = status.trim().toLowerCase();
  if (normalized === "finished") {
    return "text-green-300 bg-green-500/15 border-green-500/40";
  }
  if (normalized === "ongoing") {
    return "text-secondary-700 bg-secondary-700/15 border-secondary-700/40";
  }
  if (normalized === "canceled" || normalized === "cancelled") {
    return "text-tertiary-red bg-tertiary-red/15 border-tertiary-red/40";
  }
  return "text-primary-200 bg-primary-700/30 border-primary-600";
};

const buildRosterPreview = (players: LeagueRosterPlayer[]) => {
  if (players.length === 0) {
    return "-";
  }
  const preview = players.slice(0, 3).map((player) => player.characterName);
  return players.length > 3
    ? `${preview.join(", ")} +${players.length - 3}`
    : preview.join(", ");
};

export default function LeagueDetailPage({ leagueId }: LeagueDetailPageProps) {
  const endpoint = `/api/admin/league/${leagueId}/detail`;
  const { startLeague } = useAdminLeagueApi();
  const { data, error, isLoading, mutate } =
    useApiSWR<AdminLeagueDetailResponse>(endpoint);
  const [isStarting, setIsStarting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [standingsSearchInput, setStandingsSearchInput] = useState("");
  const [standingsQuery, setStandingsQuery] = useState("");
  const [standingsPage, setStandingsPage] = useState(1);
  const [scheduleSearchInput, setScheduleSearchInput] = useState("");
  const [scheduleQuery, setScheduleQuery] = useState("");
  const [scheduleStatusFilter, setScheduleStatusFilter] = useState("all");
  const [schedulePage, setSchedulePage] = useState(1);

  const standingsColumns: Array<DataTableColumn<AdminLeagueTeamStatusItem>> =
    useMemo(
      () => [
        {
          key: "team",
          header: "Team",
          render: (row) => (
            <div className="space-y-1">
              <Typography.Paragraph className="text-primary-100">
                {row.teamName}
              </Typography.Paragraph>
              <Typography.Small className="text-primary-300 uppercase">
                {row.teamCode}
              </Typography.Small>
            </div>
          ),
        },
        {
          key: "record",
          header: "W-D-L",
          align: "center",
          render: (row) => (
            <Typography.Paragraph className="text-primary-100">
              {row.standing.wins}-{row.standing.draws}-{row.standing.losses}
            </Typography.Paragraph>
          ),
        },
        {
          key: "goals",
          header: "GF-GA (GD)",
          align: "center",
          render: (row) => (
            <Typography.Paragraph className="text-primary-100">
              {row.standing.goalsFor}-{row.standing.goalsAgainst} (
              {row.standing.goalDiff})
            </Typography.Paragraph>
          ),
        },
        {
          key: "points",
          header: "Points",
          align: "center",
          render: (row) => (
            <Typography.Paragraph className="text-secondary-700 font-semibold">
              {numberFormatter.format(row.standing.points)}
            </Typography.Paragraph>
          ),
        },
        {
          key: "joinedAt",
          header: "Joined",
          render: (row) => (
            <Typography.Small className="text-primary-300">
              {formatDateTime(row.joinedAt, { fallback: "-" })}
            </Typography.Small>
          ),
        },
      ],
      [],
    );

  const scheduleColumns: Array<DataTableColumn<AdminLeagueMatchScheduleItem>> =
    useMemo(
      () => [
        {
          key: "match",
          header: "Match",
          render: (row) => (
            <div className="space-y-1">
              <Typography.Paragraph className="text-primary-100">
                {row.homeTeam.name} vs {row.awayTeam.name}
              </Typography.Paragraph>
              <Typography.Small className="text-primary-300 uppercase">
                {row.homeTeam.code} vs {row.awayTeam.code}
              </Typography.Small>
            </div>
          ),
        },
        {
          key: "schedule",
          header: "Schedule",
          render: (row) => (
            <Typography.Small className="text-primary-300">
              {formatDateTime(row.scheduledAt, { fallback: "-" })}
            </Typography.Small>
          ),
        },
        {
          key: "result",
          header: "Result",
          render: (row) => (
            <Typography.Paragraph className="text-primary-100 font-semibold">
              {row.result
                ? `${row.result.homeScore} - ${row.result.awayScore}`
                : "-"}
            </Typography.Paragraph>
          ),
        },
        {
          key: "roster",
          header: "Roster (H/A)",
          render: (row) => (
            <div className="space-y-1">
              <Typography.Small className="text-primary-300">
                H: {buildRosterPreview(row.rosters.home)}
              </Typography.Small>
              <Typography.Small className="text-primary-300">
                A: {buildRosterPreview(row.rosters.away)}
              </Typography.Small>
            </div>
          ),
        },
        {
          key: "status",
          header: "Status",
          render: (row) => (
            <span
              className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${matchStatusClassName(row.matchStatus)}`}
            >
              {row.matchStatus}
            </span>
          ),
        },
      ],
      [],
    );

  const handleStartLeague = async () => {
    if (!data || isStarting) {
      return;
    }

    setIsStarting(true);
    setActionError("");

    try {
      await startLeague(data.league.id);
      await mutate();
    } catch (startError) {
      setActionError(
        startError instanceof Error ? startError.message : "Failed to start league.",
      );
    } finally {
      setIsStarting(false);
    }
  };

  const filteredStandings = (data?.standings ?? []).filter((row) => {
    if (!standingsQuery) {
      return true;
    }
    const query = standingsQuery.toLowerCase();
    return (
      row.teamName.toLowerCase().includes(query) ||
      row.teamCode.toLowerCase().includes(query)
    );
  });
  const standingsTotalPages = Math.max(
    1,
    Math.ceil(filteredStandings.length / DETAIL_ITEMS_PER_PAGE),
  );
  const standingsCurrentPage = Math.min(standingsPage, standingsTotalPages);
  const standingsRows = filteredStandings.slice(
    (standingsCurrentPage - 1) * DETAIL_ITEMS_PER_PAGE,
    standingsCurrentPage * DETAIL_ITEMS_PER_PAGE,
  );

  const filteredMatches = (data?.matches ?? []).filter((row) => {
    if (
      scheduleStatusFilter !== "all" &&
      row.matchStatus.toLowerCase() !== scheduleStatusFilter
    ) {
      return false;
    }

    if (!scheduleQuery) {
      return true;
    }

    const query = scheduleQuery.toLowerCase();
    return (
      row.homeTeam.name.toLowerCase().includes(query) ||
      row.awayTeam.name.toLowerCase().includes(query) ||
      row.homeTeam.code.toLowerCase().includes(query) ||
      row.awayTeam.code.toLowerCase().includes(query) ||
      (row.stage ?? "").toLowerCase().includes(query) ||
      (row.zone ?? "").toLowerCase().includes(query)
    );
  });
  const scheduleTotalPages = Math.max(
    1,
    Math.ceil(filteredMatches.length / DETAIL_ITEMS_PER_PAGE),
  );
  const scheduleCurrentPage = Math.min(schedulePage, scheduleTotalPages);
  const scheduleRows = filteredMatches.slice(
    (scheduleCurrentPage - 1) * DETAIL_ITEMS_PER_PAGE,
    scheduleCurrentPage * DETAIL_ITEMS_PER_PAGE,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/league/list"
          className="shrink-0 p-2 rounded-md border border-primary-700 bg-primary-800 text-primary-200 hover:bg-primary-700 hover:text-primary-100 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <Typography.Heading
            level={5}
            as="h2"
            type="display"
            className="uppercase tracking-wider text-primary-100"
          >
            League Detail
          </Typography.Heading>
          <Typography.Paragraph className="text-primary-300 text-sm mt-1">
            League ID: {leagueId}
          </Typography.Paragraph>
        </div>
      </div>

      {isLoading ? (
        <DashboardCard>
          <Typography.Paragraph className="text-primary-300">
            Loading league detail...
          </Typography.Paragraph>
        </DashboardCard>
      ) : null}

      {!isLoading && error ? (
        <DashboardCard>
          <Typography.Paragraph className="text-tertiary-red">
            {error.message}
          </Typography.Paragraph>
        </DashboardCard>
      ) : null}

      {!isLoading && !error && data ? (
        <>
          <DashboardSection
            title="League Summary"
            actionButton={
              data.league.status.toLowerCase() === "upcoming" ? (
                <Button.Primary
                  type="button"
                  variant="solid"
                  onClick={() => void handleStartLeague()}
                  disabled={isStarting}
                >
                  {isStarting ? "Starting..." : "Start League"}
                </Button.Primary>
              ) : undefined
            }
          >
            {actionError ? (
              <Typography.Paragraph className="mb-3 text-sm text-tertiary-red">
                {actionError}
              </Typography.Paragraph>
            ) : null}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <DashboardCard>
                <Typography.Small className="text-primary-300 uppercase tracking-wide">
                  League
                </Typography.Small>
                <Typography.Heading level={6} className="text-primary-100 mt-2">
                  {data.league.name}
                </Typography.Heading>
                <Typography.Paragraph className="mt-2">
                  <span
                    className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${statusClassName(data.league.status)}`}
                  >
                    {data.league.status}
                  </span>
                </Typography.Paragraph>
              </DashboardCard>
              <DashboardCard>
                <Typography.Small className="text-primary-300 uppercase tracking-wide">
                  Start
                </Typography.Small>
                <Typography.Paragraph className="text-primary-100 mt-2">
                  {formatDateTime(data.league.startAt, { fallback: "-" })}
                </Typography.Paragraph>
              </DashboardCard>
              <DashboardCard>
                <Typography.Small className="text-primary-300 uppercase tracking-wide">
                  End
                </Typography.Small>
                <Typography.Paragraph className="text-primary-100 mt-2">
                  {formatDateTime(data.league.endAt, { fallback: "-" })}
                </Typography.Paragraph>
              </DashboardCard>
              <DashboardCard>
                <Typography.Small className="text-primary-300 uppercase tracking-wide">
                  Teams / Matches
                </Typography.Small>
                <Typography.Heading level={5} className="text-primary-100 mt-2">
                  {data.summary.totalTeams} / {data.summary.totalMatches}
                </Typography.Heading>
              </DashboardCard>
            </div>
          </DashboardSection>

          <DashboardSection title="Standings">
            <DashboardCard>
              <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-12">
                <div className="md:col-span-11">
                  <Form.Text
                    name="standingsSearch"
                    label="Search Team"
                    value={standingsSearchInput}
                    onChange={(event) => setStandingsSearchInput(event.target.value)}
                    placeholder="Team name or team code..."
                    fullWidth
                  />
                </div>
                <div className="md:col-span-1 flex items-end">
                  <Button.Secondary
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setStandingsPage(1);
                      setStandingsQuery(standingsSearchInput.trim());
                    }}
                  >
                    Apply
                  </Button.Secondary>
                </div>
              </div>

              {filteredStandings.length === 0 ? (
                <Typography.Paragraph className="text-primary-300">
                  No teams joined this league yet.
                </Typography.Paragraph>
              ) : (
                <>
                  <DataTable
                    columns={standingsColumns}
                    rows={standingsRows}
                    rowKey={(row) => row.teamId}
                    className="w-full!"
                  />
                  <div className="mt-6">
                    <Pagination
                      currentPage={standingsCurrentPage}
                      totalPages={standingsTotalPages}
                      totalItems={filteredStandings.length}
                      itemsPerPage={DETAIL_ITEMS_PER_PAGE}
                      onPageChange={setStandingsPage}
                    />
                  </div>
                </>
              )}
            </DashboardCard>
          </DashboardSection>

          <DashboardSection title="Schedule & Results">
            <DashboardCard>
              <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-12">
                <div className="md:col-span-8">
                  <Form.Text
                    name="scheduleSearch"
                    label="Search Match"
                    value={scheduleSearchInput}
                    onChange={(event) => setScheduleSearchInput(event.target.value)}
                    placeholder="Team, code, stage, zone..."
                    fullWidth
                  />
                </div>
                <div className="md:col-span-3">
                  <Form.Select
                    name="scheduleStatus"
                    label="Match Status"
                    value={scheduleStatusFilter}
                    onChange={(value) => setScheduleStatusFilter(value)}
                    options={matchStatusOptions}
                    fullWidth
                  />
                </div>
                <div className="md:col-span-1 flex items-end">
                  <Button.Secondary
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSchedulePage(1);
                      setScheduleQuery(scheduleSearchInput.trim());
                    }}
                  >
                    Apply
                  </Button.Secondary>
                </div>
              </div>

              {filteredMatches.length === 0 ? (
                <Typography.Paragraph className="text-primary-300">
                  No matches created for this league yet.
                </Typography.Paragraph>
              ) : (
                <>
                  <DataTable
                    columns={scheduleColumns}
                    rows={scheduleRows}
                    rowKey={(row) => row.matchId}
                    className="w-full!"
                  />
                  <div className="mt-6">
                    <Pagination
                      currentPage={scheduleCurrentPage}
                      totalPages={scheduleTotalPages}
                      totalItems={filteredMatches.length}
                      itemsPerPage={DETAIL_ITEMS_PER_PAGE}
                      onPageChange={setSchedulePage}
                    />
                  </div>
                </>
              )}
            </DashboardCard>
          </DashboardSection>
        </>
      ) : null}
    </div>
  );
}
