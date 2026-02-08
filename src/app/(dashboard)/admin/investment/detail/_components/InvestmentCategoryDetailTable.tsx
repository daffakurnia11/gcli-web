"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import {
  DashboardCard,
  DashboardSection,
} from "@/app/(dashboard)/_components/dashboard";
import { GlobalModal } from "@/components";
import { Button } from "@/components/button";
import { Form } from "@/components/form";
import { Pagination } from "@/components/table";
import {
  DataTable,
  type DataTableColumn,
  DataTableSkeleton,
} from "@/components/table/DataTable";
import { Typography } from "@/components/typography";
import { formatDateTime } from "@/services/date";
import { useAdminInvestmentApi } from "@/services/hooks/api/useAdminInvestmentApi";
import { useApiSWR } from "@/services/swr";

const ITEMS_PER_PAGE = 10;
const UNASSIGN_OPTION_VALUE = "__UNASSIGN__";

const formatCategoryLabel = (category: string) =>
  category
    .split("_")
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
    .join(" ");

const formatAmount = (value: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

export default function InvestmentCategoryDetailTable() {
  const { assignInvestment } = useAdminInvestmentApi();
  const searchParams = useSearchParams();
  const category = searchParams.get("category")?.trim() || "";
  const gang = searchParams.get("gang")?.trim() || "";
  const hasFilter = Boolean(category || gang);

  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AdminInvestmentDetailItem | null>(null);
  const [selectedGangCode, setSelectedGangCode] = useState("");
  const [actionError, setActionError] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  const detailEndpoint = hasFilter
    ? `/api/admin/investment/detail?${category ? `category=${encodeURIComponent(category)}` : `gang=${encodeURIComponent(gang)}`}&q=${encodeURIComponent(query)}&page=${currentPage}&limit=${ITEMS_PER_PAGE}`
    : null;

  const {
    data,
    error,
    isLoading,
    mutate: mutateDetail,
  } = useApiSWR<AdminInvestmentDetailResponse>(detailEndpoint);

  const { data: gangData, error: gangError, isLoading: isLoadingGangs } =
    useApiSWR<AdminGangsResponse>("/api/admin/gangs");

  const gangOptions = useMemo(
    () => [
      { value: UNASSIGN_OPTION_VALUE, label: "None (Unassign)" },
      ...(gangData?.gangs ?? []).map((gang) => ({
        value: gang.name,
        label: `${gang.label} (${gang.name})`,
      })),
    ],
    [gangData],
  );

  const openAssignModal = (item: AdminInvestmentDetailItem) => {
    setSelectedItem(item);
    setSelectedGangCode("");
    setActionError("");
    setIsModalOpen(true);
  };

  const closeAssignModal = () => {
    if (isAssigning) {
      return;
    }
    setIsModalOpen(false);
    setSelectedItem(null);
    setSelectedGangCode("");
    setActionError("");
  };

  const handleAssign = async () => {
    if (!selectedItem || !selectedGangCode) {
      setActionError("Please select a gang.");
      return;
    }

    setIsAssigning(true);
    setActionError("");

    try {
      await assignInvestment({
        bankAccountId: selectedItem.bankAccountId,
        gangCode:
          selectedGangCode === UNASSIGN_OPTION_VALUE ? "none" : selectedGangCode,
      });

      await mutateDetail();
      closeAssignModal();
    } catch (assignError) {
      setActionError(
        assignError instanceof Error ? assignError.message : "Failed to assign business",
      );
    } finally {
      setIsAssigning(false);
    }
  };

  const columns: Array<DataTableColumn<AdminInvestmentDetailItem>> = useMemo(
    () => [
      {
        key: "label",
        header: "Business",
        render: (row) => (
          <div className="flex flex-col gap-1">
            <Typography.Paragraph className="text-primary-100 font-semibold">
              {row.label}
            </Typography.Paragraph>
            <Typography.Small className="text-primary-300">
              {row.bankAccountId}
            </Typography.Small>
          </div>
        ),
      },
      {
        key: "balance",
        header: "Balance",
        align: "right",
        render: (row) => (
          <Typography.Paragraph className="text-primary-100 font-semibold">
            ${formatAmount(row.balance)}
          </Typography.Paragraph>
        ),
      },
      {
        key: "owner",
        header: "Owner",
        render: (row) => (
          <Typography.Paragraph className="text-primary-200">
            {row.owner || row.creator || "-"}
          </Typography.Paragraph>
        ),
      },
      {
        key: "map",
        header: "Map",
        render: (row) => (
          <Typography.Paragraph className="text-primary-200">
            {row.map || "-"}
          </Typography.Paragraph>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (row) => (
          <div className="flex flex-col gap-1">
            <Typography.Paragraph
              className={row.isOwned ? "text-green-400" : "text-primary-300"}
            >
              {row.isOwned ? "Owned" : "Available"}
            </Typography.Paragraph>
            <Typography.Small
              className={row.isFrozen === 1 ? "text-tertiary-red" : "text-primary-300"}
            >
              {row.isFrozen === 1 ? "Frozen" : "Active"}
            </Typography.Small>
          </div>
        ),
      },
      {
        key: "updatedAt",
        header: "Updated",
        render: (row) => (
          <Typography.Paragraph className="text-primary-200">
            {formatDateTime(row.updatedAt, { fallback: "-" })}
          </Typography.Paragraph>
        ),
      },
      {
        key: "actions",
        header: "Action",
        align: "center",
        render: (row) => (
          <Button.Secondary
            type="button"
            variant="outline"
            size="sm"
            onClick={() => openAssignModal(row)}
            className="text-xs"
          >
            Assign Gang
          </Button.Secondary>
        ),
      },
    ],
    [],
  );

  const title = category
    ? formatCategoryLabel(category)
    : gang
      ? `Gang ${gang}`
      : "Category Detail";
  const subtitle = category
    ? "Businesses under selected investment category."
    : gang
      ? "Businesses owned by selected gang."
      : "Businesses under selected investment filter.";
  const filterName = category ? "category" : "filter";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/investment"
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
            {title}
          </Typography.Heading>
          <Typography.Paragraph className="text-primary-300 text-sm mt-1">
            {subtitle}
          </Typography.Paragraph>
        </div>
      </div>

      <DashboardSection title="Business Details">
        <DashboardCard>
          {!hasFilter ? (
            <Typography.Paragraph className="text-primary-300">
              Missing category or gang query parameter.
            </Typography.Paragraph>
          ) : null}

          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  setCurrentPage(1);
                  setQuery(searchInput.trim());
                }
              }}
              placeholder="Search by business, account, owner, map..."
              className="w-full rounded-md border border-primary-700 bg-primary-800 px-3 py-2 text-primary-100 placeholder:text-primary-400 focus:border-secondary-700 focus:outline-none"
            />
            <Button.Secondary
              type="button"
              onClick={() => {
                setCurrentPage(1);
                setQuery(searchInput.trim());
              }}
              variant="outline"
              className="px-4 py-2"
            >
              Search
            </Button.Secondary>
          </div>

          {isLoading ? (
            <DataTableSkeleton columns={columns} rows={8} className="w-full!" />
          ) : null}

          {!isLoading && error ? (
            <Typography.Paragraph className="text-tertiary-red">
              {error.message}
            </Typography.Paragraph>
          ) : null}

          {!isLoading && !error && data && data.items.length === 0 ? (
            <Typography.Paragraph className="text-primary-300">
              No businesses found for this {filterName}.
            </Typography.Paragraph>
          ) : null}

          {!isLoading && !error && data && data.items.length > 0 ? (
            <>
              <div className="mb-4">
                <Typography.Paragraph className="text-primary-300">
                  Total businesses: {data.totalItems}
                </Typography.Paragraph>
              </div>
              <DataTable
                columns={columns}
                rows={data.items}
                rowKey={(row) => `${row.businessId}-${row.bankAccountId}`}
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
        open={isModalOpen}
        title="Assign Business"
        onClose={closeAssignModal}
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button.Secondary
              type="button"
              onClick={closeAssignModal}
              disabled={isAssigning}
              variant="outline"
              className="px-4 py-2"
            >
              Cancel
            </Button.Secondary>
            <Button.Primary
              type="button"
              onClick={handleAssign}
              disabled={isAssigning || !selectedGangCode}
              variant="outline"
              className="px-4 py-2"
            >
              {isAssigning ? "Assigning..." : "Assign"}
            </Button.Primary>
          </div>
        }
      >
        <div className="space-y-4">
          <Typography.Paragraph className="text-primary-200">
            {selectedItem
              ? `Assign ${selectedItem.label} (${selectedItem.bankAccountId}) to a gang.`
              : "Assign selected business to a gang."}
          </Typography.Paragraph>

          <Typography.Paragraph className="text-tertiary-red text-sm">
            {selectedGangCode === UNASSIGN_OPTION_VALUE
              ? "Choosing None will set creator and owner to null."
              : "Assigning to a gang will reset balance to 0 and transactions to an empty array."}
          </Typography.Paragraph>

          <Form.Select
            name="gangCode"
            label="Gang"
            placeholder={isLoadingGangs ? "Loading gangs..." : "Select gang"}
            options={gangOptions}
            value={selectedGangCode}
            onChange={(value) => setSelectedGangCode(value)}
            disabled={isLoadingGangs || Boolean(gangError)}
            error={gangError?.message}
            fullWidth
          />

          {actionError ? (
            <Typography.Paragraph className="text-tertiary-red text-sm">
              {actionError}
            </Typography.Paragraph>
          ) : null}
        </div>
      </GlobalModal>
    </div>
  );
}
