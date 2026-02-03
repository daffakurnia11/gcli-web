"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

import { Typography } from "@/components/typography";

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  className?: string;
};

const range = (start: number, end: number) => {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

const getPageNumbers = (
  currentPage: number,
  totalPages: number,
): (number | string)[] => {
  // Show at most 5 page numbers
  const maxVisiblePages = 5;

  if (totalPages <= maxVisiblePages) {
    return range(1, totalPages);
  }

  // Always show first page
  if (currentPage <= 3) {
    return [1, 2, 3, 4, "...", totalPages];
  }

  // Always show last page
  if (currentPage >= totalPages - 2) {
    return [
      1,
      "...",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  // Show ellipsis on both sides
  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
};

const buttonBaseClass =
  "min-w-10 h-10 flex items-center justify-center rounded border transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

const buttonVariantClass = {
  primary:
    "border-secondary-700 bg-secondary-700/20 text-secondary-700 hover:bg-secondary-700/30",
  secondary:
    "border-primary-700 bg-primary-800 text-primary-200 hover:bg-primary-700 hover:text-primary-100",
};

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers(currentPage, totalPages);
  const hasItemInfo = totalItems !== undefined && itemsPerPage !== undefined;
  const startIndex = hasItemInfo
    ? (currentPage - 1) * itemsPerPage! + 1
    : null;
  const endIndex = hasItemInfo
    ? Math.min(currentPage * itemsPerPage!, totalItems!)
    : null;

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className ?? ""}`}
    >
      {hasItemInfo && startIndex !== null && endIndex !== null && (
        <Typography.Small className="text-primary-300">
          Showing {startIndex} to {endIndex} of {totalItems} results
        </Typography.Small>
      )}

      <div className="flex items-center gap-2">
        {/* First Page */}
        <button
          type="button"
          className={`${buttonBaseClass} ${buttonVariantClass.secondary}`}
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="First page"
        >
          <ChevronsLeft size={16} />
        </button>

        {/* Previous Page */}
        <button
          type="button"
          className={`${buttonBaseClass} ${buttonVariantClass.secondary}`}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page Numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="min-w-10 h-10 flex items-center justify-center text-primary-400"
                >
                  ...
                </span>
              );
            }

            const pageNumber = page as number;
            const isActive = pageNumber === currentPage;

            return (
              <button
                key={pageNumber}
                type="button"
                className={`${buttonBaseClass} ${isActive ? buttonVariantClass.primary : buttonVariantClass.secondary}`}
                onClick={() => onPageChange(pageNumber)}
                aria-label={`Page ${pageNumber}`}
                aria-current={isActive ? "page" : undefined}
              >
                <Typography.Small
                  className={isActive ? "font-semibold" : "font-normal"}
                >
                  {pageNumber}
                </Typography.Small>
              </button>
            );
          })}
        </div>

        {/* Mobile Current Page Indicator */}
        <div className="sm:hidden min-w-16 h-10 flex items-center justify-center border border-primary-700 bg-primary-800 rounded">
          <Typography.Small className="text-primary-200">
            {currentPage} / {totalPages}
          </Typography.Small>
        </div>

        {/* Next Page */}
        <button
          type="button"
          className={`${buttonBaseClass} ${buttonVariantClass.secondary}`}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>

        {/* Last Page */}
        <button
          type="button"
          className={`${buttonBaseClass} ${buttonVariantClass.secondary}`}
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Last page"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
}
