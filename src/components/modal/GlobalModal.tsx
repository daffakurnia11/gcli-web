"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

import type { GlobalModalProps } from "@/types/Modal";

export default function GlobalModal({
  open,
  title,
  children,
  footer,
  onClose,
  size = "lg",
}: GlobalModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const sizeClass =
    size === "2xl"
      ? "max-w-2xl"
      : size === "xl"
        ? "max-w-xl"
        : size === "md"
          ? "max-w-md"
          : "max-w-lg";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4">
      <div className="flex min-h-full items-start justify-center py-4 sm:items-center">
      <div className={`w-full ${sizeClass} max-h-[calc(100dvh-2rem)] overflow-hidden rounded-lg border border-primary-700 bg-primary-900 shadow-xl flex flex-col`}>
        <div className="flex items-center justify-between border-b border-primary-700 px-5 py-4">
          <h3 className="text-base font-semibold uppercase tracking-wider text-primary-100">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-primary-700 p-1 text-primary-300 hover:text-primary-100"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="border-t border-primary-700 px-5 py-4">{footer}</div>}
      </div>
      </div>
    </div>
  );
}
