declare global {
  type UpdateTeamMemberGradePayload = {
    gradeLevel: number;
  };

  type CreateTeamPayload = {
    gangName: string;
    gangShortName: string;
  };

  type UpdateTeamNamePayload = {
    name: string;
  };
}

export {};
