import type {
  AccountInfoFormData,
  FormErrors,
  PasswordFormData,
} from "@/schemas/authSetup";

export interface AuthSetupState {
  accountInfo: {
    realName: string;
    fivemName: string;
    age: string;
    birthDate: string;
    province: string;
    city: string;
  };
  password: {
    email: string;
    password: string;
    confirmPassword: string;
  };
  provinceName: string;
  cityName: string;
  discordId: string | null;
  discordUsername: string | null;
  discordName: string | null;
  discordEmail: string | null;
  discordImage: string | null;
  steamId64: string | null;
  steamHex: string | null;
  steamUsername: string | null;
  steamImage: string | null;
  isConnectedToDiscord: boolean;
  isConnectedToSteam: boolean;
  accountInfoErrors: FormErrors<AccountInfoFormData>;
  passwordErrors: FormErrors<PasswordFormData>;
  isSubmitting: boolean;
  submissionError: string;
}
