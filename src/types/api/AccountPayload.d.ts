declare global {
  type AccountUniqueCheckType = "username" | "email" | "discord";

  type UpdateEmailPayload = {
    newEmail: string;
    password: string;
  };

  type UpdatePasswordPayload = {
    currentPassword: string;
    newPassword: string;
  };

  type UpdateProfilePayload = {
    realName?: string;
    fivemName?: string;
    gender?: "male" | "female" | null;
    birthDate?: string | null;
    provinceId?: string | null;
    provinceName?: string | null;
    cityId?: string | null;
    cityName?: string | null;
  };

  type ConnectDiscordPayload = {
    id?: string;
    username?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export {};
