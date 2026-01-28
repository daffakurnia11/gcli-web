"use client";

import classNames from "classnames";
import type { ReactNode } from "react";

import { Typography } from "@/components/typography";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  align?: "left" | "center" | "right";
  headerClassName?: string;
  cellClassName?: string;
  render: (row: T, index: number) => ReactNode;
};

export type DataTableProps<T> = {
  columns: Array<DataTableColumn<T>>;
  rows: T[];
  rowKey: (row: T, index: number) => string | number;
  className?: string;
};

export type DataTableSkeletonProps = {
  columns: Array<
    Pick<
      DataTableColumn<unknown>,
      "key" | "header" | "align" | "headerClassName" | "cellClassName"
    >
  >;
  rows?: number;
  className?: string;
};

const alignClass = (align?: "left" | "center" | "right") => {
  if (align === "center") {
    return "text-center";
  }
  if (align === "right") {
    return "text-right";
  }
  return "text-left";
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  className,
}: DataTableProps<T>) {
  const tableClassName =
    className ?? "w-full max-w-3xl mx-auto border-collapse";

  return (
    <div className="overflow-x-auto">
      <table className={tableClassName}>
        <thead>
          <tr className="border-b border-primary-700">
            {columns.map((column) => {
              const alignment = alignClass(column.align);
              return (
                <th
                  key={column.key}
                  className={classNames(
                    "py-6 sm:px-6 px-4",
                    alignment,
                    column.headerClassName,
                  )}
                >
                  <Typography.Small className="text-primary-300 uppercase tracking-wider">
                    {column.header}
                  </Typography.Small>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowKey(row, rowIndex)}
              className="border-b border-primary-700 hover:bg-primary-700/30 transition-colors"
            >
              {columns.map((column) => {
                const alignment = alignClass(column.align);
                return (
                  <td
                    key={column.key}
                    className={classNames(
                      "py-6 sm:px-6 px-4",
                      alignment,
                      column.cellClassName,
                    )}
                  >
                    {column.render(row, rowIndex)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DataTableSkeleton({
  columns,
  rows = 6,
  className,
}: DataTableSkeletonProps) {
  const tableClassName =
    className ?? "w-full max-w-3xl mx-auto border-collapse";
  const rowIndexes = Array.from({ length: rows }, (_, index) => index);

  return (
    <div className="overflow-x-auto">
      <table className={tableClassName}>
        <thead>
          <tr className="border-b border-primary-700">
            {columns.map((column) => (
              <th
                key={column.key}
                className={classNames(
                  "py-6 sm:px-6 px-4",
                  alignClass(column.align),
                  column.headerClassName,
                )}
              >
                <Typography.Small className="text-primary-300 uppercase tracking-wider">
                  {column.header}
                </Typography.Small>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowIndexes.map((rowIndex) => (
            <tr
              key={`skeleton-row-${rowIndex}`}
              className="border-b border-primary-700"
            >
              {columns.map((column, cellIndex) => (
                <td
                  key={`skeleton-cell-${rowIndex}-${column.key}-${cellIndex}`}
                  className={classNames(
                    "py-6 sm:px-6 px-4",
                    alignClass(column.align),
                    column.cellClassName,
                  )}
                >
                  <div className="h-6 w-full max-w-48 animate-pulse rounded bg-primary-700/60" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
