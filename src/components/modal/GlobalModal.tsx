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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-lg border border-primary-700 bg-primary-900 shadow-xl">
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
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="border-t border-primary-700 px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}
