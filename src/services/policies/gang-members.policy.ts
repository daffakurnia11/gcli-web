export const canManageGangMembers = (actorIsBoss: boolean) => actorIsBoss;

export const canModifySelf = (actorCitizenId: string, targetCitizenId: string) =>
  actorCitizenId !== targetCitizenId;

export const canAssignGangGrade = (actorGradeLevel: number, targetGradeLevel: number) =>
  targetGradeLevel < actorGradeLevel;

export const canManageGangMemberByGrade = (
  actorGradeLevel: number,
  targetGradeLevel: number,
) => targetGradeLevel < actorGradeLevel;
