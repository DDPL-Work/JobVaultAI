import React from "react";

export default function ActivityLogRow({ item, isLast = false }) {
  return (
    <div
      className={`grid grid-cols-[160px_130px_minmax(0,1fr)] max-[620px]:grid-cols-1 gap-3 max-[620px]:gap-0.5 px-4 py-[9px] text-[0.84rem] items-center ${
        !isLast ? "border-b border-[#DCE1E8]" : ""
      }`}
    >
      <span className="font-mono text-[#5A6777] text-[0.78rem] whitespace-nowrap">
        {item.at}
      </span>
      <b className="font-['Instrument_Sans',sans-serif] font-bold text-[#15202C] truncate">
        {item.actor}
      </b>
      <span className="text-[#15202C] leading-normal break-words">
        {item.message}
      </span>
    </div>
  );
}

