import { STAGES, STAGE_LABEL } from "./screenshotData";
import SafeImage from "../common/SafeImage";

export default function ScreenshotItem({
  item,
  onZoom,
  onDelete,
  onRetry,
  onOpenJob,
}) {
  const currentStageIndex = STAGES.indexOf(item.stage);

  // Status pill config
  const getPill = (status) => {
    switch (status) {
      case "synced":
        return {
          label: "In sheet",
          bg: "bg-[#DCF0E3]",
          text: "text-[#24734A]",
          dot: "bg-[#24734A]",
        };
      case "review":
        return {
          label: "Needs review",
          bg: "bg-[#FBEBCF]",
          text: "text-[#9A5B00]",
          dot: "bg-[#9A5B00]",
        };
      case "duplicate":
        return {
          label: "Duplicate",
          bg: "bg-[#EDF1F5]",
          text: "text-[#4F5B69]",
          dot: "bg-[#5A6777]",
        };
      case "failed":
        return {
          label: "Failed",
          bg: "bg-[#F8DEDB]",
          text: "text-[#A8281F]",
          dot: "bg-[#A8281F]",
        };
      default:
        return {
          label: status || "Working",
          bg: "bg-[#DCEAF5]",
          text: "text-[#235F8C]",
          dot: "bg-[#235F8C]",
        };
    }
  };

  return (
    <div className="grid grid-cols-[52px_minmax(0,1.2fr)_minmax(0,1.4fr)_minmax(0,1fr)_auto] max-[900px]:grid-cols-[52px_minmax(0,1fr)_auto] gap-3.5 items-center px-4 py-2.5 border-b border-[#DCE1E8] last:border-b-0 hover:bg-[#F9FAFC]/80 transition-colors">
      {/* 1. Thumbnail */}
      <div
        className="w-[52px] h-[68px] rounded-[4px] border border-[#DCE1E8] bg-[#F6F7F9] overflow-hidden cursor-zoom-in shrink-0 flex items-center justify-center"
        onClick={() => onZoom?.(item.image || "")}
        title="Click to view full screenshot"
      >
        <SafeImage
          src={item.image}
          alt={item.originalName}
          className="w-full h-full object-cover transition-transform hover:scale-105"
          fallbackClassName="w-full h-full"
        />
      </div>

      {/* 2. File details */}
      <div className="min-w-0 flex flex-col justify-center">
        <div
          className="font-['IBM_Plex_Mono',monospace] text-[0.76rem] font-medium text-[#15202C] truncate flex items-center gap-1.5"
          title={item.originalName || item.filename}
        >
          <span className="truncate">{item.originalName || item.filename}</span>
          {item.isCombined && (
            <span className="text-[0.62rem] font-bold bg-[#FAF4E8] text-[#9C6B12] border border-[#E5D2A8] rounded-[3px] px-1.5 py-0.2 shrink-0">
              {item.partsCount || "Multi"}-Part Combined
            </span>
          )}
          {item.isPdf && (
            <span className="text-[0.62rem] font-bold bg-[#FDF2F2] text-[#DC2626] border border-[#FCA5A5] rounded-[3px] px-1.5 py-0.2 shrink-0 flex items-center gap-1">
              <span>PDF</span>
              <span>Page {item.pageNumber || 1}</span>
            </span>
          )}
        </div>
        <div className="text-[0.75rem] text-[#5A6777] mt-0.5 truncate">
          {item.dateFormatted} · {item.origin || "Uploaded"}
          {item.sourceApp ? ` · ${item.sourceApp}` : ""}
          {item.isCombined ? ` · ${item.partsCount} parts merged` : ""}
          {item.isPdf ? ` · Rendered via pypdfium2 (~144 DPI)` : ""}
        </div>
      </div>

      {/* 3. Pipeline Progress Segments */}
      <div className="max-[900px]:col-span-full max-[900px]:pl-[66px] flex flex-col justify-center">
        <div className="grid grid-cols-5 gap-1 w-full max-w-[220px]">
          {STAGES.map((stageKey, i) => {
            let stateClass = "bg-[#F6F7F9] border-[#DCE1E8]";

            if (item.stage === "failed") {
              if (i === 0) stateClass = "bg-[#24734A] border-[#24734A]";
              else if (i === 1) stateClass = "bg-[#A8281F] border-[#A8281F]";
            } else if (item.stage === "saved" || i < currentStageIndex) {
              stateClass = "bg-[#24734A] border-[#24734A]";
            } else if (i === currentStageIndex) {
              stateClass = "bg-[#9C6B12] border-[#9C6B12] animate-pulse";
            }

            return (
              <i
                key={stageKey}
                className={`h-[6px] rounded-[3px] border block transition-colors ${stateClass}`}
              />
            );
          })}
        </div>
        <div className="text-[0.72rem] text-[#5A6777] mt-1">
          {item.stage === "failed"
            ? item.error || "Failed"
            : item.stage === "saved"
            ? "Done"
            : STAGE_LABEL[item.stage] || item.stage}
        </div>
      </div>

      {/* 4. Result jobs & status */}
      <div className="max-[900px]:col-span-full max-[900px]:pl-[66px] flex items-center gap-1.5 flex-wrap">
        {item.jobs && item.jobs.length > 0 ? (
          item.jobs.map((job) => {
            const pill = getPill(job.status);
            return (
              <button
                key={job.id}
                type="button"
                onClick={() => onOpenJob?.(job.id)}
                className="inline-flex items-center gap-2 px-2.5 py-1 bg-white border border-[#DCE1E8] rounded-[6px] hover:border-[#5A6777] transition-colors cursor-pointer select-none text-left"
                title={`Open ${job.code}`}
              >
                <span className="font-['IBM_Plex_Mono',monospace] text-[0.78rem] font-bold text-[#15202C]">
                  {job.code}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 text-[0.72rem] font-medium rounded-[20px] px-2 py-0.5 whitespace-nowrap select-none ${pill.bg} ${pill.text}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${pill.dot}`} />
                  {pill.label}
                </span>
              </button>
            );
          })
        ) : item.stage === "failed" ? (
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 text-[0.72rem] font-semibold rounded-[20px] px-2.5 py-0.5 bg-[#F8DEDB] text-[#A8281F]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A8281F]" />
              Failed
            </span>
            {onRetry && (
              <button
                type="button"
                onClick={() => onRetry(item.id)}
                className="text-[0.72rem] font-semibold px-2 py-0.5 rounded-[5px] border border-[#DCE1E8] bg-white hover:border-[#9C6B12] text-[#15202C] hover:text-[#9C6B12] transition-colors cursor-pointer"
                title="Retry reading screenshot"
              >
                Retry
              </button>
            )}
          </div>
        ) : item.stage !== "saved" ? (
          <span className="inline-flex items-center gap-1.5 text-[0.72rem] font-semibold rounded-[20px] px-2.5 py-0.5 bg-[#DCEAF5] text-[#235F8C]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#235F8C] animate-pulse" />
            Working
          </span>
        ) : (
          <span className="text-[0.72rem] text-[#5A6777]">No job found</span>
        )}
      </div>

      {/* 5. Delete Action Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onDelete?.(item.id)}
          className="w-[28px] h-[28px] border border-[#DCE1E8] rounded-[6px] bg-white hover:border-[#A8281F] hover:bg-[#F8DEDB]/30 text-[#A8281F] grid place-items-center transition-colors text-[0.8rem] cursor-pointer"
          title="Remove screenshot"
          aria-label="Remove screenshot"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
