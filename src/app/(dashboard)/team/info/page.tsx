"use client";

import { DollarSign } from "lucide-react";

import {
  DashboardCard,
  DashboardSection,
} from "@/app/(dashboard)/_components/dashboard";
import { DataTable, type DataTableColumn } from "@/components/table";
import { Typography } from "@/components/typography";
import { useApiSWR } from "@/lib/swr";
import type { TeamGrade, TeamInfoResponse } from "@/types/api/Gang";

const gradeColumns: Array<DataTableColumn<TeamGrade>> = [
  {
    key: "level",
    header: "Level",
    render: (grade) => (
      <Typography.Paragraph as="p" className="text-primary-100">
        {grade.level}
      </Typography.Paragraph>
    ),
  },
  {
    key: "name",
    header: "Grade Name",
    render: (grade) => (
      <Typography.Paragraph as="p" className="text-primary-100">
        {grade.name}
      </Typography.Paragraph>
    ),
  },
  {
    key: "salary",
    header: "Salary",
    render: (grade) => (
      <Typography.Paragraph as="p" className="text-primary-100 flex items-center">
        <DollarSign size={14} className="inline text-primary-300 mr-1" />
        {grade.salary.toLocaleString()}
      </Typography.Paragraph>
    ),
  },
  {
    key: "totalMembers",
    header: "Total Members",
    render: (grade) => (
      <Typography.Paragraph as="p" className="text-primary-100">
        {grade.totalMembers}
      </Typography.Paragraph>
    ),
  },
];

export default function TeamPage() {
  const { data, error, isLoading } =
    useApiSWR<TeamInfoResponse>("/api/user/gang");

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
          Team Info
        </Typography.Heading>
        <Typography.Paragraph className="text-primary-300 text-sm mt-1">
          Team profile, code, rank structure, and permissions.
        </Typography.Paragraph>
      </div>

      {isLoading && (
        <DashboardCard>
          <div className="animate-pulse space-y-3">
            <div className="h-6 w-48 rounded bg-primary-700/60" />
            <div className="h-4 w-72 rounded bg-primary-700/50" />
            <div className="h-24 w-full rounded bg-primary-700/40" />
          </div>
        </DashboardCard>
      )}

      {error && (
        <DashboardCard>
          <Typography.Paragraph className="text-tertiary-red">
            {error.message}
          </Typography.Paragraph>
        </DashboardCard>
      )}

      {!isLoading && !error && data?.team && data.stats && (
        <>
          <DashboardSection title="Team Overview">
            <DashboardCard>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-primary-600 bg-primary-800 font-display text-xl tracking-widest text-primary-100">
                  {data.team.initials}
                </div>
                <div className="flex items-center gap-4">
                  <div className="space-y-1">
                    <Typography.Heading level={5} className="text-primary-100">
                      {data.team.name}
                    </Typography.Heading>
                    <Typography.Paragraph className="text-primary-300">
                      Team Code:{" "}
                      <span className="font-mono uppercase text-primary-100">
                        {data.team.code}
                      </span>
                    </Typography.Paragraph>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 text-sm flex flex-col">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-primary-300">Off-duty Pay:</span>
                    <span className="text-primary-100">
                      {data.team.offDutyPay ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-primary-300">Salary Range:</span>
                    <span className="text-primary-100 flex items-center">
                      <DollarSign
                        size={16}
                        className="text-primary-300 inline"
                      />
                      {data.stats.salaryRange.min.toLocaleString()}
                      <span className="mx-2">-</span>
                      <DollarSign
                        size={16}
                        className="text-primary-300 inline"
                      />
                      {data.stats.salaryRange.max.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-primary-300">Created:</span>
                    <span className="text-primary-100">
                      {formatDate(data.team.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-primary-300">Updated:</span>
                    <span className="text-primary-100">
                      {formatDate(data.team.updatedAt)}
                    </span>
                  </div>
                </div>
                <div className="space-y-4 text-sm flex flex-col">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-primary-300">Username:</span>
                    <span className="text-primary-100">
                      {data.currentMember?.username || "None"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-primary-300">In-game Character:</span>
                    <span className="text-primary-100 flex items-center">
                      {data.currentMember?.characterName || "None"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-primary-300">Citizen ID:</span>
                    <span className="text-primary-100">
                      {data.currentMember?.citizenId || "None"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-primary-300">Grade:</span>
                    <span className="text-primary-100">
                      {data.currentMember?.gradeName ||
                        (data.currentMember?.gradeLevel !== null &&
                        data.currentMember?.gradeLevel !== undefined
                          ? `Grade ${data.currentMember.gradeLevel}`
                          : "None")}
                    </span>
                  </div>
                </div>
              </div>
            </DashboardCard>
          </DashboardSection>

          <div className="grid gap-4 sm:grid-cols-2">
            <DashboardCard className="flex flex-col gap-2">
              <Typography.Paragraph className="text-primary-300 shrink-0">
                Members:
              </Typography.Paragraph>
              <Typography.Heading
                type="display"
                level={4}
                className="text-primary-100 flex items-center gap-2"
              >
                {data.stats.memberCount}
              </Typography.Heading>
            </DashboardCard>
            <DashboardCard className="flex flex-col gap-2">
              <Typography.Paragraph className="text-primary-300 shrink-0">
                Boss Slots:
              </Typography.Paragraph>
              <Typography.Heading
                type="display"
                level={4}
                className="text-primary-100 flex items-center gap-2"
              >
                {data.stats.bossCount}
              </Typography.Heading>
            </DashboardCard>
          </div>

          <DashboardSection title="Team Rank Structure">
            <DashboardCard>
              {data.grades.length === 0 ? (
                <Typography.Paragraph className="text-primary-300">
                  No ranks found for this team.
                </Typography.Paragraph>
              ) : (
                <DataTable
                  columns={gradeColumns}
                  rows={data.grades}
                  rowKey={(grade) => grade.id}
                  className="w-full!"
                />
              )}
            </DashboardCard>
          </DashboardSection>
        </>
      )}

      {!isLoading && !error && !data?.team && (
        <DashboardCard>
          <Typography.Paragraph className="text-primary-300">
            {data?.message ?? "No team information available."}
          </Typography.Paragraph>
        </DashboardCard>
      )}
    </div>
  );
}
