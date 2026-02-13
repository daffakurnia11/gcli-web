"use client";

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
import { useApiSWR } from "@/services/swr";

const numberFormatter = new Intl.NumberFormat("id-ID");
const DEFAULT_PAGE = 1;
const ITEMS_PER_PAGE = 10;
const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "scheduled", label: "Scheduled" },
  { value: "ongoing", label: "Ongoing" },
  { value: "finished", label: "Finished" },
  { value: "canceled", label: "Canceled" },
];

const statusClassName = (status: string) => {
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

export default function AdminLeagueSchedulePage() {
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const endpoint = `/api/admin/league/schedule?q=${encodeURIComponent(query)}&status=${encodeURIComponent(statusFilter === "all" ? "" : statusFilter)}&page=${currentPage}&limit=${ITEMS_PER_PAGE}`;
  const { data, error, isLoading } = useApiSWR<AdminLeagueScheduleResponse>(endpoint);

  const columns: Array<DataTableColumn<AdminLeagueMatchScheduleItem>> = useMemo(
    () => [
      {
        key: "league",
        header: "League",
        render: (row) => (
          <Typography.Paragraph className="text-primary-100 font-semibold">
            {row.leagueName}
          </Typography.Paragraph>
        ),
      },
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
        key: "time",
        header: "Schedule",
        render: (row) => (
          <Typography.Paragraph className="text-primary-100">
            {formatDateTime(row.scheduledAt, { fallback: "-" })}
          </Typography.Paragraph>
        ),
      },
      {
        key: "result",
        header: "Result",
        render: (row) => (
          <Typography.Paragraph className="text-primary-100 font-semibold">
            {row.result ? `${row.result.homeScore} - ${row.result.awayScore}` : "-"}
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
            className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${statusClassName(row.matchStatus)}`}
          >
            {row.matchStatus}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div>
        <Typography.Heading
          level={4}
          as="h2"
          type="display"
          className="uppercase tracking-wider text-primary-100"
        >
          League Schedule
        </Typography.Heading>
        <Typography.Paragraph className="text-primary-300 text-sm mt-1">
          Admin recap for all league matches, results, and roster players.
        </Typography.Paragraph>
      </div>

      <DashboardSection title="Summary">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <DashboardCard>
            <Typography.Small className="text-primary-300 uppercase tracking-wide">
              Total Matches
            </Typography.Small>
            <Typography.Heading level={5} className="text-primary-100 mt-2">
              {numberFormatter.format(data?.summary.totalMatches ?? 0)}
            </Typography.Heading>
          </DashboardCard>
          <DashboardCard>
            <Typography.Small className="text-primary-300 uppercase tracking-wide">
              Scheduled
            </Typography.Small>
            <Typography.Heading level={5} className="text-primary-100 mt-2">
              {numberFormatter.format(data?.summary.scheduled ?? 0)}
            </Typography.Heading>
          </DashboardCard>
          <DashboardCard>
            <Typography.Small className="text-primary-300 uppercase tracking-wide">
              Ongoing
            </Typography.Small>
            <Typography.Heading level={5} className="text-secondary-700 mt-2">
              {numberFormatter.format(data?.summary.ongoing ?? 0)}
            </Typography.Heading>
          </DashboardCard>
          <DashboardCard>
            <Typography.Small className="text-primary-300 uppercase tracking-wide">
              Finished
            </Typography.Small>
            <Typography.Heading level={5} className="text-green-300 mt-2">
              {numberFormatter.format(data?.summary.finished ?? 0)}
            </Typography.Heading>
          </DashboardCard>
          <DashboardCard>
            <Typography.Small className="text-primary-300 uppercase tracking-wide">
              Canceled
            </Typography.Small>
            <Typography.Heading level={5} className="text-tertiary-red mt-2">
              {numberFormatter.format(data?.summary.canceled ?? 0)}
            </Typography.Heading>
          </DashboardCard>
        </div>
      </DashboardSection>

      <DashboardSection title="Matches">
        <DashboardCard>
          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="md:col-span-8">
              <Form.Text
                name="search"
                label="Search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="League, team, code, stage, zone..."
                fullWidth
              />
            </div>
            <div className="md:col-span-3">
              <Form.Select
                name="status"
                label="Match Status"
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
                options={statusOptions}
                fullWidth
              />
            </div>
            <div className="md:col-span-1 flex items-end">
              <Button.Secondary
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setCurrentPage(1);
                  setQuery(searchInput.trim());
                }}
              >
                Apply
              </Button.Secondary>
            </div>
          </div>

          {isLoading ? (
            <Typography.Paragraph className="text-primary-300">
              Loading matches...
            </Typography.Paragraph>
          ) : null}
          {!isLoading && error ? (
            <Typography.Paragraph className="text-tertiary-red">
              {error.message}
            </Typography.Paragraph>
          ) : null}
          {!isLoading && !error && data && data.items.length === 0 ? (
            <Typography.Paragraph className="text-primary-300">
              No league matches found yet.
            </Typography.Paragraph>
          ) : null}
          {!isLoading && !error && data && data.items.length > 0 ? (
            <>
              <DataTable
                columns={columns}
                rows={data.items}
                rowKey={(row) => row.matchId}
                className="w-full!"
              />
              <div className="mt-6">
                <Pagination
                  currentPage={data.pagination.currentPage}
                  totalPages={data.pagination.totalPages}
                  totalItems={data.pagination.totalItems}
                  itemsPerPage={data.pagination.itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          ) : null}
        </DashboardCard>
      </DashboardSection>
    </div>
  );
}
