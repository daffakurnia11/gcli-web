"use client";

import { DollarSign } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

import {
  DashboardCard,
  DashboardSection,
} from "@/app/(dashboard)/_components/dashboard";
import { Typography } from "@/components/typography";
import { useApiSWR } from "@/services/swr";

export default function InvestmentPage() {
  const { data: session } = useSession();
  const { data, error, isLoading } = useApiSWR<InvestmentsResponse>(
    "/api/user/bank/investments",
  );

  const gangLabel = session?.user?.gang?.label ?? "Gang";
  const hasNoInvestments =
    !isLoading &&
    !error &&
    data &&
    data.investments.length === 0 &&
    !data.message;

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(balance);
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
          Investment
        </Typography.Heading>
        <Typography.Paragraph className="text-primary-300 text-sm mt-1">
          {gangLabel} investment accounts.
        </Typography.Paragraph>
      </div>

      <DashboardSection title="Investment Lists">
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((index) => (
              <DashboardCard key={index}>
                <div className="flex flex-col gap-2">
                  <span className="block w-75 h-6 animate-pulse rounded bg-primary-700/60" />
                  <span className="block w-50 h-9.25 animate-pulse rounded bg-primary-700/60" />
                </div>
              </DashboardCard>
            ))}
          </div>
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

        {hasNoInvestments && (
          <Typography.Paragraph className="text-primary-300">
            No investment accounts found.
          </Typography.Paragraph>
        )}

        {!isLoading && !error && data && data.investments.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.investments.map((investment) => (
              <Link
                key={investment.id}
                href={`/bank/investment/${investment.id}`}
                className="block"
              >
                <DashboardCard className="h-full hover:border-secondary-700/50 transition-colors">
                  <div className="flex flex-col gap-2">
                    <Typography.Heading
                      type="heading"
                      level={6}
                      as="p"
                      className="text-primary-100"
                    >
                      {investment.label}
                    </Typography.Heading>
                    <div className="flex flex-col">
                      <Typography.Small className="text-primary-300 shrink-0">
                        Category: {investment.category ?? "Uncategorized"}
                      </Typography.Small>
                      <Typography.Small className="text-primary-300 shrink-0">
                        ID: {investment.id}
                      </Typography.Small>
                    </div>
                    <Typography.Heading
                      type="display"
                      level={4}
                      className="text-primary-100 flex items-center gap-2"
                    >
                      <DollarSign className="text-primary-300" />
                      {formatBalance(investment.amount)}
                    </Typography.Heading>
                  </div>
                </DashboardCard>
              </Link>
            ))}
          </div>
        )}
      </DashboardSection>
    </div>
  );
}
