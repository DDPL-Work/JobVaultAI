import React from "react";
import { SYSTEM_PROMPT } from "./aiData";

export default function AiInstructionsPanel({
  extraInstructions,
  onExtraInstructionsChange,
}) {
  return (
    <div className="bg-white border border-[#DCE1E8] rounded-[8px] overflow-hidden shadow-[0_1px_2px_rgba(21,32,44,0.06)]">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 p-3.5 px-4 border-b border-[#DCE1E8] flex-wrap">
        <h2 className="font-['Bricolage_Grotesque',sans-serif] text-[1.08rem] font-bold text-[#15202C] m-0">
          Extra instructions for the AI
        </h2>
        <span className="text-[#5A6777] text-[0.78rem]">
          Optional. Added to the built-in instructions below.
        </span>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-3">
        <textarea
          rows={4}
          value={extraInstructions}
          onChange={(e) => onExtraInstructionsChange(e.target.value)}
          placeholder="Example: Salaries written as '5L' mean 5 LPA. Treat 'WFH' as Remote. Ignore posts that are only training courses."
          className="w-full border border-[#DCE1E8] rounded-[6px] p-2.5 text-[0.84rem] text-[#15202C] bg-white focus:outline-2 focus:outline-[#9C6B12] focus:outline-offset-[-1px] transition-colors resize-y leading-relaxed placeholder:text-[#93A1B1]"
        />

        <details className="mt-1">
          <summary className="cursor-pointer text-[0.78rem] font-semibold text-[#5A6777] hover:text-[#15202C] transition-colors select-none">
            See the full instructions sent with each screenshot
          </summary>
          <pre className="mt-2.5 font-mono text-[0.74rem] whitespace-pre-wrap bg-white border border-[#DCE1E8] rounded-[6px] p-3 text-[#5A6777] max-h-[340px] overflow-auto leading-relaxed">
            {SYSTEM_PROMPT}
            {extraInstructions && extraInstructions.trim() ? (
              <>
                {"\n\nAdditional instructions from the admin:\n"}
                {extraInstructions.trim()}
              </>
            ) : null}
          </pre>
        </details>
      </div>
    </div>
  );
}

