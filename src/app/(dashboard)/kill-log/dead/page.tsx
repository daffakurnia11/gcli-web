"use client";

import { format } from "date-fns";

import {
  DashboardCard,
  DashboardSection,
} from "@/app/(dashboard)/_components/dashboard";
import {
  DataTable,
  DataTableSkeleton,
  type DataTableColumn,
} from "@/components/table/DataTable";
import { Typography } from "@/components/typography";
import { useApiSWR } from "@/lib/swr";

type KillLogRecord = {
  id: number;
  killerCitizenId: string | null;
  killerName: string | null;
  victimCitizenId: string | null;
  victimName: string | null;
  weapon: string | null;
  createdAt: string | Date;
};

type KillLogResponse = {
  type: "kill" | "dead";
  citizenId: string | null;
  playerName: string | null;
  message?: string;
  records: KillLogRecord[];
};

const formatDate = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return format(date, "PPpp");
};

const columns: Array<DataTableColumn<KillLogRecord>> = [
  {
    key: "time",
    header: "Time",
    headerClassName: "py-4!",
    cellClassName: "py-4!",
    render: (record) => (
      <Typography.Paragraph as="p" className="text-primary-200">
        {formatDate(record.createdAt)}
      </Typography.Paragraph>
    ),
  },
  {
    key: "killer",
    header: "Killer",
    headerClassName: "py-4!",
    cellClassName: "py-4!",
    render: (record) => (
      <Typography.Paragraph as="p" className="font-semibold text-primary-100">
        {record.killerName || "-"}
      </Typography.Paragraph>
    ),
  },
  {
    key: "weapon",
    header: "Weapon",
    headerClassName: "py-4!",
    cellClassName: "py-4!",
    render: (record) => (
      <Typography.Paragraph as="p" className="text-primary-100">
        {record.weapon || "-"}
      </Typography.Paragraph>
    ),
  },
  {
    key: "killerCitizenId",
    header: "Killer Citizen ID",
    headerClassName: "py-4!",
    cellClassName: "py-4!",
    render: (record) => (
      <Typography.Paragraph as="p" className="text-primary-200">
        {record.killerCitizenId || "-"}
      </Typography.Paragraph>
    ),
  },
];

export default function KillLogDeadPage() {
  const { data, error, isLoading } = useApiSWR<KillLogResponse>(
    "/api/user/kill-logs?type=dead",
  );

  const hasNoRecords =
    !isLoading && !error && data && data.records.length === 0 && !data.message;

  return (
    <div className="space-y-6">
      <div>
        <Typography.Heading
          level={6}
          as="h2"
          type="display"
          className="uppercase tracking-wider text-primary-100"
        >
          Death Log
        </Typography.Heading>
        <Typography.Paragraph className="text-primary-300 text-sm mt-1">
          Your recent death records.
        </Typography.Paragraph>
      </div>

      <DashboardSection title="Death Records">
        <DashboardCard>
          {isLoading && (
            <DataTableSkeleton columns={columns} rows={6} className="w-full!" />
          )}

          {error && (
            <Typography.Paragraph className="text-tertiary-red">
              {error.message}
            </Typography.Paragraph>
          )}

          {!isLoading && !error && data?.message && (
            <Typography.Paragraph className="text-primary-300">
              {data.message}
            </Typography.Paragraph>
          )}

          {hasNoRecords && (
            <Typography.Paragraph className="text-primary-300">
              No death records found.
            </Typography.Paragraph>
          )}

          {!isLoading && !error && data && data.records.length > 0 && (
            <DataTable
              columns={columns}
              rows={data.records}
              rowKey={(record) => record.id}
              className="w-full!"
            />
          )}
        </DashboardCard>
      </DashboardSection>
    </div>
  );
}
