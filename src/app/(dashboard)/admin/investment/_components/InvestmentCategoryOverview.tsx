"use client";

import { Building2, Layers } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import {
  DashboardCard,
  DashboardSection,
} from "@/app/(dashboard)/_components/dashboard";
import {
  DataTable,
  type DataTableColumn,
  DataTableSkeleton,
} from "@/components/table/DataTable";
import { Typography } from "@/components/typography";
import { useApiSWR } from "@/services/swr";

const numberFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export default function InvestmentCategoryOverview() {
  const { data, error, isLoading } =
    useApiSWR<AdminInvestmentCategoriesResponse>(
      "/api/admin/investment/categories",
    );
  const {
    data: gangOwnershipData,
    error: gangOwnershipError,
    isLoading: isLoadingGangOwnership,
  } = useApiSWR<AdminGangOwnershipResponse>("/api/admin/investment/gang-ownership");

  const gangColumns: Array<DataTableColumn<AdminGangOwnershipItem>> = useMemo(
    () => [
      {
        key: "gang",
        header: "Gang",
        render: (row) => (
          <Link
            href={`/admin/investment/detail?gang=${encodeURIComponent(row.gangCode)}`}
            className="text-primary-100 hover:text-secondary-700 transition-colors"
          >
            {row.gangLabel}
          </Link>
        ),
      },
      {
        key: "gangCode",
        header: "Gang Code",
        render: (row) => row.gangCode,
      },
      {
        key: "count",
        header: "Ownership",
        align: "right",
        render: (row) => (
          <Typography.Paragraph className="text-primary-100 font-semibold">
            {numberFormatter.format(row.ownershipCount)}
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
          Investment
        </Typography.Heading>
        <Typography.Paragraph className="text-primary-300 text-sm mt-1">
          Available investment categories and total businesses.
        </Typography.Paragraph>
      </div>

      <DashboardSection title="Category Overview">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((index) => (
              <DashboardCard key={index}>
                <div className="flex flex-col gap-2">
                  <span className="block w-32 h-6 animate-pulse rounded bg-primary-700/60" />
                  <span className="block w-20 h-8 animate-pulse rounded bg-primary-700/60" />
                </div>
              </DashboardCard>
            ))}
          </div>
        ) : null}

        {!isLoading && error ? (
          <Typography.Paragraph className="text-tertiary-red">
            {error.message}
          </Typography.Paragraph>
        ) : null}

        {!isLoading && !error && data ? (
          <div className="space-y-4">
            <DashboardCard>
              <div className="flex items-center gap-3">
                <Building2 className="text-primary-300" />
                <div>
                  <Typography.Paragraph className="text-primary-300 text-sm">
                    Total Businesses
                  </Typography.Paragraph>
                  <Typography.Heading level={4} type="display" className="text-primary-100">
                    {numberFormatter.format(data.totalBusinesses)}
                  </Typography.Heading>
                </div>
              </div>
            </DashboardCard>

            {data.categories.length === 0 ? (
              <Typography.Paragraph className="text-primary-300">
                No investment categories found.
              </Typography.Paragraph>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.categories.map((category) => (
                  <Link
                    key={category.key}
                    href={`/admin/investment/detail?category=${encodeURIComponent(category.key)}`}
                    className="block"
                  >
                    <DashboardCard className="h-full hover:border-secondary-700/50 transition-colors">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <Typography.Paragraph className="text-primary-100">
                            {category.label}
                          </Typography.Paragraph>
                          <Typography.Paragraph className="text-primary-300 text-sm">
                            Key: {category.key}
                          </Typography.Paragraph>
                        </div>
                        <div className="flex items-center gap-2 text-primary-100">
                          <Layers size={18} className="text-primary-300" />
                          <Typography.Heading level={5} type="display">
                            {numberFormatter.format(category.count)}
                          </Typography.Heading>
                        </div>
                      </div>
                    </DashboardCard>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </DashboardSection>

      <DashboardSection title="Gang Ownership">
        <DashboardCard>
          {isLoadingGangOwnership ? (
            <DataTableSkeleton columns={gangColumns} rows={8} className="w-full!" />
          ) : null}

          {!isLoadingGangOwnership && gangOwnershipError ? (
            <Typography.Paragraph className="text-tertiary-red">
              {gangOwnershipError.message}
            </Typography.Paragraph>
          ) : null}

          {!isLoadingGangOwnership &&
          !gangOwnershipError &&
          gangOwnershipData &&
          gangOwnershipData.gangs.length === 0 ? (
            <Typography.Paragraph className="text-primary-300">
              No gangs found.
            </Typography.Paragraph>
          ) : null}

          {!isLoadingGangOwnership &&
          !gangOwnershipError &&
          gangOwnershipData &&
          gangOwnershipData.gangs.length > 0 ? (
            <DataTable
              columns={gangColumns}
              rows={gangOwnershipData.gangs}
              rowKey={(row) => row.gangCode}
              className="w-full!"
            />
          ) : null}
        </DashboardCard>
      </DashboardSection>
    </div>
  );
}
