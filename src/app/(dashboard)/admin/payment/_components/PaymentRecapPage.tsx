"use client";

import { useMemo, useState } from "react";

import {
  DashboardCard,
  DashboardSection,
} from "@/app/(dashboard)/_components/dashboard";
import { GlobalModal } from "@/components";
import { Button } from "@/components/button";
import { Form } from "@/components/form";
import { Pagination } from "@/components/table";
import { DataTable, type DataTableColumn } from "@/components/table/DataTable";
import { Typography } from "@/components/typography";
import { formatDateTime } from "@/services/date";
import { useApiSWR } from "@/services/swr";

const DEFAULT_PAGE = 1;
const ITEMS_PER_PAGE = 10;

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "expired", label: "Expired" },
  { value: "canceled", label: "Canceled" },
  { value: "refunded", label: "Refunded" },
];

const amountFormatter = new Intl.NumberFormat("id-ID");

const formatAmount = (amount: number, currency: string) => {
  const normalizedCurrency = currency.trim().toUpperCase();
  const prefix = normalizedCurrency === "IDR" ? "Rp" : normalizedCurrency;
  return `${prefix} ${amountFormatter.format(amount)}`;
};

const statusClassName = (status: string) => {
  const normalized = status.trim().toLowerCase();

  if (normalized === "paid") {
    return "text-green-300 bg-green-500/15 border-green-500/40";
  }
  if (normalized === "pending") {
    return "text-secondary-700 bg-secondary-700/15 border-secondary-700/40";
  }
  if (normalized === "failed" || normalized === "canceled") {
    return "text-tertiary-red bg-tertiary-red/15 border-tertiary-red/40";
  }
  if (normalized === "expired") {
    return "text-amber-300 bg-amber-500/15 border-amber-500/40";
  }
  if (normalized === "refunded") {
    return "text-primary-200 bg-primary-700/30 border-primary-600";
  }

  return "text-primary-200 bg-primary-700/30 border-primary-600";
};

export default function PaymentRecapPage() {
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [purposeTypeFilterInput, setPurposeTypeFilterInput] = useState("");
  const [purposeTypeFilter, setPurposeTypeFilter] = useState("");
  const [providerFilterInput, setProviderFilterInput] = useState("");
  const [providerFilter, setProviderFilter] = useState("");
  const [selectedInvoiceNumber, setSelectedInvoiceNumber] = useState<
    string | null
  >(null);

  const endpoint = `/api/admin/payment?q=${encodeURIComponent(query)}&status=${encodeURIComponent(statusFilter === "all" ? "" : statusFilter)}&purposeType=${encodeURIComponent(purposeTypeFilter)}&provider=${encodeURIComponent(providerFilter)}&page=${currentPage}&limit=${ITEMS_PER_PAGE}`;

  const { data, error, isLoading } =
    useApiSWR<AdminPaymentRecapResponse>(endpoint);
  const detailEndpoint = selectedInvoiceNumber
    ? `/api/admin/payment/${encodeURIComponent(selectedInvoiceNumber)}`
    : null;
  const {
    data: detailData,
    error: detailError,
    isLoading: isLoadingDetail,
  } = useApiSWR<AdminPaymentDetailResponse>(detailEndpoint);

  const applyFilters = () => {
    setCurrentPage(1);
    setQuery(searchInput.trim());
    setPurposeTypeFilter(purposeTypeFilterInput.trim());
    setProviderFilter(providerFilterInput.trim());
  };

  const paymentColumns: Array<DataTableColumn<AdminPaymentRecapItem>> = useMemo(
    () => [
      {
        key: "invoice",
        header: "Invoice",
        render: (row) => (
          <div className="space-y-1">
            <Typography.Paragraph className="text-primary-100 font-semibold">
              {row.invoiceNumber}
            </Typography.Paragraph>
            <Typography.Small className="text-primary-300">
              {row.provider}
              {row.channel ? ` / ${row.channel}` : ""}
            </Typography.Small>
          </div>
        ),
      },
      {
        key: "purpose",
        header: "Purpose",
        render: (row) => (
          <div className="space-y-1">
            <Typography.Paragraph className="text-primary-100">
              {row.purposeType}
            </Typography.Paragraph>
            <Typography.Small className="text-primary-300">
              {row.purposeRef ?? "-"}
            </Typography.Small>
          </div>
        ),
      },
      {
        key: "amount",
        header: "Amount",
        render: (row) => (
          <Typography.Paragraph className="text-primary-100 font-semibold">
            {formatAmount(row.amount, row.currency)}
          </Typography.Paragraph>
        ),
      },
      {
        key: "payer",
        header: "Payer",
        render: (row) => (
          <div className="space-y-1">
            <Typography.Paragraph className="text-primary-100">
              {row.payerUsername}
            </Typography.Paragraph>
            <Typography.Small className="text-primary-300">
              Account: {row.payerAccountId ?? "-"}
            </Typography.Small>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (row) => (
          <span
            className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${statusClassName(row.status)}`}
          >
            {row.status}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Action",
        align: "center",
        render: (row) => (
          <button
            type="button"
            onClick={() => setSelectedInvoiceNumber(row.invoiceNumber)}
            className="rounded border border-primary-600 px-2 py-1 text-xs text-primary-100 hover:bg-primary-700/40 transition-colors"
          >
            View Detail
          </button>
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
          Payment Recap
        </Typography.Heading>
        <Typography.Paragraph className="text-primary-300 text-sm mt-1">
          Recap all transaction details across payment purposes.
        </Typography.Paragraph>
      </div>

      <DashboardSection title="Summary">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <DashboardCard>
            <Typography.Small className="text-primary-300 uppercase tracking-wide">
              Total Amount
            </Typography.Small>
            <Typography.Heading level={5} className="text-primary-100 mt-2">
              {formatAmount(data?.summary.totalAmount ?? 0, "IDR")}
            </Typography.Heading>
          </DashboardCard>

          <DashboardCard>
            <Typography.Small className="text-primary-300 uppercase tracking-wide">
              Paid Amount
            </Typography.Small>
            <Typography.Heading level={5} className="text-green-300 mt-2">
              {formatAmount(data?.summary.paidAmount ?? 0, "IDR")}
            </Typography.Heading>
          </DashboardCard>

          <DashboardCard>
            <Typography.Small className="text-primary-300 uppercase tracking-wide">
              Paid / Pending
            </Typography.Small>
            <Typography.Heading level={5} className="text-primary-100 mt-2">
              {(data?.summary.totalPaid ?? 0).toLocaleString("id-ID")} /{" "}
              {(data?.summary.totalPending ?? 0).toLocaleString("id-ID")}
            </Typography.Heading>
          </DashboardCard>

          <DashboardCard>
            <Typography.Small className="text-primary-300 uppercase tracking-wide">
              Failed / Expired / Canceled
            </Typography.Small>
            <Typography.Heading level={5} className="text-tertiary-red mt-2">
              {(data?.summary.totalFailed ?? 0).toLocaleString("id-ID")} /{" "}
              {(data?.summary.totalExpired ?? 0).toLocaleString("id-ID")} /{" "}
              {(data?.summary.totalCanceled ?? 0).toLocaleString("id-ID")}
            </Typography.Heading>
          </DashboardCard>
        </div>
      </DashboardSection>

      <DashboardSection title="Transactions">
        <DashboardCard>
          <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Form.Text
                name="search"
                label="Search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Invoice, purpose, status, provider..."
                fullWidth
              />
            </div>
            <div className="lg:col-span-2">
              <Form.Select
                name="status"
                label="Status"
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
                options={statusOptions}
                fullWidth
              />
            </div>
            <div className="lg:col-span-2">
              <Form.Text
                name="purposeType"
                label="Purpose Type"
                value={purposeTypeFilterInput}
                onChange={(event) =>
                  setPurposeTypeFilterInput(event.target.value)
                }
                placeholder="league_join"
                fullWidth
              />
            </div>
            <div className="lg:col-span-2">
              <Form.Text
                name="provider"
                label="Provider"
                value={providerFilterInput}
                onChange={(event) => setProviderFilterInput(event.target.value)}
                placeholder="doku"
                fullWidth
              />
            </div>
            <div className="lg:col-span-1 flex items-end">
              <Button.Secondary
                type="button"
                onClick={applyFilters}
                variant="outline"
                className="w-full"
              >
                Apply
              </Button.Secondary>
            </div>
          </div>

          {isLoading ? (
            <Typography.Paragraph className="text-primary-300">
              Loading transactions...
            </Typography.Paragraph>
          ) : null}

          {!isLoading && error ? (
            <Typography.Paragraph className="text-tertiary-red">
              {error.message}
            </Typography.Paragraph>
          ) : null}

          {!isLoading && !error && data && data.items.length === 0 ? (
            <Typography.Paragraph className="text-primary-300">
              No payment records found.
            </Typography.Paragraph>
          ) : null}

          {!isLoading && !error && data && data.items.length > 0 ? (
            <>
              <DataTable
                columns={paymentColumns}
                rows={data.items}
                rowKey={(row) => row.invoiceNumber}
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

      <GlobalModal
        open={selectedInvoiceNumber !== null}
        title={
          selectedInvoiceNumber
            ? `Payment Detail: ${selectedInvoiceNumber}`
            : "Payment Detail"
        }
        onClose={() => setSelectedInvoiceNumber(null)}
        size="2xl"
        footer={
          <div className="flex justify-end">
            <Button.Secondary
              type="button"
              variant="outline"
              onClick={() => setSelectedInvoiceNumber(null)}
            >
              Close
            </Button.Secondary>
          </div>
        }
      >
        {isLoadingDetail ? (
          <Typography.Paragraph className="text-primary-300">
            Loading payment details...
          </Typography.Paragraph>
        ) : null}

        {!isLoadingDetail && detailError ? (
          <Typography.Paragraph className="text-tertiary-red">
            {detailError.message}
          </Typography.Paragraph>
        ) : null}

        {!isLoadingDetail && !detailError && detailData ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Typography.Small className="text-primary-300 text-sm">
              Invoice:{" "}
              <span className="text-primary-100">
                {detailData.payment.invoiceNumber}
              </span>
            </Typography.Small>
            <Typography.Small className="text-primary-300 text-sm">
              Status:{" "}
              <span className="text-primary-100">
                {detailData.payment.status}
              </span>
            </Typography.Small>
            <Typography.Small className="text-primary-300 text-sm">
              Provider:{" "}
              <span className="text-primary-100">
                {detailData.payment.provider}
              </span>
            </Typography.Small>
            <Typography.Small className="text-primary-300 text-sm">
              Channel:{" "}
              <span className="text-primary-100">
                {detailData.payment.channel ?? "-"}
              </span>
            </Typography.Small>
            <Typography.Small className="text-primary-300 text-sm">
              Purpose:{" "}
              <span className="text-primary-100">
                {detailData.payment.purposeType}
              </span>
            </Typography.Small>
            <Typography.Small className="text-primary-300 text-sm">
              Purpose Ref:{" "}
              <span className="text-primary-100">
                {detailData.payment.purposeRef ?? "-"}
              </span>
            </Typography.Small>
            <Typography.Small className="text-primary-300 text-sm">
              Amount:{" "}
              <span className="text-primary-100">
                {formatAmount(
                  detailData.payment.amount,
                  detailData.payment.currency,
                )}
              </span>
            </Typography.Small>
            <Typography.Small className="text-primary-300 text-sm">
              Payer:{" "}
              <span className="text-primary-100">
                {detailData.payment.payerUsername} (ID:{" "}
                {detailData.payment.payerAccountId ?? "-"})
              </span>
            </Typography.Small>
            <Typography.Small className="text-primary-300 text-sm">
              Created At:{" "}
              <span className="text-primary-100">
                {formatDateTime(detailData.payment.createdAt, {
                  fallback: "-",
                })}
              </span>
            </Typography.Small>
            <Typography.Small className="text-primary-300 text-sm">
              Paid At:{" "}
              <span className="text-primary-100">
                {formatDateTime(detailData.payment.paidAt, { fallback: "-" })}
              </span>
            </Typography.Small>
            <Typography.Small className="text-primary-300 text-sm">
              Expired At:{" "}
              <span className="text-primary-100">
                {formatDateTime(detailData.payment.expiredAt, {
                  fallback: "-",
                })}
              </span>
            </Typography.Small>
            <Typography.Small className="text-primary-300 text-sm">
              Updated At:{" "}
              <span className="text-primary-100">
                {formatDateTime(detailData.payment.updatedAt, {
                  fallback: "-",
                })}
              </span>
            </Typography.Small>
          </div>
        ) : null}
      </GlobalModal>
    </div>
  );
}
