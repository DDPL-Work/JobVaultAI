import React, { useMemo } from "react";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "../../utils/pagination";

function buildPageSlots(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, idx) => idx + 1);
  }

  const slots = [1];
  const left = Math.max(2, currentPage - 1);
  const right = Math.min(totalPages - 1, currentPage + 1);

  if (left > 2) slots.push("ellipsis-left");
  for (let p = left; p <= right; p++) {
    slots.push(p);
  }
  if (right < totalPages - 1) slots.push("ellipsis-right");
  slots.push(totalPages);

  return slots;
}

export default function PaginationControls({
  totalItems = 0,
  currentPage = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  totalPages: totalPagesProp,
  hasNext: hasNextProp,
  hasPrev: hasPrevProp,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  itemLabel = "items",
  loading = false,
  onPageChange,
  onPageSizeChange,
}) {
  const safeTotal = Math.max(0, Number(totalItems) || 0);
  const safePageSize = Math.max(1, Number(pageSize) || DEFAULT_PAGE_SIZE);
  const safeTotalPages = Math.max(
    1,
    Number(totalPagesProp) || Math.ceil(safeTotal / safePageSize) || 1
  );
  const safePage = Math.min(safeTotalPages, Math.max(1, Number(currentPage) || 1));

  const slots = useMemo(
    () => buildPageSlots(safePage, safeTotalPages),
    [safePage, safeTotalPages]
  );

  if (safeTotal <= 0) return null;

  const startIndex = (safePage - 1) * safePageSize + 1;
  const endIndex = Math.min(safePage * safePageSize, safeTotal);
  const canPrev = typeof hasPrevProp === "boolean" ? hasPrevProp : safePage > 1;
  const canNext =
    typeof hasNextProp === "boolean" ? hasNextProp : safePage < safeTotalPages;

  return (
    <div className="border-t border-[#DCE1E8] px-3 sm:px-4 py-3 flex items-center justify-between flex-wrap gap-3 bg-white text-[0.84rem] select-none w-full min-w-0">
      {/* Left: Summary & Per-Page Limit Selector */}
      <div className="flex items-center gap-3 text-[#5A6777] text-[0.8rem] flex-wrap">
        <span>
          Showing{" "}
          <span className="font-semibold font-mono text-[#15202C]">
            {startIndex}
          </span>
          –
          <span className="font-semibold font-mono text-[#15202C]">
            {endIndex}
          </span>{" "}
          of{" "}
          <span className="font-semibold font-mono text-[#15202C]">
            {safeTotal}
          </span>{" "}
          {itemLabel}
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-1">
            <span>Rows:</span>
            <select
              value={safePageSize}
              disabled={loading}
              aria-label={`Rows per page for ${itemLabel}`}
              onChange={(e) => {
                const nextSize = Number(e.target.value);
                onPageSizeChange(nextSize);
                if (safePage !== 1) onPageChange?.(1);
              }}
              className="border border-[#DCE1E8] rounded-[4px] px-1.5 py-0.5 text-[0.78rem] bg-white text-[#15202C] focus:outline-2 focus:outline-[#9C6B12] cursor-pointer disabled:opacity-50"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Navigation Controls */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          disabled={loading || !canPrev}
          onClick={() => onPageChange?.(safePage - 1)}
          className="border border-[#DCE1E8] rounded-[6px] px-2.5 py-1 text-[0.78rem] font-semibold text-[#15202C] bg-white hover:border-[#5A6777] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          aria-label="Previous page"
        >
          « Previous
        </button>

        <div className="flex items-center gap-1">
          {slots.map((slot) => {
            if (typeof slot === "string") {
              return (
                <span
                  key={slot}
                  className="px-1 text-[0.78rem] text-[#5A6777] select-none"
                >
                  …
                </span>
              );
            }
            const isActive = slot === safePage;
            return (
              <button
                key={slot}
                type="button"
                disabled={loading}
                onClick={() => onPageChange?.(slot)}
                className={`min-w-[28px] h-7 px-1.5 rounded-[6px] text-[0.78rem] font-semibold transition-colors flex items-center justify-center font-mono cursor-pointer disabled:opacity-60 ${
                  isActive
                    ? "bg-[#9C6B12] text-white border border-[#9C6B12] shadow-xs"
                    : "border border-[#DCE1E8] text-[#15202C] bg-white hover:border-[#5A6777]"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {slot}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={loading || !canNext}
          onClick={() => onPageChange?.(safePage + 1)}
          className="border border-[#DCE1E8] rounded-[6px] px-2.5 py-1 text-[0.78rem] font-semibold text-[#15202C] bg-white hover:border-[#5A6777] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          aria-label="Next page"
        >
          Next »
        </button>
      </div>
    </div>
  );
}
