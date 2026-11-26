import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";

/**
 * Reusable Graceful Error Fallback Card / Banner with Retry Action
 */
export default function ErrorFallback({
  title = "Unable to sync live data",
  message = "The server took too long to respond or returned an error.",
  onRetry,
  compact = false,
  retrying = false,
}) {
  if (compact) {
    return (
      <div
        role="alert"
        className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-[8px] border border-[#F5C2C0] bg-[#FDF4F4] text-[#8E221A] text-[0.82rem] flex-wrap animate-in fade-in duration-200"
      >
        <div className="flex items-center gap-2 min-w-0">
          <FiAlertTriangle className="w-4 h-4 shrink-0 text-[#A8281F]" />
          <span className="truncate">
            <strong className="font-semibold">{title}:</strong> {message}
          </span>
        </div>
        {onRetry && (
          <button
            type="button"
            disabled={retrying}
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] bg-white hover:bg-[#FEF2F2] border border-[#E5A9A5] text-[#A8281F] font-semibold text-[0.76rem] transition-colors cursor-pointer disabled:opacity-50 shrink-0"
          >
            <FiRefreshCw className={`w-3 h-3 ${retrying ? "animate-spin" : ""}`} />
            <span>{retrying ? "Retrying..." : "Retry"}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="py-12 px-5 text-center flex flex-col items-center justify-center gap-2.5 bg-white border border-[#DCE1E8] rounded-[8px] animate-in fade-in duration-200"
    >
      <div className="w-10 h-10 rounded-full bg-[#FDF4F4] border border-[#F5C2C0] flex items-center justify-center text-[#A8281F]">
        <FiAlertTriangle className="w-5 h-5" />
      </div>
      <div className="flex flex-col gap-1 max-w-md">
        <b className="text-[#15202C] text-[0.98rem] font-semibold">{title}</b>
        <span className="text-[0.82rem] text-[#5A6777] leading-relaxed">
          {message}
        </span>
      </div>
      {onRetry && (
        <button
          type="button"
          disabled={retrying}
          onClick={onRetry}
          className="mt-1 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[6px] bg-[#9C6B12] hover:bg-[#83590E] text-white font-semibold text-[0.82rem] transition-all cursor-pointer shadow-xs disabled:opacity-50"
        >
          <FiRefreshCw className={`w-3.5 h-3.5 ${retrying ? "animate-spin" : ""}`} />
          <span>{retrying ? "Retrying..." : "Try again"}</span>
        </button>
      )}
    </div>
  );
}
