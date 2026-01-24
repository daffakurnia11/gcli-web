import { useDispatch, useSelector, useStore } from "react-redux";

import type { AppDispatch, AppStore, RootState } from "./store";

/**
 * Typed hooks for Redux
 *
 * Use these instead of plain `useDispatch`, `useSelector`, and `useStore`
 * to get proper TypeScript typing.
 */

// Use throughout your app instead of plain `useDispatch`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

// Use throughout your app instead of plain `useSelector`
export const useAppSelector = useSelector.withTypes<RootState>();

// Use throughout your app instead of plain `useStore`
export const useAppStore = useStore.withTypes<AppStore>();
