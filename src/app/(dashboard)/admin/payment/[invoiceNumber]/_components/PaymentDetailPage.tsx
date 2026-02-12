"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import {
  DashboardCard,
  DashboardSection,
} from "@/app/(dashboard)/_components/dashboard";
import { Typography } from "@/components/typography";
import { formatDateTime } from "@/services/date";
import { useApiSWR } from "@/services/swr";

type PaymentDetailPageProps = {
  invoiceNumber: string;
};

const amountFormatter = new Intl.NumberFormat("id-ID");

const formatAmount = (amount: number, currency: string) => {
  const normalizedCurrency = currency.trim().toUpperCase();
  const prefix = normalizedCurrency === "IDR" ? "Rp" : normalizedCurrency;
  return `${prefix} ${amountFormatter.format(amount)}`;
};

export default function PaymentDetailPage({ invoiceNumber }: PaymentDetailPageProps) {
  const endpoint = `/api/admin/payment/${encodeURIComponent(invoiceNumber)}`;

  const { data, error, isLoading } = useApiSWR<AdminPaymentDetailResponse>(endpoint);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/payment"
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
            Payment Detail
          </Typography.Heading>
          <Typography.Paragraph className="text-primary-300 text-sm mt-1">
            Invoice: {invoiceNumber}
          </Typography.Paragraph>
        </div>
      </div>

      <DashboardSection title="Transaction Information">
        <DashboardCard>
          {isLoading ? (
            <Typography.Paragraph className="text-primary-300">
              Loading payment details...
            </Typography.Paragraph>
          ) : null}

          {!isLoading && error ? (
            <Typography.Paragraph className="text-tertiary-red">
              {error.message}
            </Typography.Paragraph>
          ) : null}

          {!isLoading && !error && data ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Typography.Small className="text-primary-300 text-sm">
                Invoice: <span className="text-primary-100">{data.payment.invoiceNumber}</span>
              </Typography.Small>
              <Typography.Small className="text-primary-300 text-sm">
                Status: <span className="text-primary-100">{data.payment.status}</span>
              </Typography.Small>
              <Typography.Small className="text-primary-300 text-sm">
                Provider: <span className="text-primary-100">{data.payment.provider}</span>
              </Typography.Small>
              <Typography.Small className="text-primary-300 text-sm">
                Channel: <span className="text-primary-100">{data.payment.channel ?? "-"}</span>
              </Typography.Small>
              <Typography.Small className="text-primary-300 text-sm">
                Purpose: <span className="text-primary-100">{data.payment.purposeType}</span>
              </Typography.Small>
              <Typography.Small className="text-primary-300 text-sm">
                Purpose Ref: <span className="text-primary-100">{data.payment.purposeRef ?? "-"}</span>
              </Typography.Small>
              <Typography.Small className="text-primary-300 text-sm">
                Amount: <span className="text-primary-100">{formatAmount(data.payment.amount, data.payment.currency)}</span>
              </Typography.Small>
              <Typography.Small className="text-primary-300 text-sm">
                Payer: <span className="text-primary-100">{data.payment.payerUsername} (ID: {data.payment.payerAccountId ?? "-"})</span>
              </Typography.Small>
              <Typography.Small className="text-primary-300 text-sm">
                Created At: <span className="text-primary-100">{formatDateTime(data.payment.createdAt, { fallback: "-" })}</span>
              </Typography.Small>
              <Typography.Small className="text-primary-300 text-sm">
                Paid At: <span className="text-primary-100">{formatDateTime(data.payment.paidAt, { fallback: "-" })}</span>
              </Typography.Small>
              <Typography.Small className="text-primary-300 text-sm">
                Expired At: <span className="text-primary-100">{formatDateTime(data.payment.expiredAt, { fallback: "-" })}</span>
              </Typography.Small>
              <Typography.Small className="text-primary-300 text-sm">
                Updated At: <span className="text-primary-100">{formatDateTime(data.payment.updatedAt, { fallback: "-" })}</span>
              </Typography.Small>
            </div>
          ) : null}
        </DashboardCard>
      </DashboardSection>
    </div>
  );
}
