import React from "react";
import ToggleSwitch from "./ToggleSwitch";
import { REQUIRABLE_COLUMNS } from "./columnsData";

export default function ColumnRow({
  column,
  index,
  letter,
  isFirst,
  isLast,
  isLastRow,
  onLabelChange,
  onToggleRequired,
  onToggleEnabled,
  onMove,
}) {
  const isRequirable = REQUIRABLE_COLUMNS.includes(column.key);
  const isTitle = column.key === "title";

  return (
    <div
      className={`grid grid-cols-[30px_minmax(0,1fr)_70px] sm:grid-cols-[30px_minmax(0,1fr)_110px_100px_70px] gap-2.5 items-center py-2 text-[0.84rem] ${
        !isLastRow ? "border-b border-[#DCE1E8]" : ""
      }`}
    >
      {/* Letter indicator */}
      <span className="w-[28px] h-[28px] flex items-center justify-center font-mono text-[0.75rem] bg-[#F6F7F9] border border-[#DCE1E8] rounded-[4px] text-[#15202C] select-none">
        {letter}
      </span>

      {/* Column Name Input */}
      <div className="min-w-0">
        <input
          type="text"
          value={column.label}
          onChange={(e) => onLabelChange(index, e.target.value)}
          aria-label="Column name"
          className="w-full h-[34px] border border-[#DCE1E8] rounded-[6px] px-2.5 py-1 text-[0.84rem] text-[#15202C] bg-white focus:outline-2 focus:outline-[#9C6B12] focus:outline-offset-[-1px] transition-colors"
        />
      </div>

      {/* Required Toggle or Automatic indicator */}
      <div className="hidden sm:flex items-center">
        {isRequirable ? (
          <ToggleSwitch
            checked={column.required}
            disabled={isTitle}
            onChange={(val) => onToggleRequired(index, val)}
            ariaLabel={`Required for ${column.label}`}
          />
        ) : (
          <span className="text-[#5A6777] text-[0.78rem]">Automatic</span>
        )}
      </div>

      {/* Move Up / Down Buttons */}
      <div className="hidden sm:flex items-center gap-1">
        <button
          type="button"
          disabled={isFirst}
          onClick={() => onMove(index, -1)}
          aria-label="Move up"
          className="w-6 h-6 flex items-center justify-center border border-[#DCE1E8] rounded-[4px] bg-white text-[#15202C] hover:border-[#5A6777] text-[0.8rem] font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ↑
        </button>
        <button
          type="button"
          disabled={isLast}
          onClick={() => onMove(index, 1)}
          aria-label="Move down"
          className="w-6 h-6 flex items-center justify-center border border-[#DCE1E8] rounded-[4px] bg-white text-[#15202C] hover:border-[#5A6777] text-[0.8rem] font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ↓
        </button>
      </div>

      {/* Include Toggle */}
      <div className="flex items-center">
        <ToggleSwitch
          checked={column.enabled}
          disabled={column.required || isTitle}
          onChange={(val) => onToggleEnabled(index, val)}
          ariaLabel={`Include ${column.label}`}
        />
      </div>
    </div>
  );
}

