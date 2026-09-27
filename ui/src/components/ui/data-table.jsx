import React from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/design-system/cn";
import { Skeleton } from "./skeleton";
import { EmptyState } from "./empty-state";
import { Button } from "./button";

/**
 * Standardized DataTable Component
 *
 * @param {Array<{ key: string, header: React.ReactNode, render?: (row: any, index: number) => React.ReactNode, sortable?: boolean, align?: 'left'|'center'|'right', className?: string }>} columns
 * @param {Array<any>} data
 * @param {(row: any) => string|number} keyExtractor
 * @param {boolean} isLoading
 * @param {React.ReactNode} emptyState
 * @param {Array<string|number>} selectedIds
 * @param {(id: string|number) => void} onSelectRow
 * @param {() => void} onSelectAll
 * @param {string} sortField
 * @param {boolean} sortAsc
 * @param {(key: string) => void} onSort
 * @param {object} pagination
 */
export function DataTable({
  columns = [],
  data = [],
  keyExtractor = (row, i) => row.id || row._id || i,
  isLoading = false,
  emptyState,
  selectedIds = [],
  onSelectRow,
  onSelectAll,
  sortField,
  sortAsc = true,
  onSort,
  pagination,
  onRowClick,
  className = "",
}) {
  const isSelectable = typeof onSelectRow === "function";
  const allSelected =
    isSelectable &&
    data.length > 0 &&
    data.every((row) => selectedIds.includes(keyExtractor(row)));

  const totalColumns = columns.length + (isSelectable ? 1 : 0);

  return (
    <div
      className={cn(
        "bg-surface rounded-lg border border-border shadow-card overflow-hidden w-full",
        className
      )}
    >
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-soft/80 text-[11px] font-semibold text-text-muted uppercase tracking-wider select-none">
              {isSelectable && (
                <th className="w-9 px-3.5 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onSelectAll}
                    className="rounded border-border text-primary focus:ring-0 focus:outline-none cursor-pointer"
                  />
                </th>
              )}

              {columns.map((col) => {
                const alignClass =
                  col.align === "right"
                    ? "text-right"
                    : col.align === "center"
                    ? "text-center"
                    : "text-left";

                return (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && onSort && onSort(col.key)}
                    className={cn(
                      "px-3.5 py-3 whitespace-nowrap",
                      alignClass,
                      col.sortable && "cursor-pointer hover:text-text-primary",
                      col.className
                    )}
                  >
                    <div
                      className={cn(
                        "inline-flex items-center gap-1.5",
                        col.align === "right" && "justify-end",
                        col.align === "center" && "justify-center"
                      )}
                    >
                      <span>{col.header}</span>
                      {col.sortable && (
                        <ArrowUpDown
                          className={cn(
                            "w-3 h-3 text-text-disabled",
                            sortField === col.key && "text-primary"
                          )}
                        />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-border-light text-xs text-text-secondary">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skel-${i}`} className="animate-pulse">
                  {isSelectable && (
                    <td className="px-3.5 py-3 text-center">
                      <Skeleton className="w-4 h-4 mx-auto" />
                    </td>
                  )}
                  {columns.map((col, cIdx) => (
                    <td key={`skel-c-${cIdx}`} className="px-3.5 py-3">
                      <Skeleton className="h-4 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={totalColumns} className="py-12 px-4 text-center">
                  {emptyState || (
                    <EmptyState
                      title="No data found"
                      description="There are currently no items matching your criteria."
                    />
                  )}
                </td>
              </tr>
            ) : (
              data.map((row, index) => {
                const rowKey = keyExtractor(row, index);
                const isSelected = selectedIds.includes(rowKey);

                return (
                  <tr
                    key={rowKey}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={cn(
                      "transition-colors group",
                      onRowClick && "cursor-pointer",
                      isSelected
                        ? "bg-primary-soft/40 hover:bg-primary-soft/60"
                        : "hover:bg-surface-hover/70"
                    )}
                  >
                    {isSelectable && (
                      <td
                        className="px-3.5 py-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onSelectRow(rowKey)}
                          className="rounded border-border text-primary focus:ring-0 focus:outline-none cursor-pointer"
                        />
                      </td>
                    )}

                    {columns.map((col) => {
                      const alignClass =
                        col.align === "right"
                          ? "text-right"
                          : col.align === "center"
                          ? "text-center"
                          : "text-left";

                      return (
                        <td
                          key={col.key}
                          className={cn("px-3.5 py-3", alignClass, col.className)}
                        >
                          {col.render
                            ? col.render(row, index)
                            : row[col.key] !== undefined && row[col.key] !== null
                            ? String(row[col.key])
                            : "—"}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border-light bg-surface-soft/40 text-xs text-text-muted">
          <div>
            Showing{" "}
            <span className="font-semibold text-text-primary">
              {data.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-text-primary">
              {pagination.totalCount || data.length}
            </span>{" "}
            results
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="xs"
              disabled={pagination.currentPage <= 1}
              onClick={() =>
                pagination.onPageChange &&
                pagination.onPageChange(pagination.currentPage - 1)
              }
              icon={ChevronLeft}
            >
              Previous
            </Button>

            <span className="px-2 text-text-primary font-medium">
              {pagination.currentPage || 1} / {pagination.totalPages || 1}
            </span>

            <Button
              variant="outline"
              size="xs"
              disabled={
                pagination.currentPage >= (pagination.totalPages || 1)
              }
              onClick={() =>
                pagination.onPageChange &&
                pagination.onPageChange(pagination.currentPage + 1)
              }
              rightIcon={ChevronRight}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
