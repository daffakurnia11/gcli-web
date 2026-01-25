"use client";

import classNames from "classnames";
import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { FormSize, SelectProps } from "@/types/Form";

import { FieldWrapper } from "./FieldWrapper";

const sizeStyles: Record<
  FormSize,
  { trigger: string; option: string; icon: number }
> = {
  sm: {
    trigger: "h-9 px-3 text-sm",
    option: "px-3 py-2 text-sm",
    icon: 16,
  },
  md: {
    trigger: "h-11 px-4 text-base",
    option: "px-4 py-2.5 text-base",
    icon: 18,
  },
  lg: {
    trigger: "h-13 px-5 text-lg",
    option: "px-5 py-3 text-lg",
    icon: 20,
  },
  xl: {
    trigger: "h-15 px-6 text-xl",
    option: "px-6 py-3.5 text-xl",
    icon: 22,
  },
};

export function Select({
  id,
  name,
  options,
  value: controlledValue,
  defaultValue,
  placeholder,
  disabled = false,
  required = false,
  onChange,
  onBlur,
  onFocus,
  className = "",
  fullWidth = false,
  size = "md",
  label,
  error,
  helperText,
}: SelectProps) {
  const selectId = id || name;
  const hasError = Boolean(error);
  const sizeConfig = sizeStyles[size];
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue || "");
  const selectedValue = isControlled ? controlledValue : internalValue;

  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedOption = isMounted
    ? options.find((opt) => opt.value === selectedValue)
    : undefined;

  const effectiveDisabled = isMounted ? disabled : true;
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) {
      return options;
    }
    const normalized = searchTerm.trim().toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(normalized));
  }, [options, searchTerm]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const handleSelect = (optionValue: string) => {
    const option = options.find((opt) => opt.value === optionValue);
    if (option && !option.disabled) {
      if (!isControlled) {
        setInternalValue(optionValue);
      }
      if (onChange) {
        onChange(optionValue);
      }
      setIsOpen(false);
      setFocusedIndex(-1);
      setSearchTerm("");
      triggerRef.current?.focus();
    }
  };

  const handleToggle = () => {
    if (!effectiveDisabled) {
      setIsOpen((prev) => {
        const next = !prev;
        if (!next) {
          setSearchTerm("");
          setFocusedIndex(-1);
        }
        return next;
      });
      if (!isOpen) {
        setFocusedIndex(-1);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (effectiveDisabled) return;

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (isOpen && focusedIndex >= 0) {
          const option = filteredOptions[focusedIndex];
          if (option && !option.disabled) {
            handleSelect(option.value);
          }
        } else {
          handleToggle();
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(-1);
        } else {
          const nextIndex = filteredOptions.findIndex(
            (opt, i) => i > focusedIndex && !opt.disabled,
          );
          if (nextIndex >= 0) {
            setFocusedIndex(nextIndex);
          }
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (isOpen) {
          const prevIndex = filteredOptions
            .map((opt, i) => ({ opt, i }))
            .reverse()
            .find((item) => item.i < focusedIndex && !item.opt.disabled)?.i;
          if (prevIndex !== undefined) {
            setFocusedIndex(prevIndex);
          }
        }
        break;
      case "Home":
        e.preventDefault();
        if (isOpen) {
          const firstEnabled = filteredOptions.findIndex((opt) => !opt.disabled);
          if (firstEnabled >= 0) {
            setFocusedIndex(firstEnabled);
          }
        }
        break;
      case "End":
        e.preventDefault();
        if (isOpen) {
          const lastEnabled = filteredOptions
            .map((opt, i) => ({ opt, i }))
            .reverse()
            .find((item) => !item.opt.disabled)?.i;
          if (lastEnabled !== undefined) {
            setFocusedIndex(lastEnabled);
          }
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        triggerRef.current?.focus();
        break;
      case "Tab":
        if (isOpen) {
          e.preventDefault();
          setIsOpen(false);
          setFocusedIndex(-1);
        }
        break;
    }
  };

  const handleOptionKeyDown = (
    e: React.KeyboardEvent<HTMLLIElement>,
    optionValue: string,
    _index: number,
  ) => {
    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        handleSelect(optionValue);
        break;
      case "ArrowDown":
      case "ArrowUp":
      case "Home":
      case "End":
      case "Escape":
      case "Tab":
        e.stopPropagation();
        triggerRef.current?.focus();
        break;
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        const nextIndex = filteredOptions.findIndex(
          (opt, i) => i > focusedIndex && !opt.disabled,
        );
        if (nextIndex >= 0) {
          setFocusedIndex(nextIndex);
        } else if (filteredOptions.length > 0) {
          const firstEnabled = filteredOptions.findIndex((opt) => !opt.disabled);
          if (firstEnabled >= 0) {
            setFocusedIndex(firstEnabled);
          }
        }
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        const prevIndex = filteredOptions
          .map((opt, i) => ({ opt, i }))
          .reverse()
          .find((item) => item.i < focusedIndex && !item.opt.disabled)?.i;
        if (prevIndex !== undefined) {
          setFocusedIndex(prevIndex);
        }
        break;
      }
      case "Enter": {
        e.preventDefault();
        if (focusedIndex >= 0) {
          const option = filteredOptions[focusedIndex];
          if (option && !option.disabled) {
            handleSelect(option.value);
          }
        }
        break;
      }
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        triggerRef.current?.focus();
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        isOpen &&
        triggerRef.current &&
        listRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        !listRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    requestAnimationFrame(() => {
      searchRef.current?.focus();
    });
  }, [isOpen]);

  const selectElement = (
    <div className={classNames("relative", fullWidth && "w-full")}>
      <button
        ref={triggerRef}
        type="button"
        id={selectId}
        name={name}
        disabled={effectiveDisabled}
        onClick={handleToggle}
        onFocus={(e) => {
          onFocus?.(e as unknown as React.FocusEvent<HTMLSelectElement>);
        }}
        onBlur={(e) => {
          if (!isOpen) {
            onBlur?.(e as unknown as React.FocusEvent<HTMLSelectElement>);
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
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={selectId}
      >
        <span
          className={selectedOption && isMounted ? "" : "text-primary-300"}
          suppressHydrationWarning
        >
          {selectedOption && isMounted
            ? selectedOption.label
            : placeholder || "Select..."}
        </span>
        <ChevronDown
          size={sizeConfig.icon}
          className={`text-primary-300 transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          role="listbox"
          aria-activedescendant={
            focusedIndex >= 0 ? `${selectId}-option-${focusedIndex}` : undefined
          }
          className={classNames(
            "absolute z-50 w-full mt-1",
            "bg-primary-900",
            "border border-primary-300",
            "rounded-md",
            "shadow-lg",
            "max-h-60 overflow-auto",
            "focus:outline-none",
            hasError && "border-tertiary-red",
          )}
          tabIndex={-1}
        >
          <li className="px-3 py-2">
            <input
              ref={searchRef}
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setFocusedIndex(-1);
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search..."
              className="w-full rounded-md bg-primary-800 border border-primary-700 px-3 py-2 text-sm text-primary-100 placeholder:text-primary-400 focus:border-secondary-700 focus:outline-none"
            />
          </li>
          {filteredOptions.length === 0 && (
            <li className="px-4 py-3 text-sm text-primary-400">No results</li>
          )}
          {filteredOptions.map((option, index) => {
            const isSelected = option.value === selectedValue;
            const isFocused = focusedIndex === index;

            return (
              <li
                key={option.value}
                id={`${selectId}-option-${index}`}
                role="option"
                aria-selected={isSelected}
                aria-disabled={option.disabled}
                onClick={() => handleSelect(option.value)}
                onKeyDown={(e) => handleOptionKeyDown(e, option.value, index)}
                onMouseEnter={() => {
                  setFocusedIndex(index);
                }}
                className={classNames(
                  sizeConfig.option,
                  "cursor-pointer",
                  "transition-colors duration-150 ",
                  option.disabled
                    ? "text-primary-500 cursor-not-allowed"
                    : isSelected
                      ? "bg-secondary-700 text-white"
                      : isFocused
                        ? "bg-primary-700 text-primary-100"
                        : "text-primary-100 hover:bg-primary-700 cursor-pointer",
                  isSelected && "font-medium",
                )}
              >
                {option.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  if (label || error || helperText) {
    return (
      <FieldWrapper
        id={selectId}
        label={label}
        error={error}
        helperText={helperText}
        required={required}
        disabled={effectiveDisabled}
      >
        {selectElement}
      </FieldWrapper>
    );
  }

  return selectElement;
}
