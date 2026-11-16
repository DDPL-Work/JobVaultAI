import { useState, useEffect } from "react";
import ColumnRow from "../components/columns/ColumnRow";
import { INITIAL_COLUMNS } from "../components/columns/columnsData";

export default function SheetColumns() {
  const [columns, setColumns] = useState(() => {
    try {
      const saved = localStorage.getItem("jobvault_columns");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback to initial
    }
    return INITIAL_COLUMNS;
  });

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const handleLabelChange = (index, newLabel) => {
    setColumns((prev) =>
      prev.map((col, i) => (i === index ? { ...col, label: newLabel } : col))
    );
  };

  const handleToggleRequired = (index, checked) => {
    setColumns((prev) =>
      prev.map((col, i) => {
        if (i === index) {
          return {
            ...col,
            required: checked,
            // If required is turned on, the column must be included/enabled
            enabled: checked ? true : col.enabled,
          };
        }
        return col;
      })
    );
  };

  const handleToggleEnabled = (index, checked) => {
    setColumns((prev) =>
      prev.map((col, i) => (i === index ? { ...col, enabled: checked } : col))
    );
  };

  const handleMove = (index, direction) => {
    setColumns((prev) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;

      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(targetIndex, 0, item);
      return next;
    });
  };

  const handleSaveColumns = () => {
    try {
      localStorage.setItem("jobvault_columns", JSON.stringify(columns));
    } catch {
      // ignore
    }
    showToast("Columns saved");
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-60 bg-[#15202C] text-white px-4 py-2.5 rounded-[6px] font-semibold text-[0.85rem] shadow-[0_10px_30px_rgba(21,32,44,0.2)] animate-in fade-in slide-in-from-bottom-2 duration-150 select-none">
          {toastMessage}
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <span className="text-[0.72rem] font-semibold text-[#5A6777] uppercase tracking-[0.08em] mb-1 block">
            ADMIN
          </span>
          <h1 className="font-['Bricolage_Grotesque',sans-serif] text-[1.65rem] font-bold text-[#15202C] tracking-[-0.01em] leading-tight m-0">
            Sheet columns
          </h1>
          <p className="mt-1 text-[#5A6777] max-w-[70ch] text-[0.875rem] leading-normal m-0">
            The columns in your Excel file and Google Sheet, in this order. A job missing a required field goes to review.
          </p>
        </div>

        {/* Action Button */}
        <div>
          <button
            type="button"
            onClick={handleSaveColumns}
            className="border border-[#9C6B12] bg-[#9C6B12] hover:brightness-105 text-white rounded-[6px] px-3.5 py-1.5 text-[0.85rem] font-semibold transition-all cursor-pointer shadow-sm select-none"
          >
            Save columns
          </button>
        </div>
      </div>

      {/* Columns Panel */}
      <div className="bg-white border border-[#DCE1E8] rounded-[8px] p-4 shadow-[0_1px_2px_rgba(21,32,44,0.06)]">
        {/* Table Column Headers */}
        <div className="grid grid-cols-[30px_minmax(0,1fr)_70px] sm:grid-cols-[30px_minmax(0,1fr)_110px_100px_70px] gap-2.5 items-center pb-2 text-[0.7rem] uppercase tracking-[0.08em] text-[#5A6777] font-semibold border-b border-[#DCE1E8] select-none">
          <span></span>
          <span>Column name</span>
          <span className="hidden sm:inline">Required</span>
          <span className="hidden sm:inline">Order</span>
          <span>Include</span>
        </div>

        {/* Column Rows */}
        <div className="flex flex-col">
          {columns.map((column, index) => {
            const letter = column.enabled
              ? String.fromCharCode(
                  65 + columns.slice(0, index).filter((x) => x.enabled).length
                )
              : "–";

            return (
              <ColumnRow
                key={column.key}
                column={column}
                index={index}
                letter={letter}
                isFirst={index === 0}
                isLast={index === columns.length - 1}
                isLastRow={index === columns.length - 1}
                onLabelChange={handleLabelChange}
                onToggleRequired={handleToggleRequired}
                onToggleEnabled={handleToggleEnabled}
                onMove={handleMove}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

