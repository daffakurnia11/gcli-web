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
  { value: "upcoming", label: "Upcoming" },
  { value: "active", label: "Active" },
  { value: "finished", label: "Finished" },
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

export default function AdminLeagueStatusPage() {
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const endpoint = `/api/admin/league/status?q=${encodeURIComponent(query)}&status=${encodeURIComponent(statusFilter === "all" ? "" : statusFilter)}&page=${currentPage}&limit=${ITEMS_PER_PAGE}`;
  const { data, error, isLoading } = useApiSWR<AdminLeagueStatusResponse>(endpoint);

  const columns: Array<DataTableColumn<AdminLeagueTeamStatusItem>> = useMemo(
    () => [
      {
        key: "league",
        header: "League",
        render: (row) => (
          <div className="space-y-1">
            <Typography.Paragraph className="text-primary-100 font-semibold">
              {row.leagueName}
            </Typography.Paragraph>
            <Typography.Small className="text-primary-300">
              Joined: {formatDateTime(row.joinedAt, { fallback: "-" })}
            </Typography.Small>
          </div>
        ),
      },
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
        key: "leagueStatus",
        header: "League Status",
        render: (row) => (
          <span
            className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${statusClassName(row.leagueStatus)}`}
          >
            {row.leagueStatus}
          </span>
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
            {row.standing.goalsFor}-{row.standing.goalsAgainst} ({row.standing.goalDiff})
          </Typography.Paragraph>
        ),
      },
      {
        key: "points",
        header: "Points",
        align: "right",
        render: (row) => (
          <Typography.Paragraph className="text-secondary-700 font-semibold">
            {numberFormatter.format(row.standing.points)}
          </Typography.Paragraph>
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
          League Status
        </Typography.Heading>
        <Typography.Paragraph className="text-primary-300 text-sm mt-1">
          Admin recap of all team standings by league.
        </Typography.Paragraph>
      </div>

      <DashboardSection title="Summary">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <DashboardCard>
            <Typography.Small className="text-primary-300 uppercase tracking-wide">
              Total Leagues
            </Typography.Small>
            <Typography.Heading level={5} className="text-primary-100 mt-2">
              {numberFormatter.format(data?.summary.totalLeagues ?? 0)}
            </Typography.Heading>
          </DashboardCard>
          <DashboardCard>
            <Typography.Small className="text-primary-300 uppercase tracking-wide">
              Total Teams
            </Typography.Small>
            <Typography.Heading level={5} className="text-primary-100 mt-2">
              {numberFormatter.format(data?.summary.totalTeams ?? 0)}
            </Typography.Heading>
          </DashboardCard>
          <DashboardCard>
            <Typography.Small className="text-primary-300 uppercase tracking-wide">
              Active Teams
            </Typography.Small>
            <Typography.Heading level={5} className="text-green-300 mt-2">
              {numberFormatter.format(data?.summary.activeTeams ?? 0)}
            </Typography.Heading>
          </DashboardCard>
        </div>
      </DashboardSection>

      <DashboardSection title="Standings">
        <DashboardCard>
          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="md:col-span-8">
              <Form.Text
                name="search"
                label="Search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="League, team code, or team name..."
                fullWidth
              />
            </div>
            <div className="md:col-span-3">
              <Form.Select
                name="status"
                label="League Status"
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
              Loading standings...
            </Typography.Paragraph>
          ) : null}
          {!isLoading && error ? (
            <Typography.Paragraph className="text-tertiary-red">
              {error.message}
            </Typography.Paragraph>
          ) : null}
          {!isLoading && !error && data && data.items.length === 0 ? (
            <Typography.Paragraph className="text-primary-300">
              No team standings found yet.
            </Typography.Paragraph>
          ) : null}
          {!isLoading && !error && data && data.items.length > 0 ? (
            <>
              <DataTable
                columns={columns}
                rows={data.items}
                rowKey={(row) => `${row.leagueId}-${row.teamId}`}
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
