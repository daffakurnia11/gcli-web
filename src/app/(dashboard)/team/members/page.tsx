"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  DashboardCard,
  DashboardSection,
} from "@/app/(dashboard)/_components/dashboard";
import { Modal } from "@/components";
import {
  DataTable,
  type DataTableColumn,
  DataTableSkeleton,
} from "@/components/table";
import { Typography } from "@/components/typography";
import { useTeamMembersApi } from "@/services/hooks/api/useTeamMembersApi";
import { useApiSWR } from "@/services/swr";

export default function TeamMembersPage() {
  const {
    updateMemberGrade: updateMemberGradeRequest,
    removeMember,
    recruitMember,
  } =
    useTeamMembersApi();
  const { data, error, isLoading, mutate } =
    useApiSWR<TeamMembersResponse>("/api/user/gang/members");
  const [actionError, setActionError] = useState<string | null>(null);
  const [loadingByMember, setLoadingByMember] = useState<Record<string, boolean>>(
    {},
  );
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [modalAction, setModalAction] = useState<"update-grade" | "fire">(
    "update-grade",
  );
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<number>(0);
  const [isRecruitModalOpen, setIsRecruitModalOpen] = useState(false);
  const [recruitCitizenId, setRecruitCitizenId] = useState("");
  const [isRecruiting, setIsRecruiting] = useState(false);

  const updateMemberGrade = useCallback(
    async (member: TeamMember, nextGrade: number) => {
      if (nextGrade === member.gradeLevel) {
        return false;
      }

      setActionError(null);
      setLoadingByMember((prev) => ({ ...prev, [member.citizenId]: true }));
      try {
        await updateMemberGradeRequest(member.citizenId, nextGrade);

        await mutate();
        return true;
      } catch (e) {
        setActionError(
          e instanceof Error ? e.message : "Failed to update member grade.",
        );
        return false;
      } finally {
        setLoadingByMember((prev) => ({ ...prev, [member.citizenId]: false }));
      }
    },
    [mutate, updateMemberGradeRequest],
  );

  const fireMember = useCallback(
    async (member: TeamMember) => {
      setActionError(null);
      setLoadingByMember((prev) => ({ ...prev, [member.citizenId]: true }));
      try {
        await removeMember(member.citizenId);

        await mutate();
        return true;
      } catch (e) {
        setActionError(e instanceof Error ? e.message : "Failed to remove member.");
        return false;
      } finally {
        setLoadingByMember((prev) => ({ ...prev, [member.citizenId]: false }));
      }
    },
    [mutate, removeMember],
  );

  const manageGradeOptions = useMemo(() => {
    if (!data?.currentMember || !selectedMember) {
      return [];
    }

    return data.grades.filter(
      (grade) =>
        grade.level < data.currentMember!.gradeLevel &&
        grade.level !== selectedMember.gradeLevel,
    );
  }, [data?.currentMember, data?.grades, selectedMember]);

  const openActionModal = (member: TeamMember) => {
    setSelectedMember(member);
    setModalAction("update-grade");
    setSelectedGradeLevel(member.gradeLevel);
  };

  useEffect(() => {
    if (!selectedMember) {
      return;
    }
    setSelectedGradeLevel(selectedMember.gradeLevel);
  }, [selectedMember]);

  const closeModal = () => {
    setSelectedMember(null);
    setActionError(null);
  };

  const openRecruitModal = () => {
    setIsRecruitModalOpen(true);
    setRecruitCitizenId("");
    setActionError(null);
  };

  const closeRecruitModal = useCallback(() => {
    setIsRecruitModalOpen(false);
    setRecruitCitizenId("");
    setActionError(null);
  }, []);

  const submitRecruitMember = useCallback(async () => {
    const citizenId = recruitCitizenId.trim();
    if (!citizenId) {
      setActionError("Citizen ID is required.");
      return;
    }

    setActionError(null);
    setIsRecruiting(true);
    try {
      await recruitMember(citizenId);
      await mutate();
      closeRecruitModal();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to recruit member.");
    } finally {
      setIsRecruiting(false);
    }
  }, [closeRecruitModal, mutate, recruitCitizenId, recruitMember]);

  const submitModalAction = async () => {
    if (!selectedMember) {
      return;
    }

    if (modalAction === "update-grade") {
      const success = await updateMemberGrade(selectedMember, selectedGradeLevel);
      if (success) {
        closeModal();
      }
      return;
    }

    const success = await fireMember(selectedMember);
    if (success) {
      closeModal();
    }
  };

  const memberColumns: Array<DataTableColumn<TeamMember>> = useMemo(
    () => [
      {
        key: "character",
        header: "Member",
        render: (member) => (
          <div className="flex flex-col gap-1">
            <Typography.Paragraph as="p" className="text-primary-100 font-semibold">
              {member.characterName}
            </Typography.Paragraph>
            <Typography.Small as="p" className="text-primary-300">
              {member.playerName ?? "Unknown player"}
            </Typography.Small>
          </div>
        ),
      },
      {
        key: "citizenId",
        header: "Citizen ID",
        render: (member) => (
          <Typography.Paragraph as="p" className="text-primary-200 font-mono">
            {member.citizenId}
          </Typography.Paragraph>
        ),
      },
      {
        key: "grade",
        header: "Grade",
        render: (member) => (
          <Typography.Paragraph as="p" className="text-primary-100">
            {member.gradeName} ({member.gradeLevel})
          </Typography.Paragraph>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (member) => (
          <span
            className={
              member.status === "online"
                ? "inline-flex rounded-full bg-green-500/20 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-green-300"
                : "inline-flex rounded-full bg-primary-700 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary-300"
            }
          >
            {member.status}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        render: (member) => {
          const isBusy = loadingByMember[member.citizenId] === true;
          const canManage = member.canManage;

          if (!canManage) {
            return (
              <Typography.Small as="p" className="text-primary-400">
                No access
              </Typography.Small>
            );
          }

          return (
            <button
              type="button"
              onClick={() => openActionModal(member)}
              disabled={isBusy}
              className="rounded border border-primary-600 px-3 py-1 text-xs text-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Action
            </button>
          );
        },
      },
    ],
    [loadingByMember],
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
          Team Members
        </Typography.Heading>
        <Typography.Paragraph className="text-primary-300 text-sm mt-1">
          {data?.team
            ? `${data.team.name} (${data.team.code.toUpperCase()}) member roster.`
            : "All members in your current team."}
        </Typography.Paragraph>
      </div>

      <DashboardSection
        title="Member List"
        actionButton={
          data?.currentMember?.isBoss ? (
            <button
              type="button"
              onClick={openRecruitModal}
              className="rounded border border-primary-600 px-3 py-1.5 text-sm text-primary-100"
            >
              Recruit Member
            </button>
          ) : null
        }
      >
        <DashboardCard>
          {actionError && (
            <Typography.Paragraph className="text-tertiary-red mb-4">
              {actionError}
            </Typography.Paragraph>
          )}

          {isLoading && (
            <DataTableSkeleton columns={memberColumns} rows={8} className="w-full!" />
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

          {!isLoading && !error && data && data.members.length === 0 && !data.message && (
            <Typography.Paragraph className="text-primary-300">
              No members found for this team.
            </Typography.Paragraph>
          )}

          {!isLoading && !error && data && data.members.length > 0 && (
            <DataTable
              columns={memberColumns}
              rows={data.members}
              rowKey={(member) => member.citizenId}
              className="w-full!"
            />
          )}
        </DashboardCard>
      </DashboardSection>

      <Modal.Global
        open={selectedMember !== null}
        title={
          selectedMember
            ? `Manage ${selectedMember.characterName}`
            : "Manage Member"
        }
        onClose={closeModal}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="rounded border border-primary-700 px-3 py-1.5 text-sm text-primary-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void submitModalAction()}
              disabled={
                selectedMember === null ||
                loadingByMember[selectedMember?.citizenId ?? ""] === true ||
                (modalAction === "update-grade" &&
                  selectedGradeLevel === selectedMember?.gradeLevel)
              }
              className="rounded border border-primary-600 px-3 py-1.5 text-sm text-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {modalAction === "update-grade" ? "Update Grade" : "Fire Member"}
            </button>
          </div>
        }
      >
        {selectedMember && (
          <div className="space-y-4">
            {actionError && (
              <Typography.Paragraph className="text-tertiary-red">
                {actionError}
              </Typography.Paragraph>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setModalAction("update-grade")}
                className={`rounded px-3 py-1.5 text-sm ${
                  modalAction === "update-grade"
                    ? "bg-primary-700 text-primary-100"
                    : "border border-primary-700 text-primary-300"
                }`}
              >
                Update Grade
              </button>
              <button
                type="button"
                onClick={() => setModalAction("fire")}
                className={`rounded px-3 py-1.5 text-sm ${
                  modalAction === "fire"
                    ? "bg-tertiary-red/20 text-tertiary-red border border-tertiary-red"
                    : "border border-primary-700 text-primary-300"
                }`}
              >
                Fire
              </button>
            </div>

            {modalAction === "update-grade" ? (
              <div className="space-y-2">
                <Typography.Paragraph className="text-primary-300 text-sm">
                  Select a new grade for{" "}
                  <span className="text-primary-100">
                    {selectedMember.characterName}
                  </span>
                  .
                </Typography.Paragraph>
                <select
                  className="w-full rounded border border-primary-700 bg-primary-800 px-3 py-2 text-sm text-primary-100"
                  value={selectedGradeLevel}
                  onChange={(event) => setSelectedGradeLevel(Number(event.target.value))}
                >
                  <option value={selectedMember.gradeLevel}>
                    Keep ({selectedMember.gradeName})
                  </option>
                  {manageGradeOptions.map((grade) => (
                    <option key={`modal-grade-${grade.level}`} value={grade.level}>
                      {grade.name} ({grade.level})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <Typography.Paragraph className="text-primary-300 text-sm">
                This will remove{" "}
                <span className="text-primary-100">{selectedMember.characterName}</span>{" "}
                from the team immediately.
              </Typography.Paragraph>
            )}
          </div>
        )}
      </Modal.Global>

      <Modal.Global
        open={isRecruitModalOpen}
        title="Recruit Member"
        onClose={closeRecruitModal}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeRecruitModal}
              disabled={isRecruiting}
              className="rounded border border-primary-700 px-3 py-1.5 text-sm text-primary-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void submitRecruitMember()}
              disabled={isRecruiting || recruitCitizenId.trim().length === 0}
              className="rounded border border-primary-600 px-3 py-1.5 text-sm text-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRecruiting ? "Recruiting..." : "Recruit"}
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          {actionError && (
            <Typography.Paragraph className="text-tertiary-red">
              {actionError}
            </Typography.Paragraph>
          )}
          <Typography.Paragraph className="text-primary-300 text-sm">
            Enter the player citizen ID to recruit into your team.
          </Typography.Paragraph>
          <input
            type="text"
            value={recruitCitizenId}
            onChange={(event) => setRecruitCitizenId(event.target.value)}
            placeholder="Citizen ID"
            className="w-full rounded border border-primary-700 bg-primary-800 px-3 py-2 text-sm text-primary-100"
          />
        </div>
      </Modal.Global>
    </div>
  );
}
