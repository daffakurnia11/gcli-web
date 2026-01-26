"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";

type UniqueCheckType = "username" | "email";

type UniqueCheckResponse = {
  exists: boolean;
};

const fetcher = async (url: string): Promise<UniqueCheckResponse> => {
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data?.error === "string" ? data.error : "Request failed";
    throw new Error(message);
  }

  return data as UniqueCheckResponse;
};

const useDebouncedValue = (value: string, delayMs: number) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
};

export function useUniqueCheck(
  type: UniqueCheckType,
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

  const { data, error, isLoading } = useSWR<UniqueCheckResponse>(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 500,
  });

  return {
    exists: Boolean(data?.exists),
    isLoading,
    error,
    isValid,
  };
}
