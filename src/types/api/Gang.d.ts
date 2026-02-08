declare global {
  type TeamGrade = {
    id: number;
    level: number;
    name: string;
    salary: number;
    isBoss: boolean;
    bankAuth: boolean;
    totalMembers: number;
  };

  type TeamInfoResponse = {
    team: {
      code: string;
      name: string;
      initials: string;
      offDutyPay: boolean;
      createdAt: string;
      updatedAt: string;
    } | null;
    currentMember: {
      username: string | null;
      citizenId: string;
      playerName: string | null;
      characterName: string | null;
      gradeLevel: number | null;
      gradeName: string | null;
      isBoss: boolean;
      bankAuth: boolean;
    } | null;
    stats: {
      memberCount: number;
      rankCount: number;
      bossCount: number;
      salaryRange: {
        min: number;
        max: number;
      };
    } | null;
    grades: TeamGrade[];
    message?: string;
  };

  type TeamMember = {
    citizenId: string;
    playerName: string | null;
    characterName: string;
    gradeLevel: number;
    gradeName: string;
    status: "online" | "offline";
    canManage: boolean;
    lastUpdated: string | null;
    lastLoggedOut: string | null;
  };

  type TeamMembersResponse = {
    team: {
      code: string;
      name: string;
    } | null;
    currentMember: {
      citizenId: string;
      gradeLevel: number;
      isBoss: boolean;
    } | null;
    grades: Array<{
      level: number;
      name: string;
    }>;
    members: TeamMember[];
    message?: string;
  };
}

export {};
