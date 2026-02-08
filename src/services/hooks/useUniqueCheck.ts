"use client";

import { useEffect, useState } from "react";

import { useApiSWR } from "@/services/swr";

const useDebouncedValue = (value: string, delayMs: number) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
};

export function useUniqueCheck(
  type: AccountUniqueCheckType,
  value: string,
  validate?: (nextValue: string) => boolean,
) {
  const trimmed = value.trim();
  const debounced = useDebouncedValue(trimmed, 500);
  const isValid = validate ? validate(debounced) : Boolean(debounced);
  const key =
    debounced && isValid
      ? `/api/account/unique-check?type=${type}&value=${encodeURIComponent(debounced)}`
      : null;

  const { data, error, isLoading } = useApiSWR<AccountUniqueCheckResponse>(
    key,
    undefined,
    { dedupingInterval: 500 },
  );

  return {
    exists: Boolean(data?.exists),
    isLoading,
    error,
    isValid,
  };
}
