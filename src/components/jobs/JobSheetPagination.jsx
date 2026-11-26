import React from "react";

export default function JobSheetPagination({
  totalItems = 0,
  currentPage = 1,
  pageSize = 8,
  onPageChange,
  onPageSizeChange,
}) {
  if (totalItems <= 0) return null;

  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers to show
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="border-t border-[#DCE1E8] px-3 sm:px-4 py-3 flex items-center justify-between flex-wrap gap-3 bg-white text-[0.84rem] select-none w-full min-w-0">
      {/* Left: Summary and Page Size Select */}
      <div className="flex items-center gap-3 text-[#5A6777] text-[0.8rem] flex-wrap">
        <span>
          Showing{" "}
          <span className="font-semibold font-mono text-[#15202C]">
            {startIndex}
          </span>{" "}
          to{" "}
          <span className="font-semibold font-mono text-[#15202C]">
            {endIndex}
          </span>{" "}
          of{" "}
          <span className="font-semibold font-mono text-[#15202C]">
            {totalItems}
          </span>{" "}
          jobs
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="border border-[#DCE1E8] rounded-[4px] px-1.5 py-0.5 text-[0.78rem] bg-white text-[#15202C] focus:outline-2 focus:outline-[#9C6B12] cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={8}>8</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        )}
      </div>

      {/* Right: Navigation Controls */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Previous Button */}
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="border border-[#DCE1E8] rounded-[6px] px-2.5 py-1 text-[0.78rem] font-semibold text-[#15202C] bg-white hover:border-[#5A6777] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          aria-label="Previous page"
        >
          ← Prev
        </button>

        {/* Page Number Buttons */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page) => {
            const isActive = page === currentPage;
            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                className={`w-7 h-7 rounded-[6px] text-[0.78rem] font-semibold transition-colors flex items-center justify-center font-mono cursor-pointer ${
                  isActive
                    ? "bg-[#9C6B12] text-white border border-[#9C6B12] shadow-xs"
                    : "border border-[#DCE1E8] text-[#15202C] bg-white hover:border-[#5A6777]"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="border border-[#DCE1E8] rounded-[6px] px-2.5 py-1 text-[0.78rem] font-semibold text-[#15202C] bg-white hover:border-[#5A6777] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          aria-label="Next page"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

