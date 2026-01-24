import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { AccountInfoFormData, FormErrors, PasswordFormData } from "@/schemas/authSetup";
import type { AuthSetupState } from "@/types/store/AuthSetup";

export const authSetupInitialState: AuthSetupState = {
  accountInfo: {
    realName: "",
    fivemName: "",
    age: "",
    birthDate: "",
    province: "",
    city: "",
  },
  password: {
    email: "",
    password: "",
    confirmPassword: "",
  },
  provinceName: "",
  cityName: "",
  discordId: null,
  discordUsername: null,
  discordName: null,
  discordEmail: null,
  discordImage: null,
  steamId64: null,
  steamHex: null,
  steamUsername: null,
  steamImage: null,
  isConnectedToDiscord: false,
  isConnectedToSteam: false,
  accountInfoErrors: {},
  passwordErrors: {},
  isSubmitting: false,
  submissionError: "",
};

export const authSetupSlice = createSlice({
  name: "authSetup",
  initialState: authSetupInitialState,
  reducers: {
    // Account Info
    updateAccountInfoField: (
      state,
      action: PayloadAction<{ field: keyof AccountInfoFormData; value: string }>,
    ) => {
      const { field, value } = action.payload;
      state.accountInfo[field] = value;

      // Clear error for this field
      if (state.accountInfoErrors[field]) {
        delete state.accountInfoErrors[field];
      }

      // Clear city when province changes
      if (field === "province") {
        state.accountInfo.city = "";
        state.cityName = "";
      }
    },

    setAccountInfoErrors: (
      state,
      action: PayloadAction<FormErrors<AccountInfoFormData>>,
    ) => {
      state.accountInfoErrors = action.payload;
    },

    clearAccountInfoErrors: (state) => {
      state.accountInfoErrors = {};
    },

    setProvinceName: (state, action: PayloadAction<string>) => {
      state.provinceName = action.payload;
    },

    setCityName: (state, action: PayloadAction<string>) => {
      state.cityName = action.payload;
    },

    // Password
    updatePasswordField: (
      state,
      action: PayloadAction<{ field: keyof PasswordFormData; value: string }>,
    ) => {
      const { field, value } = action.payload;
      state.password[field] = value;

      // Clear error for this field
      if (state.passwordErrors[field]) {
        delete state.passwordErrors[field];
      }
    },

    setPasswordErrors: (
      state,
      action: PayloadAction<FormErrors<PasswordFormData>>,
    ) => {
      state.passwordErrors = action.payload;
    },

    clearPasswordErrors: (state) => {
      state.passwordErrors = {};
    },

    // Form submission
    setIsSubmitting: (state, action: PayloadAction<boolean>) => {
      state.isSubmitting = action.payload;
    },

    setSubmissionError: (state, action: PayloadAction<string>) => {
      state.submissionError = action.payload;
    },

    // Discord and Steam connection
    setDiscordConnection: (
      state,
      action: PayloadAction<{
        discordId: string;
        username: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
      }>,
    ) => {
      state.discordId = action.payload.discordId;
      state.discordUsername = action.payload.username;
      state.discordName = action.payload.name ?? null;
      state.discordEmail = action.payload.email ?? null;
      state.discordImage = action.payload.image ?? null;
      state.isConnectedToDiscord = true;
    },

    setSteamConnection: (
      state,
      action: PayloadAction<{
        steamId64?: string | null;
        steamHex: string;
        username?: string | null;
        image?: string | null;
      }>,
    ) => {
      state.steamId64 = action.payload.steamId64 ?? null;
      state.steamHex = action.payload.steamHex;
      state.steamUsername = action.payload.username || null;
      state.steamImage = action.payload.image ?? null;
      state.isConnectedToSteam = true;
    },

    disconnectDiscord: (state) => {
      state.discordId = null;
      state.discordUsername = null;
      state.discordName = null;
      state.discordEmail = null;
      state.discordImage = null;
      state.isConnectedToDiscord = false;
    },

    disconnectSteam: (state) => {
      state.steamId64 = null;
      state.steamHex = null;
      state.steamUsername = null;
      state.steamImage = null;
      state.isConnectedToSteam = false;
    },

    // Reset form
    resetAuthSetup: () => authSetupInitialState,
  },
});

export const {
  updateAccountInfoField,
  setAccountInfoErrors,
  clearAccountInfoErrors,
  setProvinceName,
  setCityName,
  updatePasswordField,
  setPasswordErrors,
  clearPasswordErrors,
  setIsSubmitting,
  setSubmissionError,
  setDiscordConnection,
  setSteamConnection,
  disconnectDiscord,
  disconnectSteam,
  resetAuthSetup,
} = authSetupSlice.actions;

export default authSetupSlice.reducer;
