import ScreenshotItem from "./ScreenshotItem";
import { ScreenshotsListSkeleton } from "../common/LoadingSkeletons";
import ErrorFallback from "../common/ErrorFallback";

export default function ScreenshotList({
  items = [],
  loading = false,
  error = null,
  queueInfo = "Queue is empty",
  onZoom,
  onDelete,
  onRetry,
  onRefresh,
  onOpenJob,
}) {
  return (
    <div className="w-full min-w-0 bg-white border border-[#DCE1E8] rounded-[8px] overflow-hidden shadow-[0_1px_2px_rgba(21,32,44,0.06)]">
      {/* Panel Header */}
      <div className="flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3.5 border-b border-[#DCE1E8] flex-wrap">
        <h2 className="font-['Bricolage_Grotesque',sans-serif] text-[1.08rem] font-bold text-[#15202C] m-0">
          Recent screenshots
        </h2>
        <span className="text-[0.78rem] text-[#5A6777] select-none font-normal">
          {queueInfo}
        </span>
      </div>

      {/* List Content */}
      <div>
        {loading && items.length === 0 ? (
          <ScreenshotsListSkeleton rows={4} />
        ) : error && items.length === 0 ? (
          <div className="p-4">
            <ErrorFallback
              title="Could not load screenshots"
              message={error}
              onRetry={onRefresh}
            />
          </div>
        ) : items.length > 0 ? (
          items.map((item) => (
            <ScreenshotItem
              key={item.id}
              item={item}
              onZoom={onZoom}
              onDelete={onDelete}
              onRetry={onRetry}
              onOpenJob={onOpenJob}
            />
          ))
        ) : (
          <div className="text-center py-12 px-4 flex flex-col items-center justify-center gap-1.5 text-[#5A6777]">
            <b className="text-[#15202C] text-[0.95rem]">No screenshots yet</b>
            <span className="text-[0.82rem]">Drop your first screenshots above.</span>
          </div>
        )}
      </div>
    </div>
  );
}

