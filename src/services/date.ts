type DateInput = Date | string | null | undefined;

type FormatDateTimeOptions = {
  fallback?: string;
  locale?: string;
  includeSeconds?: boolean;
};

export const formatDateOnly = (
  value: DateInput,
  fallback = "N/A",
  locale = "en-US",
) => {
  if (!value) {
    return fallback;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

export const formatDateTime = (
  value: DateInput,
  {
    fallback = "N/A",
    locale = "en-US",
    includeSeconds = false,
  }: FormatDateTimeOptions = {},
) => {
  if (!value) {
    return fallback;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    ...(includeSeconds ? { second: "numeric" } : {}),
  }).format(date);
};
