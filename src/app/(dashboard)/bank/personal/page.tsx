"use client";

import { format } from "date-fns";
import { DollarSign } from "lucide-react";
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
import type { BankTransaction, PersonalBankResponse } from "@/types/api/Bank";

const DEFAULT_PAGE = 1;
const ITEMS_PER_PAGE = 10;

const formatUnixDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return format(date, "PPpp");
};

const formatAmount = (amount: number, transType: "deposit" | "withdraw") => {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  return transType === "deposit" ? `+$${formatted}` : `-$${formatted}`;
};

const formatBalance = (balance: number) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(balance);
};

const getAmountClassName = (transType: "deposit" | "withdraw") => {
  return transType === "deposit"
    ? "text-green-400"
    : "text-tertiary-red";
};

const columns: Array<DataTableColumn<BankTransaction>> = [
  {
    key: "time",
    header: "Date",
    headerClassName: "py-4!",
    cellClassName: "py-4!",
    render: (transaction) => (
      <Typography.Paragraph as="p" className="text-primary-200">
        {formatUnixDate(transaction.time)}
      </Typography.Paragraph>
    ),
  },
  {
    key: "title",
    header: "Description",
    headerClassName: "py-4!",
    cellClassName: "py-4!",
    render: (transaction) => (
      <div className="flex flex-col gap-1">
        <Typography.Paragraph
          as="p"
          className="font-semibold text-primary-100"
        >
          {transaction.title || "-"}
        </Typography.Paragraph>
        {transaction.message && transaction.message !== transaction.title && (
          <Typography.Small as="p" className="text-primary-300">
            {transaction.message}
          </Typography.Small>
        )}
      </div>
    ),
  },
  {
    key: "trans_type",
    header: "Type",
    headerClassName: "py-4!",
    cellClassName: "py-4!",
    render: (transaction) => (
      <Typography.Paragraph
        as="p"
        className={`capitalize ${getAmountClassName(transaction.trans_type)}`}
      >
        {transaction.trans_type}
      </Typography.Paragraph>
    ),
  },
  {
    key: "amount",
    header: "Amount",
    headerClassName: "py-4!",
    cellClassName: "py-4!",
    align: "right",
    render: (transaction) => (
      <Typography.Paragraph
        as="p"
        className={`font-semibold ${getAmountClassName(transaction.trans_type)}`}
      >
        {formatAmount(transaction.amount, transaction.trans_type)}
      </Typography.Paragraph>
    ),
  },
];

export default function PersonalBankPage() {
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);

  const { data, error, isLoading } = useApiSWR<PersonalBankResponse>(
    `/api/user/bank/personal?page=${currentPage}&limit=${ITEMS_PER_PAGE}`,
  );

  const hasNoRecords =
    !isLoading && !error && data && data.transactions.length === 0 && !data.message;

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
          Personal Bank
        </Typography.Heading>
        <Typography.Paragraph className="text-primary-300 text-sm mt-1">
          Your personal bank transaction history.
        </Typography.Paragraph>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DashboardCard>
          <div className="flex flex-col gap-2">
            <Typography.Paragraph className="text-primary-300 shrink-0">
              Cash Balance:
            </Typography.Paragraph>
            <Typography.Heading
              type="display"
              level={4}
              className="text-primary-100 flex items-center gap-2"
            >
              <DollarSign className="text-primary-300" />
              {data && !data.message ? (
                formatBalance(data.cashBalance)
              ) : (
                <span className="block w-62.5 h-9.25 animate-pulse rounded bg-primary-700/60" />
              )}
            </Typography.Heading>
          </div>
        </DashboardCard>
        <DashboardCard>
          <div className="flex flex-col gap-2">
            <Typography.Paragraph className="text-primary-300 shrink-0">
              Bank Account Balance:
            </Typography.Paragraph>
            <Typography.Heading
              type="display"
              level={4}
              className="text-primary-100 flex items-center gap-2"
            >
              <DollarSign className="text-primary-300" />
              {data && !data.message ? (
                formatBalance(data.bankBalance)
              ) : (
                <span className="block w-62.5 h-9.25 animate-pulse rounded bg-primary-700/60" />
              )}
            </Typography.Heading>
          </div>
        </DashboardCard>
      </div>

      <DashboardSection title="Transaction History">
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
              No transactions found.
            </Typography.Paragraph>
          )}

          {!isLoading && !error && data && data.transactions.length > 0 && (
            <>
              <DataTable
                key={currentPage}
                columns={columns}
                rows={data.transactions}
                rowKey={() => Math.random().toString(36).substring(2)}
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
