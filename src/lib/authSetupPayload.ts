import type {
  AccountInfoFormData,
  PasswordFormData,
} from "@/schemas/authSetup";

const AUTH_SETUP_STORAGE_KEY = "auth_setup_payload";

export type AuthSetupPayload = {
  accountInfo?: AccountInfoFormData;
  credentials?: PasswordFormData;
  discord?: {
    id: string;
    username: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    connected: boolean;
  };
};

const isBrowser = () => typeof window !== "undefined";

export const readAuthSetupPayload = (): AuthSetupPayload => {
  if (!isBrowser()) {
    return {};
  }

  try {
    const raw = localStorage.getItem(AUTH_SETUP_STORAGE_KEY);
    if (!raw) {
      return {};
    }
    return JSON.parse(raw) as AuthSetupPayload;
  } catch {
    return {};
  }
};

export const writeAuthSetupPayload = (payload: AuthSetupPayload) => {
  if (!isBrowser()) {
    return;
  }

  try {
    localStorage.setItem(AUTH_SETUP_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage failures (private mode, quota, etc.)
  }
};

export const updateAuthSetupPayload = (partial: AuthSetupPayload) => {
  const current = readAuthSetupPayload() as AuthSetupPayload & {
    provinceName?: string;
    cityName?: string;
  };
  const { provinceName: _provinceName, cityName: _cityName, ...rest } = current;
  void _provinceName;
  void _cityName;
  writeAuthSetupPayload({ ...rest, ...partial });
};

export const clearAuthSetupPayload = () => {
  if (!isBrowser()) {
    return;
  }

  try {
    localStorage.removeItem(AUTH_SETUP_STORAGE_KEY);
  } catch {
    // Ignore storage failures (private mode, quota, etc.)
  }
};
