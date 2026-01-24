import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { createTransform, persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

import type { AuthSetupState } from "@/types/store/AuthSetup";

import authSetupReducer, { authSetupInitialState } from "./slices/authSetupSlice";

/**
 * Redux Persist Configuration
 */
const authSetupTransform = createTransform<AuthSetupState, Partial<AuthSetupState>>(
  (inboundState) => ({
    accountInfo: inboundState.accountInfo,
    provinceName: inboundState.provinceName,
    cityName: inboundState.cityName,
    discordId: inboundState.discordId,
    discordUsername: inboundState.discordUsername,
    discordName: inboundState.discordName,
    discordEmail: inboundState.discordEmail,
    discordImage: inboundState.discordImage,
    steamId64: inboundState.steamId64,
    steamHex: inboundState.steamHex,
    steamUsername: inboundState.steamUsername,
    steamImage: inboundState.steamImage,
    isConnectedToDiscord: inboundState.isConnectedToDiscord,
    isConnectedToSteam: inboundState.isConnectedToSteam,
  }),
  (outboundState) => ({
    ...authSetupInitialState,
    ...outboundState,
  }),
  { whitelist: ["authSetup"] },
);

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["authSetup"], // Only persist authSetup reducer
  transforms: [authSetupTransform],
  // Skip persist on server-side
  timeout: 0,
};

/**
 * Root Reducer
 */
const rootReducer = combineReducers({
  authSetup: authSetupReducer,
});

type RootReducerState = ReturnType<typeof rootReducer>;

const persistedReducer = persistReducer<RootReducerState>(persistConfig, rootReducer);

/**
 * Redux Store Configuration
 */
export const makeStore = () => {
  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore these action types for redux-persist
          ignoredActions: [
            "persist/PERSIST",
            "persist/REHYDRATE",
            "persist/REGISTER",
            "persist/PURGE",
            "persist/PAUSE",
            "persist/FLUSH",
          ],
          // Ignore these field paths for redux-persist
          ignoredPaths: ["_persist"],
        },
      }),
  });

  const persistor = persistStore(store);

  return { store, persistor };
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>["store"];
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
