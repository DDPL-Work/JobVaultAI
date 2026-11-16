import React from "react";
import ToggleSwitch from "../columns/ToggleSwitch";

export default function AiChecksPanel({
  threshold,
  onThresholdChange,
  strict,
  onStrictChange,
  dedupe,
  onDedupeChange,
  dedupeDays,
  onDedupeDaysChange,
}) {
  return (
    <div className="bg-white border border-[#DCE1E8] rounded-[8px] overflow-hidden shadow-[0_1px_2px_rgba(21,32,44,0.06)] flex flex-col">
      {/* Panel Header */}
      <div className="p-3.5 px-4 border-b border-[#DCE1E8]">
        <h2 className="font-['Bricolage_Grotesque',sans-serif] text-[1.08rem] font-bold text-[#15202C] m-0">
          Checks
        </h2>
      </div>

      {/* Panel Body */}
      <div className="p-4 py-1 flex flex-col">
        {/* Slider Row */}
        <div className="py-3 border-b border-[#DCE1E8] flex flex-col gap-1">
          <label
            htmlFor="confidence-threshold"
            className="text-[0.82rem] font-medium text-[#15202C]"
          >
            Add to sheet automatically at{" "}
            <span className="font-mono font-semibold text-[#15202C]">
              {threshold}%
            </span>{" "}
            confidence or higher
          </label>
          <input
            id="confidence-threshold"
            type="range"
            min="50"
            max="99"
            value={threshold}
            onChange={(e) => onThresholdChange(Number(e.target.value))}
            className="w-full cursor-pointer accent-[#9C6B12] mt-1 mb-1"
          />
          <span className="text-[#5A6777] text-[0.75rem]">
            Below this, the job waits in the review queue
          </span>
        </div>

        {/* Never Guess a Value Switch Row */}
        <div className="py-3 border-b border-[#DCE1E8] flex items-start gap-3 select-none">
          <div className="shrink-0 pt-0.5">
            <ToggleSwitch
              checked={strict}
              onChange={onStrictChange}
              ariaLabel="Never guess a value"
            />
          </div>
          <div className="flex flex-col cursor-pointer" onClick={() => onStrictChange(!strict)}>
            <b className="font-['Instrument_Sans',sans-serif] text-[0.86rem] font-bold text-[#15202C] leading-snug">
              Never guess a value
            </b>
            <span className="text-[#5A6777] text-[0.78rem] leading-normal mt-0.5">
              Clear any value that is not in the screenshot text
            </span>
          </div>
        </div>

        {/* Skip Duplicate Jobs Switch Row */}
        <div className="py-3 flex items-start gap-3 select-none">
          <div className="shrink-0 pt-0.5">
            <ToggleSwitch
              checked={dedupe}
              onChange={onDedupeChange}
              ariaLabel="Skip duplicate jobs"
            />
          </div>
          <div className="flex flex-col">
            <b
              className="font-['Instrument_Sans',sans-serif] text-[0.86rem] font-bold text-[#15202C] leading-snug cursor-pointer"
              onClick={() => onDedupeChange(!dedupe)}
            >
              Skip duplicate jobs
            </b>
            <span className="text-[#5A6777] text-[0.78rem] leading-normal mt-0.5 flex items-center flex-wrap">
              <span>Same title, company and apply link within</span>
              <input
                type="text"
                inputMode="numeric"
                value={dedupeDays}
                onChange={(e) => onDedupeDaysChange(e.target.value)}
                className="w-[48px] h-[24px] mx-1.5 px-1 text-center font-mono text-[0.78rem] border border-[#DCE1E8] rounded-[4px] bg-[#F6F7F9] text-[#15202C] focus:outline-2 focus:outline-[#9C6B12] focus:bg-white transition-colors"
                aria-label="Duplicate window in days"
              />
              <span>days</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

