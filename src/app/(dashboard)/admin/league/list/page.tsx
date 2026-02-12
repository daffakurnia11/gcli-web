"use client";

import { useMemo, useState } from "react";

import {
  DashboardCard,
  DashboardSection,
} from "@/app/(dashboard)/_components/dashboard";
import { GlobalModal } from "@/components";
import { Button } from "@/components/button";
import { Pagination } from "@/components/table";
import { DataTable, type DataTableColumn } from "@/components/table/DataTable";
import { Typography } from "@/components/typography";
import { formatDateTime } from "@/services/date";
import { useAdminLeagueApi } from "@/services/hooks/api/useAdminLeagueApi";
import { useApiSWR } from "@/services/swr";

import { LeagueForm } from "./_components/LeagueForm";

const DEFAULT_PAGE = 1;
const ITEMS_PER_PAGE = 10;
const defaultLeagueForm: LeagueFormValues = {
  name: "",
  status: "upcoming",
  startAt: "",
  endAt: "",
  price: "0",
  maxTeam: "0",
  minPlayer: "0",
  rulesJson: "",
};

const numberFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const toDateTimeLocalValue = (value: string | null) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const localOffset = date.getTimezoneOffset() * 60_000;
  const localDate = new Date(date.getTime() - localOffset);
  return localDate.toISOString().slice(0, 16);
};

const getStatusClassName = (status: LeagueStatus) => {
  if (status === "active") {
    return "text-green-300 bg-green-500/15 border-green-500/40";
  }
  if (status === "finished") {
    return "text-primary-200 bg-primary-700/30 border-primary-600";
  }
  return "text-secondary-700 bg-secondary-700/15 border-secondary-700/40";
};

export default function LeagueListPage() {
  const { createLeague, updateLeague, deleteLeague } = useAdminLeagueApi();

  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLeague, setEditingLeague] = useState<AdminLeagueItem | null>(null);
  const [formValues, setFormValues] = useState<LeagueFormValues>(defaultLeagueForm);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingLeague, setDeletingLeague] = useState<AdminLeagueItem | null>(null);
  const [formActionError, setFormActionError] = useState("");
  const [tableActionError, setTableActionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const endpoint = `/api/admin/league?q=${encodeURIComponent(query)}&page=${currentPage}&limit=${ITEMS_PER_PAGE}`;

  const { data, error, isLoading, mutate } =
    useApiSWR<AdminLeagueListResponse>(endpoint);

  const openCreateForm = () => {
    setEditingLeague(null);
    setFormValues(defaultLeagueForm);
    setFormActionError("");
    setIsFormOpen(true);
  };

  const openEditForm = (league: AdminLeagueItem) => {
    setEditingLeague(league);
    setFormValues({
      name: league.name,
      status: league.status,
      startAt: toDateTimeLocalValue(league.startAt),
      endAt: toDateTimeLocalValue(league.endAt),
      price: String(league.price),
      maxTeam: String(league.maxTeam),
      minPlayer: String(league.minPlayer),
      rulesJson: league.rulesJson ? JSON.stringify(league.rulesJson) : "",
    });
    setFormActionError("");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (isSubmitting) {
      return;
    }

    setIsFormOpen(false);
    setEditingLeague(null);
    setFormActionError("");
    setFormValues(defaultLeagueForm);
  };

  const openDeleteModal = (league: AdminLeagueItem) => {
    setDeletingLeague(league);
    setTableActionError("");
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (isDeleting) {
      return;
    }
    setIsDeleteModalOpen(false);
    setDeletingLeague(null);
  };

  const confirmDelete = async () => {
    if (!deletingLeague) {
      return;
    }

    setIsDeleting(true);
    setTableActionError("");

    try {
      await deleteLeague(deletingLeague.id);
      await mutate();
      closeDeleteModal();
    } catch (requestError) {
      setTableActionError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to delete league.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmitForm = async (payload: AdminLeagueUpsertPayload) => {
    setIsSubmitting(true);
    setFormActionError("");

    try {
      if (editingLeague) {
        await updateLeague(editingLeague.id, payload);
      } else {
        await createLeague(payload);
      }

      await mutate();
      closeForm();
    } catch (requestError) {
      setFormActionError(
        requestError instanceof Error ? requestError.message : "Failed to save league.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Array<DataTableColumn<AdminLeagueItem>> = useMemo(
    () => [
      {
        key: "name",
        header: "League",
        render: (row) => (
          <div className="space-y-1">
            <Typography.Paragraph className="text-primary-100 font-semibold">
              {row.name}
            </Typography.Paragraph>
            <Typography.Small className="text-primary-300">ID: {row.id}</Typography.Small>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (row) => (
          <span
            className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${getStatusClassName(row.status)}`}
          >
            {row.status}
          </span>
        ),
      },
      {
        key: "startAt",
        header: "Start At",
        render: (row) => (
          <Typography.Small className="text-primary-300">
            {formatDateTime(row.startAt, { fallback: "-" })}
          </Typography.Small>
        ),
      },
      {
        key: "endAt",
        header: "End At",
        render: (row) => (
          <Typography.Small className="text-primary-300">
            {formatDateTime(row.endAt, { fallback: "-" })}
          </Typography.Small>
        ),
      },
      {
        key: "creator",
        header: "Creator",
        render: (row) => (
          <Typography.Paragraph className="text-primary-100">
            {row.creatorUsername}
          </Typography.Paragraph>
        ),
      },
      {
        key: "fee",
        header: "Fee",
        align: "right",
        render: (row) => (
          <Typography.Paragraph className="text-primary-100 font-semibold">
            ${numberFormatter.format(row.price)}
          </Typography.Paragraph>
        ),
      },
      {
        key: "maxTeam",
        header: "Max Teams",
        align: "right",
        render: (row) => (
          <Typography.Paragraph className="text-primary-100">
            {row.maxTeam === 0 ? "Unlimited" : numberFormatter.format(row.maxTeam)}
          </Typography.Paragraph>
        ),
      },
      {
        key: "teams",
        header: "Teams",
        align: "right",
        render: (row) => (
          <Typography.Paragraph className="text-primary-100">
            {numberFormatter.format(row.totalTeams)}
          </Typography.Paragraph>
        ),
      },
      {
        key: "matches",
        header: "Matches",
        align: "right",
        render: (row) => (
          <Typography.Paragraph className="text-primary-100">
            {numberFormatter.format(row.totalMatches)}
          </Typography.Paragraph>
        ),
      },
      {
        key: "actions",
        header: "Action",
        align: "center",
        render: (row) => (
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => openEditForm(row)}
              className="rounded border border-primary-600 px-2 py-1 text-xs text-primary-100 hover:bg-primary-700/40 transition-colors"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => openDeleteModal(row)}
              className="rounded border border-tertiary-red/60 px-2 py-1 text-xs text-tertiary-red hover:bg-tertiary-red/10 transition-colors"
            >
              Delete
            </button>
          </div>
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
          League List
        </Typography.Heading>
        <Typography.Paragraph className="text-primary-300 text-sm mt-1">
          Manage league seasons, participation, and match progression.
        </Typography.Paragraph>
      </div>

      <DashboardSection
        title="League Records"
        actionButton={
          <button
            type="button"
            onClick={openCreateForm}
            className="rounded border border-primary-600 px-3 py-1.5 text-sm text-primary-100"
          >
            Create New League
          </button>
        }
      >
        <DashboardCard>
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
              placeholder="Search by league name, creator, or status..."
              className="w-full rounded-md border border-primary-700 bg-primary-800 px-3 py-2 text-primary-100 placeholder:text-primary-400 focus:border-secondary-700 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                setCurrentPage(1);
                setQuery(searchInput.trim());
              }}
              className="rounded border border-primary-600 px-3 py-2 text-sm text-primary-100"
            >
              Search
            </button>
          </div>

          {tableActionError ? (
            <Typography.Paragraph className="mb-4 text-sm text-tertiary-red">
              {tableActionError}
            </Typography.Paragraph>
          ) : null}

          {isLoading ? (
            <Typography.Paragraph className="text-primary-300">
              Loading leagues...
            </Typography.Paragraph>
          ) : null}

          {!isLoading && error ? (
            <Typography.Paragraph className="text-tertiary-red">
              {error.message}
            </Typography.Paragraph>
          ) : null}

          {!isLoading && !error && data && data.items.length === 0 ? (
            <Typography.Paragraph className="text-primary-300">
              No leagues found.
            </Typography.Paragraph>
          ) : null}

          {!isLoading && !error && data && data.items.length > 0 ? (
            <>
              <DataTable
                columns={columns}
                rows={data.items}
                rowKey={(row) => row.id}
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
        open={isFormOpen}
        title={editingLeague ? "Edit League" : "Create League"}
        onClose={closeForm}
      >
        <LeagueForm
          key={editingLeague ? `edit-${editingLeague.id}` : "create"}
          mode={editingLeague ? "edit" : "create"}
          initialValues={formValues}
          isSubmitting={isSubmitting}
          actionError={formActionError}
          onCancel={closeForm}
          onSubmit={handleSubmitForm}
        />
      </GlobalModal>

      <GlobalModal
        open={isDeleteModalOpen}
        title="Delete League"
        onClose={closeDeleteModal}
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button.Secondary
              type="button"
              variant="outline"
              onClick={closeDeleteModal}
              disabled={isDeleting}
            >
              Cancel
            </Button.Secondary>
            <Button.Primary
              type="button"
              variant="outline"
              onClick={() => void confirmDelete()}
              disabled={isDeleting || !deletingLeague}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button.Primary>
          </div>
        }
      >
        <div className="space-y-3">
          <Typography.Paragraph className="text-primary-200">
            {deletingLeague
              ? `Delete league \"${deletingLeague.name}\"?`
              : "Delete selected league?"}
          </Typography.Paragraph>
          <Typography.Paragraph className="text-sm text-tertiary-red">
            This action cannot be undone and may remove related teams and matches.
          </Typography.Paragraph>
          {tableActionError ? (
            <Typography.Paragraph className="text-sm text-tertiary-red">
              {tableActionError}
            </Typography.Paragraph>
          ) : null}
        </div>
      </GlobalModal>
    </div>
  );
}
