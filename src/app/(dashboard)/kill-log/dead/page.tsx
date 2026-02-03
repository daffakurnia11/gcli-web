"use client";

import { format } from "date-fns";
import { useState } from "react";

import {
  DashboardCard,
  DashboardSection,
} from "@/app/(dashboard)/_components/dashboard";
import { Pagination } from "@/components/table";
import {
  DataTable,
  type DataTableColumn,
  DataTableSkeleton,
} from "@/components/table/DataTable";
import { Typography } from "@/components/typography";
import { useApiSWR } from "@/lib/swr";

const DEFAULT_PAGE = 1;
const ITEMS_PER_PAGE = 10;

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
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
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
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);

  const { data, error, isLoading } = useApiSWR<KillLogResponse>(
    `/api/user/kill-logs?type=dead&page=${currentPage}&limit=${ITEMS_PER_PAGE}`,
  );

  const hasNoRecords =
    !isLoading && !error && data && data.records.length === 0 && !data.message;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
            <DataTableSkeleton columns={columns} rows={ITEMS_PER_PAGE} className="w-full!" />
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
            <>
              <DataTable
                key={currentPage}
                columns={columns}
                rows={data.records}
                rowKey={(record) => record.id}
                className="w-full!"
              />
              <div className="mt-6">
                <Pagination
                  currentPage={data.pagination.currentPage}
                  totalPages={data.pagination.totalPages}
                  totalItems={data.pagination.totalItems}
                  itemsPerPage={data.pagination.itemsPerPage}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}
        </DashboardCard>
      </DashboardSection>
    </div>
  );
}
