"use client";

import classNames from "classnames";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { DateInputProps, FormSize } from "@/types/Form";

import { FieldWrapper } from "./FieldWrapper";

const sizeStyles: Record<
  FormSize,
  { trigger: string; day: string; icon: number }
> = {
  sm: {
    trigger: "h-9 px-3 text-sm",
    day: "w-7 h-7 text-sm",
    icon: 16,
  },
  md: {
    trigger: "h-11 px-4 text-base",
    day: "w-8 h-8 text-base",
    icon: 18,
  },
  lg: {
    trigger: "h-13 px-5 text-lg",
    day: "w-9 h-9 text-lg",
    icon: 20,
  },
  xl: {
    trigger: "h-15 px-6 text-xl",
    day: "w-10 h-10 text-xl",
    icon: 22,
  },
};

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDate(date: Date, includeTime = false): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  if (includeTime) {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
  return `${year}-${month}-${day}`;
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  return date;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function DateInput({
  id,
  name,
  value: controlledValue,
  defaultValue,
  placeholder,
  disabled = false,
  required = false,
  onChange,
  onBlur,
  onFocus,
  min,
  max,
  enableTime = false,
  hour12 = false,
  className = "",
  fullWidth = false,
  size = "md",
  label,
  error,
  helperText,
}: DateInputProps) {
  const dateId = id || name;
  const hasError = Boolean(error);
  const sizeConfig = sizeStyles[size];
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue || "");
  const selectedValue = isControlled ? controlledValue : internalValue;
  const selectedDate = parseDate(selectedValue);
  const minDate = min ? parseDate(min) : null;
  const maxDate = max ? parseDate(max) : null;

  // Time state
  const initialHour = selectedDate?.getHours() ?? 0;
  const initialMinute = selectedDate?.getMinutes() ?? 0;
  const [hour, setHour] = useState(initialHour);
  const [minute, setMinute] = useState(initialMinute);

  // Input display state (temporary, for showing what user is currently typing)
  const [hourInput, setHourInput] = useState("");
  const [minuteInput, setMinuteInput] = useState("");
  const [isEditingHour, setIsEditingHour] = useState(false);
  const [isEditingMinute, setIsEditingMinute] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [viewMonth, setViewMonth] = useState(selectedDate || new Date());
  const [calendarView, setCalendarView] = useState<
    "days" | "months" | "years" | "time"
  >("days");
  const [decadeStart, setDecadeStart] = useState(
    Math.floor((selectedDate || new Date()).getFullYear() / 10) * 10,
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const handleSelect = (date: Date) => {
    // Set the time if enableTime is true
    if (enableTime) {
      date.setHours(hour);
      date.setMinutes(minute);
    }

    const dateStr = formatDate(date, enableTime);

    // Check min/max constraints
    if (minDate && date < minDate) return;
    if (maxDate && date > maxDate) return;

    if (!isControlled) {
      setInternalValue(dateStr);
    }
    if (onChange) {
      onChange(dateStr);
    }

    // If time is enabled, switch to time view instead of closing
    if (enableTime) {
      // Reset editing flags and sync input values
      setIsEditingHour(false);
      setIsEditingMinute(false);
      setHourInput(String(hour12 ? hour % 12 || 12 : hour));
      setMinuteInput(String(minute).padStart(2, "0"));
      setCalendarView("time");
    } else {
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen((prev) => {
        if (!prev) {
          // Reset to days view when opening
          setCalendarView("days");
          if (selectedDate) {
            setViewMonth(selectedDate);
          }
        }
        return !prev;
      });
    }
  };

  const handlePrevMonth = () => {
    setViewMonth(
      new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setViewMonth(
      new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1),
    );
  };

  const handleMonthClick = () => {
    setCalendarView("months");
  };

  const handleYearClick = () => {
    setCalendarView("years");
  };

  const handleMonthSelect = (monthIndex: number) => {
    setViewMonth(new Date(viewMonth.getFullYear(), monthIndex, 1));
    setCalendarView("days");
  };

  const handleYearSelect = (year: number) => {
    setViewMonth(new Date(year, 0, 1));
    setDecadeStart(Math.floor(year / 10) * 10);
    setCalendarView("months");
  };

  const handleTimeConfirm = useCallback(() => {
    // Validate and commit input values if user was typing
    let committedHour = hour;
    let committedMinute = minute;

    if (isEditingHour && hourInput) {
      const hourValue = parseInt(hourInput);
      const maxHour = hour12 ? 12 : 23;
      const minHour = hour12 ? 1 : 0;
      if (!isNaN(hourValue) && hourValue >= minHour && hourValue <= maxHour) {
        const newHour = hour12
          ? hour >= 12
            ? hourValue + 12
            : hourValue
          : hourValue;
        setHour(newHour);
        committedHour = newHour;
      }
    }

    if (isEditingMinute && minuteInput) {
      const minuteValue = parseInt(minuteInput);
      if (!isNaN(minuteValue) && minuteValue >= 0 && minuteValue <= 59) {
        setMinute(minuteValue);
        committedMinute = minuteValue;
      }
    }

    // Reset editing flags after committing
    setIsEditingHour(false);
    setIsEditingMinute(false);

    if (selectedDate || viewMonth) {
      const date = selectedDate || viewMonth;
      date.setHours(committedHour);
      date.setMinutes(committedMinute);
      const dateStr = formatDate(date, true);

      if (!isControlled) {
        setInternalValue(dateStr);
      }
      if (onChange) {
        onChange(dateStr);
      }
    }
    setIsOpen(false);
    triggerRef.current?.focus();
  }, [
    isEditingHour,
    isEditingMinute,
    hourInput,
    minuteInput,
    hour,
    minute,
    hour12,
    selectedDate,
    viewMonth,
    isControlled,
    onChange,
  ]);

  const handlePrevDecade = () => {
    setDecadeStart((prev) => prev - 10);
  };

  const handleNextDecade = () => {
    setDecadeStart((prev) => prev + 10);
  };

  // Generate year range (1900 to current year + 10)
  const currentYear = new Date().getFullYear();
  const minYear = 1900;
  const maxYear = currentYear + 10;
  const decadeYears = Array.from({ length: 12 }, (_, i) => decadeStart + i);

  // Render months grid
  const renderMonths = () => {
    return (
      <div className="grid grid-cols-3 gap-2">
        {MONTHS.map((month, index) => {
          const isSelected = viewMonth.getMonth() === index;
          return (
            <button
              key={month}
              type="button"
              onClick={() => handleMonthSelect(index)}
              className={classNames(
                "px-5 py-1.5 rounded-md",
                "transition-all duration-150",
                isSelected
                  ? "bg-secondary-700 text-white font-medium"
                  : "text-primary-100 hover:bg-primary-700 cursor-pointer",
              )}
              aria-label={month}
            >
              {month}
            </button>
          );
        })}
      </div>
    );
  };

  // Render years grid
  const renderYears = () => {
    return (
      <div>
        <div className="grid grid-cols-4 gap-2">
          {decadeYears.map((year, index) => {
            const isSelected = viewMonth.getFullYear() === year;
            const isOutsideRange = year < minYear || year > maxYear;
            const disabledChoice =
              isOutsideRange || index === 0 || index === 11;
            const handleClick = () => {
              if (index === 0) {
                handlePrevDecade();
              } else if (index === 11) {
                handleNextDecade();
              } else {
                handleYearSelect(year);
              }
            };
            return (
              <button
                key={index}
                type="button"
                onClick={handleClick}
                disabled={isOutsideRange}
                className={classNames(
                  "px-2 py-1.5 rounded-md",
                  "transition-all duration-150",
                  isSelected
                    ? "bg-secondary-700 text-white font-medium"
                    : disabledChoice
                      ? "text-primary-500 opacity-50"
                      : "text-primary-100 hover:bg-primary-700 cursor-pointer",
                  isOutsideRange && "cursor-not-allowed",
                )}
                aria-label={String(year)}
              >
                {year}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        handleToggle();
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        isOpen &&
        triggerRef.current &&
        calendarRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        !calendarRef.current.contains(e.target as Node)
      ) {
        // If in time view, commit the time before closing
        if (enableTime && calendarView === "time") {
          handleTimeConfirm();
        } else {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, enableTime, calendarView, handleTimeConfirm]);

  const renderCalendar = () => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date();

    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className={sizeConfig.day}
          aria-hidden="true"
        />,
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
      const isToday = isSameDay(date, today);
      const isDisabled =
        (minDate && date < minDate) || (maxDate && date > maxDate);

      days.push(
        <button
          key={day}
          type="button"
          disabled={isDisabled || false}
          onClick={() => handleSelect(date)}
          className={classNames(
            sizeConfig.day,
            "rounded-full",
            "flex items-center justify-center",
            "transition-all duration-150",
            isSelected
              ? "bg-secondary-700 text-white font-medium"
              : isDisabled
                ? "text-primary-500 cursor-not-allowed"
                : "text-primary-100 hover:bg-primary-700 cursor-pointer",
            isToday && !isSelected && "border border-secondary-700",
          )}
          aria-label={`${MONTHS[month]} ${day}, ${year}`}
        >
          {day}
        </button>,
      );
    }

    return days;
  };

  const dateElement = (
    <div className={classNames("relative", fullWidth && "w-full")}>
      <button
        ref={triggerRef}
        type="button"
        id={dateId}
        name={name}
        disabled={disabled}
        onClick={handleToggle}
        onFocus={(e) => {
          onFocus?.(e as unknown as React.FocusEvent<HTMLInputElement>);
        }}
        onBlur={(e) => {
          if (!isOpen) {
            onBlur?.(e as unknown as React.FocusEvent<HTMLInputElement>);
          }
        }}
        onKeyDown={handleKeyDown}
        className={classNames(
          sizeConfig.trigger,
          "w-full rounded-md",
          "bg-primary-900",
          "border border-primary-300",
          "text-primary-100",
          "transition-all duration-200",
          "focus:border-secondary-700",
          "focus:outline-none",
          "focus:outline-offset-2",
          "focus:outline-2",
          "focus:outline-secondary-700",
          "disabled:border-primary-500",
          "disabled:text-primary-500",
          "disabled:cursor-not-allowed",
          "flex items-center justify-between",
          hasError && "border-tertiary-red",
          isOpen && "border-secondary-700",
          className,
        )}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-labelledby={dateId}
      >
        <span
          className={selectedDate && isMounted ? "" : "text-primary-300"}
          suppressHydrationWarning
        >
          {selectedDate && isMounted
            ? enableTime
              ? formatDate(selectedDate, true).replace("T", " ")
              : formatDate(selectedDate)
            : placeholder ||
              (enableTime ? "Select date and time..." : "Select date...")}
        </span>
        <svg
          width={sizeConfig.icon}
          height={sizeConfig.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary-300 shrink-0 ml-2"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={calendarRef}
          className="absolute z-50 mt-1 bg-primary-900 border border-primary-300 rounded-md shadow-lg p-4 focus:outline-none"
          role="dialog"
          aria-modal="true"
          aria-label="Calendar"
        >
          {/* Month/Year Header */}
          <div className="flex items-center justify-between mb-4">
            {calendarView === "days" && (
              <>
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 hover:bg-primary-700 cursor-pointer rounded transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeft size={20} className="text-primary-100" />
                </button>

                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={handleMonthClick}
                    className="px-3 py-1 hover:bg-primary-700 cursor-pointer rounded transition-colors text-primary-100 font-medium"
                  >
                    {MONTHS[viewMonth.getMonth()]}
                  </button>
                  <button
                    type="button"
                    onClick={handleYearClick}
                    className="px-3 py-1 hover:bg-primary-700 cursor-pointer rounded transition-colors text-primary-100 font-medium"
                  >
                    {viewMonth.getFullYear()}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-primary-700 cursor-pointer rounded transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRight size={20} className="text-primary-100" />
                </button>
              </>
            )}

            {calendarView === "months" && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setViewMonth(new Date(viewMonth.getFullYear() - 1, 0, 1))
                  }
                  className="p-1 hover:bg-primary-700 cursor-pointer rounded transition-colors"
                  aria-label="Previous year"
                >
                  <ChevronLeft size={20} className="text-primary-100" />
                </button>

                <button
                  type="button"
                  onClick={handleYearClick}
                  className="px-3 py-1 hover:bg-primary-700 cursor-pointer rounded transition-colors text-primary-100 font-medium"
                >
                  {viewMonth.getFullYear()}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setViewMonth(new Date(viewMonth.getFullYear() + 1, 0, 1))
                  }
                  className="p-1 hover:bg-primary-700 cursor-pointer rounded transition-colors"
                  aria-label="Next year"
                >
                  <ChevronRight size={20} className="text-primary-100" />
                </button>
              </>
            )}

            {calendarView === "years" && (
              <>
                <button
                  type="button"
                  onClick={handlePrevDecade}
                  className="p-1 hover:bg-primary-700 cursor-pointer rounded transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Previous decade"
                  disabled={decadeStart - 10 < minYear}
                >
                  <ChevronLeft size={20} className="text-primary-100" />
                </button>

                <span className="text-primary-100 font-medium">
                  Select Year
                </span>

                <button
                  type="button"
                  onClick={handleNextDecade}
                  className="p-1 hover:bg-primary-700 cursor-pointer rounded transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Next decade"
                  disabled={decadeStart + 9 >= maxYear}
                >
                  <ChevronRight size={20} className="text-primary-100" />
                </button>
              </>
            )}

            {calendarView === "time" && (
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCalendarView("days")}
                  className="p-1 hover:bg-primary-700 cursor-pointer rounded transition-colors"
                  aria-label="Back to calendar"
                >
                  <ChevronLeft size={20} className="text-primary-100" />
                </button>

                <span className="text-primary-100 font-medium">
                  Select Time
                </span>

                <div className="w-6" />
              </div>
            )}
          </div>

          {/* Content based on view */}
          {calendarView === "days" && (
            <>
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs text-primary-300 font-medium py-1"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
            </>
          )}

          {calendarView === "months" && renderMonths()}

          {calendarView === "years" && renderYears()}

          {calendarView === "time" && (
            <>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                {/* Hours */}
                <div className="flex flex-col items-center">
                  <label className="text-xs text-primary-300 mb-2">Hour</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const newHour =
                          (hour - 1 + (hour12 ? 12 : 24)) %
                            (hour12 ? 12 : 24) || (hour12 ? 12 : 23);
                        setHour(newHour);
                        if (!isEditingHour) {
                          setHourInput(
                            String(hour12 ? newHour % 12 || 12 : newHour),
                          );
                        }
                      }}
                      className="p-2 hover:bg-primary-700 cursor-pointer rounded transition-colors"
                      aria-label="Decrement hour"
                    >
                      <ChevronLeft size={16} className="text-primary-100" />
                    </button>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={
                        isEditingHour
                          ? hourInput
                          : hour12
                            ? hour % 12 || 12
                            : hour
                      }
                      onChange={(e) => {
                        setHourInput(e.target.value);
                        setIsEditingHour(true);
                      }}
                      onFocus={(e) => {
                        e.target.select();
                        setHourInput(String(hour12 ? hour % 12 || 12 : hour));
                      }}
                      className="w-12 px-2 py-1 bg-primary-800 border border-primary-300 text-primary-100 text-center rounded focus:border-secondary-700 focus:outline-none focus:outline-2 focus:outline-secondary-700"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newHour = (hour + 1) % (hour12 ? 12 : 24);
                        setHour(newHour);
                        if (!isEditingHour) {
                          setHourInput(
                            String(hour12 ? newHour % 12 || 12 : newHour),
                          );
                        }
                      }}
                      className="p-2 hover:bg-primary-700 cursor-pointer rounded transition-colors"
                      aria-label="Increment hour"
                    >
                      <ChevronRight size={16} className="text-primary-100" />
                    </button>
                  </div>
                </div>

                {/* Minutes */}
                <div className="flex flex-col items-center">
                  <label className="text-xs text-primary-300 mb-2">
                    Minute
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const newMinute = (minute - 1 + 60) % 60;
                        setMinute(newMinute);
                        if (!isEditingMinute) {
                          setMinuteInput(String(newMinute).padStart(2, "0"));
                        }
                      }}
                      className="p-2 hover:bg-primary-700 cursor-pointer rounded transition-colors"
                      aria-label="Decrement minute"
                    >
                      <ChevronLeft size={16} className="text-primary-100" />
                    </button>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={
                        isEditingMinute
                          ? minuteInput
                          : String(minute).padStart(2, "0")
                      }
                      onChange={(e) => {
                        setMinuteInput(e.target.value);
                        setIsEditingMinute(true);
                      }}
                      onFocus={(e) => {
                        e.target.select();
                        setMinuteInput(String(minute).padStart(2, "0"));
                      }}
                      className="w-12 px-2 py-1 bg-primary-800 border border-primary-300 text-primary-100 text-center rounded focus:border-secondary-700 focus:outline-none focus:outline-2 focus:outline-secondary-700"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newMinute = (minute + 1) % 60;
                        setMinute(newMinute);
                        if (!isEditingMinute) {
                          setMinuteInput(String(newMinute).padStart(2, "0"));
                        }
                      }}
                      className="p-2 hover:bg-primary-700 cursor-pointer rounded transition-colors"
                      aria-label="Increment minute"
                    >
                      <ChevronRight size={16} className="text-primary-100" />
                    </button>
                  </div>
                </div>
              </div>
              {hour12 && (
                <div className="flex justify-center gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => setHour((h) => (h >= 12 ? h - 12 : h + 12))}
                    className={classNames(
                      "px-3 py-1 text-xs rounded transition-colors",
                      hour < 12
                        ? "bg-secondary-700 text-white"
                        : "bg-primary-800 text-primary-100 hover:bg-primary-700 cursor-pointer",
                    )}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setHour((h) => (h >= 12 ? h : h + 12))}
                    className={classNames(
                      "px-3 py-1 text-xs rounded transition-colors",
                      hour >= 12
                        ? "bg-secondary-700 text-white"
                        : "bg-primary-800 text-primary-100 hover:bg-primary-700 cursor-pointer",
                    )}
                  >
                    PM
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );

  if (label || error || helperText) {
    return (
      <FieldWrapper
        id={dateId}
        label={label}
        error={error}
        helperText={helperText}
        required={required}
        disabled={disabled}
      >
        {dateElement}
      </FieldWrapper>
    );
  }

  return dateElement;
}
