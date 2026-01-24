"use client";

import { setupListeners } from "@reduxjs/toolkit/query";
import { type ReactNode, useEffect, useState } from "react";
import { Provider as ReduxProvider } from "react-redux";
import type { Persistor } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";

import type { AppStore } from "@/store";
import { makeStore } from "@/store/store";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [{ store, persistor }] = useState<{
    store: AppStore;
    persistor: Persistor;
  }>(() => makeStore());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
  }, []);

  useEffect(() => {
    setupListeners(store.dispatch);
  }, [store]);

  // During SSR, render without PersistGate
  if (!isClient) {
    return <ReduxProvider store={store}>{children}</ReduxProvider>;
  }

  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </ReduxProvider>
  );
}
