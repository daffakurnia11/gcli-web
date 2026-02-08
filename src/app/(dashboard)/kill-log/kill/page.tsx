"use client";

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
import { formatDateTime } from "@/services/date";
import { useApiSWR } from "@/services/swr";

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

const columns: Array<DataTableColumn<KillLogRecord>> = [
  {
    key: "time",
    header: "Time",
    headerClassName: "py-4!",
    cellClassName: "py-4!",
    render: (record) => (
      <Typography.Paragraph as="p" className="text-primary-200">
        {formatDateTime(record.createdAt, { fallback: "-" })}
      </Typography.Paragraph>
    ),
  },
  {
    key: "victim",
    header: "Victim",
    headerClassName: "py-4!",
    cellClassName: "py-4!",
    render: (record) => (
      <Typography.Paragraph as="p" className="font-semibold text-primary-100">
        {record.victimName || "-"}
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
    key: "victimCitizenId",
    header: "Victim Citizen ID",
    headerClassName: "py-4!",
    cellClassName: "py-4!",
    render: (record) => (
      <Typography.Paragraph as="p" className="text-primary-200">
        {record.victimCitizenId || "-"}
      </Typography.Paragraph>
    ),
  },
];

export default function KillLogKillPage() {
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);

  const { data, error, isLoading } = useApiSWR<KillLogResponse>(
    `/api/user/kill-logs?type=kill&page=${currentPage}&limit=${ITEMS_PER_PAGE}`,
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
          level={4}
          as="h2"
          type="display"
          className="uppercase tracking-wider text-primary-100"
        >
          Kill Log
        </Typography.Heading>
        <Typography.Paragraph className="text-primary-300 text-sm mt-1">
          Your recent kill records.
        </Typography.Paragraph>
      </div>

      <DashboardSection title="Kill Records">
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
              No kill records found.
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
