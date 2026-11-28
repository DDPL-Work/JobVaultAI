import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiRefreshCw } from "react-icons/fi";
import ActivityLogRow from "../components/activity/ActivityLogRow";
import ErrorFallback from "../components/common/ErrorFallback";
import PaginationControls from "../components/common/PaginationControls";
import { ActivityLogSkeleton } from "../components/common/LoadingSkeletons";
import { fetchActivityLogs } from "../apis/thunks/activityThunks";
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  getEffectivePaginationView,
  getRequestServerPage,
} from "../utils/pagination";

export default function ActivityLog() {
  const dispatch = useDispatch();
  const { items: logs, pagination, loading, loaded, error } = useSelector(
    (state) => state.activity
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const serverPage = getRequestServerPage(currentPage, pageSize, pagination);
  const paginationView = getEffectivePaginationView(
    logs,
    pagination,
    currentPage,
    pageSize
  );

  useEffect(() => {
    dispatch(fetchActivityLogs({ page: serverPage, page_size: pageSize }));
  }, [dispatch, serverPage, pageSize]);

  const totalEntries = paginationView.total;

  return (
    <div className="flex flex-col gap-5">
      {/* Page Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[260px]">
          <span className="text-[0.72rem] font-semibold text-[#5A6777] uppercase tracking-[0.08em] mb-1 block">
            ADMIN
          </span>
          <h1 className="font-['Bricolage_Grotesque',sans-serif] text-[1.65rem] font-bold text-[#15202C] tracking-[-0.01em] leading-tight m-0">
            Activity log
          </h1>
          <p className="mt-1 text-[#5A6777] max-w-[70ch] text-[0.875rem] leading-normal m-0">
            Everything the system did, newest first.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 shrink-0 ml-auto">
          {loaded && (
            <span className="text-[0.78rem] font-medium text-[#5A6777]">
              {totalEntries} {totalEntries === 1 ? "entry" : "entries"}
            </span>
          )}
          <button
            type="button"
            disabled={loading}
            onClick={() =>
              dispatch(fetchActivityLogs({ page: serverPage, page_size: pageSize }))
            }
            className="inline-flex items-center gap-1.5 border border-[#DCE1E8] bg-white hover:border-[#5A6777] rounded-[6px] px-3 py-1.5 text-[0.8rem] font-semibold text-[#15202C] transition-colors cursor-pointer select-none disabled:opacity-50"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Compact Error Banner when cached logs exist */}
      {error && loaded && (
        <ErrorFallback
          compact
          title="Could not sync activity log"
          message={error}
          onRetry={() =>
            dispatch(fetchActivityLogs({ page: serverPage, page_size: pageSize }))
          }
          retrying={loading}
        />
      )}

      {/* Main Content */}
      {loading && !loaded ? (
        <ActivityLogSkeleton />
      ) : error && !loaded ? (
        <ErrorFallback
          title="Could not load activity log"
          message={error}
          onRetry={() =>
            dispatch(fetchActivityLogs({ page: serverPage, page_size: pageSize }))
          }
          retrying={loading}
        />
      ) : (
        <div className="bg-white border border-[#DCE1E8] rounded-[8px] overflow-hidden shadow-[0_1px_2px_rgba(21,32,44,0.06)]">
          {paginationView.visibleItems.length > 0 ? (
            paginationView.visibleItems.map((item, index) => (
              <ActivityLogRow
                key={item.id || index}
                item={item}
                isLast={index === paginationView.visibleItems.length - 1}
              />
            ))
          ) : (
            <div className="p-10 text-center text-[#5A6777]">Nothing yet.</div>
          )}

          {/* Server-Side Pagination Controls */}
          <PaginationControls
            totalItems={paginationView.total}
            currentPage={paginationView.page}
            pageSize={pageSize}
            totalPages={paginationView.totalPages}
            hasNext={paginationView.hasNext}
            hasPrev={paginationView.hasPrev}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            itemLabel="entries"
            loading={loading}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
}
