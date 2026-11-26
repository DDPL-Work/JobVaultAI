import React from "react";

export default function IntegrationItem({
  iconLetter,
  iconBg,
  title,
  statusType = "not_setup",
  statusLabel = "Not set up",
  extraPill,
  description,
  steps,
  action,
  isLast = false,
}) {
  let pillClasses = "bg-[#F6F7F9] text-[#5A6777]";
  let dotColor = "bg-[#5A6777]";

  if (statusType === "ok" || statusType === "always_on" || statusType === "connected") {
    pillClasses = "bg-[#DCF0E3] text-[#24734A]";
    dotColor = "bg-[#24734A]";
  } else if (statusType === "info" || statusType === "in_use") {
    pillClasses = "bg-[#DCEAF5] text-[#235F8C]";
    dotColor = "bg-[#235F8C]";
  }

  return (
    <div
      className={`flex items-start gap-3.5 p-4 ${
        !isLast ? "border-b border-[#DCE1E8]" : ""
      }`}
    >
      {/* Icon Badge */}
      <div
        className="w-[40px] h-[40px] rounded-[8px] grid place-items-center font-['Bricolage_Grotesque',sans-serif] font-bold text-white text-[1.1rem] shrink-0 select-none shadow-xs"
        style={{ backgroundColor: iconBg }}
      >
        {iconLetter}
      </div>

      {/* Main Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {/* Title + Status Pill */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <b className="font-['Instrument_Sans',sans-serif] text-[0.88rem] font-bold text-[#15202C]">
            {title}
          </b>
          <span
            className={`inline-flex items-center gap-1.5 text-[0.72rem] font-semibold rounded-full px-2 py-0.5 leading-tight select-none ${pillClasses}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
            <span>{statusLabel}</span>
          </span>
          {extraPill}
        </div>

        {/* Description or Steps */}
        {description && (
          <span className="text-[#5A6777] text-[0.78rem] leading-normal">
            {description}
          </span>
        )}

        {steps && steps.length > 0 && (
          <ol className="list-decimal pl-4.5 text-[0.8rem] text-[#5A6777] flex flex-col gap-0.5 mt-1">
            {steps.map((step, idx) => (
              <li key={idx} className="leading-snug">
                {step}
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Optional Right Action Button */}
      {action && <div className="shrink-0 self-start">{action}</div>}
    </div>
  );
}

