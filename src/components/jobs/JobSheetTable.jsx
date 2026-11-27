import { useEffect, useRef, useCallback } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { SOURCE_COLORS, getJobVaults } from "./jobsData";
import { JobSheetTableSkeleton } from "../common/LoadingSkeletons";
import ConfidenceMeter from "../common/ConfidenceMeter";

export default function JobSheetTable({
  jobs = [],
  loading = false,
  refreshing = false,
  onRowClick,
  onRefresh,
  scrollContainerRef,
  onScrollStateChange,
}) {
  const internalScrollRef = useRef(null);
  const tableWrapperRef = scrollContainerRef || internalScrollRef;

  const syncScrollState = useCallback(() => {
    if (!onScrollStateChange) return;
    const el = tableWrapperRef.current;
    if (!el) {
      onScrollStateChange({ canScrollLeft: false, canScrollRight: false });
      return;
    }
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    onScrollStateChange({
      canScrollLeft: el.scrollLeft > 2,
      canScrollRight: maxScrollLeft > 2 && el.scrollLeft < maxScrollLeft - 2,
    });
  }, [onScrollStateChange, tableWrapperRef]);

  useEffect(() => {
    syncScrollState();
    const el = tableWrapperRef.current;
    if (!el) return;

    let observer;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => {
        syncScrollState();
      });
      observer.observe(el);
      if (el.firstElementChild) {
        observer.observe(el.firstElementChild);
      }
    }
    window.addEventListener("resize", syncScrollState);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", syncScrollState);
    };
  }, [syncScrollState, tableWrapperRef, jobs, loading]);
  const getStatusPill = (status) => {
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
      case "rejected":
        return {
          label: "Rejected",
          bg: "bg-[#F8DEDB]",
          text: "text-[#A8281F]",
          dot: "bg-[#A8281F]",
        };
      default:
        return {
          label: status,
          bg: "bg-[#F6F7F9]",
          text: "text-[#5A6777]",
          dot: "bg-[#5A6777]",
        };
    }
  };

  if (loading) {
    return <JobSheetTableSkeleton rows={8} />;
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-8 px-4 flex flex-col items-center justify-center gap-2 text-[#5A6777]">
        <svg
          viewBox="0 0 190 120"
          className="w-[170px] sm:w-[190px] h-auto mx-auto select-none pointer-events-none"
          aria-hidden="true"
        >
          {/* Spreadsheet / Job Sheet Card */}
          <rect
            x="24"
            y="10"
            width="142"
            height="92"
            rx="7"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="2.2"
          />
          {/* Window Top Header */}
          <line
            x1="24"
            y1="26"
            x2="166"
            y2="26"
            stroke="#CBD5E1"
            strokeWidth="1.8"
          />
          <circle cx="34" cy="18" r="2.2" fill="#15202C" />
          <circle cx="42" cy="18" r="2.2" fill="#94A3B8" />
          <circle cx="50" cy="18" r="2.2" fill="#15202C" />

          {/* Placeholder Rows */}
          <rect x="34" y="35" width="122" height="10" rx="2.5" fill="#F1F5F9" />
          <line x1="39" y1="40" x2="105" y2="40" stroke="#64748B" strokeWidth="2.4" strokeLinecap="round" />
          <line x1="112" y1="40" x2="132" y2="40" stroke="#94A3B8" strokeWidth="2.4" strokeLinecap="round" />
          <line x1="138" y1="40" x2="149" y2="40" stroke="#94A3B8" strokeWidth="2.4" strokeLinecap="round" />

          <line x1="38" y1="53" x2="88" y2="53" stroke="#CBD5E1" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="6 4" />
          <line x1="95" y1="53" x2="142" y2="53" stroke="#94A3B8" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="8 5" />

          <rect x="34" y="62" width="122" height="11" rx="2.5" fill="#F1F5F9" />
          <line x1="39" y1="67.5" x2="72" y2="67.5" stroke="#64748B" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="5 4" />
          <line x1="79" y1="67.5" x2="128" y2="67.5" stroke="#94A3B8" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="7 5" />

          <line x1="38" y1="82" x2="100" y2="82" stroke="#CBD5E1" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="5 5" />
          <line x1="108" y1="82" x2="146" y2="82" stroke="#CBD5E1" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="6 4" />

          {/* Moving Magnifying Glass Lens */}
          <g className="jv-lens-scan">
            {/* Subtle Lens Shadow */}
            <circle cx="97" cy="69" r="22" fill="#0F172A" opacity="0.06" />
            {/* Handle */}
            <line
              x1="111"
              y1="82"
              x2="126"
              y2="97"
              stroke="#15202C"
              strokeWidth="6.5"
              strokeLinecap="round"
            />
            <line
              x1="111"
              y1="82"
              x2="126"
              y2="97"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Glass Fill & Rim */}
            <circle
              cx="95"
              cy="66"
              r="20.5"
              fill="#E2E8F0"
              fillOpacity="0.55"
              stroke="#FFFFFF"
              strokeWidth="5"
            />
            <circle
              cx="95"
              cy="66"
              r="19.5"
              fill="#94A3B8"
              fillOpacity="0.22"
              stroke="#15202C"
              strokeWidth="3.2"
            />
            {/* Inner Lens Rim & Reflection */}
            <circle
              cx="95"
              cy="66"
              r="14.5"
              fill="none"
              stroke="#475569"
              strokeWidth="1.4"
              opacity="0.5"
            />
            <path
              d="M84 59 A13 13 0 0 1 97 53"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.4"
              strokeLinecap="round"
              opacity="0.9"
            />
            {/* Gold Accent Dot */}
            <circle
              cx="110"
              cy="49"
              r="7.5"
              fill="#9C6B12"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
          </g>
        </svg>

        <div className="flex flex-col items-center gap-0.5">
          <b className="text-[#15202C] text-[0.98rem] font-semibold">
            No jobs match
          </b>
          <span className="text-[0.82rem] max-w-md">
            Try another vault, status, or refresh to clear active filters and reload the job list.
          </span>
        </div>

        {onRefresh && (
          <button
            type="button"
            disabled={refreshing}
            onClick={onRefresh}
            className="mt-1 inline-flex items-center gap-2 border border-[#9C6B12] bg-[#9C6B12] hover:brightness-105 text-white rounded-[6px] px-4 py-1.5 text-[0.82rem] font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-60"
          >
            <FiRefreshCw
              className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            <span>{refreshing ? "Refreshing..." : "Refresh list"}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      ref={tableWrapperRef}
      onScroll={syncScrollState}
      className="w-full overflow-x-auto select-none"
    >
      <table className="w-full min-w-[960px] border-collapse text-[0.84rem] text-left">
        <thead>
          <tr className="bg-[#F6F7F9] border-b border-[#DCE1E8]">
            <th className="py-2.5 px-3 text-[0.7rem] uppercase tracking-[0.07em] font-semibold text-[#5A6777] whitespace-nowrap">
              ID
            </th>
            <th className="py-2.5 px-3 text-[0.7rem] uppercase tracking-[0.07em] font-semibold text-[#5A6777] whitespace-nowrap">
              Job title / company
            </th>
            <th className="py-2.5 px-3 text-[0.7rem] uppercase tracking-[0.07em] font-semibold text-[#5A6777] whitespace-nowrap">
              Location
            </th>
            <th className="py-2.5 px-3 text-[0.7rem] uppercase tracking-[0.07em] font-semibold text-[#5A6777] whitespace-nowrap">
              Experience
            </th>
            <th className="py-2.5 px-10 text-[0.7rem] uppercase tracking-[0.07em] font-semibold text-[#5A6777] whitespace-nowrap">
              Salary
            </th>
            <th className="py-2.5 px-3 text-[0.7rem] uppercase tracking-[0.07em] font-semibold text-[#5A6777] whitespace-nowrap">
              Vault
            </th>
            <th className="py-2.5 px-3 text-[0.7rem] uppercase tracking-[0.07em] font-semibold text-[#5A6777] whitespace-nowrap">
              Source
            </th>
            <th className="py-2.5 px-3 text-[0.7rem] uppercase tracking-[0.07em] font-semibold text-[#5A6777] whitespace-nowrap">
              Confidence
            </th>
            <th className="py-2.5 px-3 text-[0.7rem] uppercase tracking-[0.07em] font-semibold text-[#5A6777] whitespace-nowrap">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job, idx) => {
            const pill = getStatusPill(job.status);
            const sourceColor =
              SOURCE_COLORS[job.source_app] || SOURCE_COLORS.Other;

            return (
              <tr
                key={job.id}
                onClick={() => onRowClick?.(job)}
                className="hover:bg-[#F6F7F9] cursor-pointer transition-colors border-b border-[#DCE1E8] last:border-b-0"
              >
                {/* ID */}
                <td className="py-2.5 px-3 font-['IBM_Plex_Mono',monospace] text-[0.78rem] text-[#5A6777] whitespace-nowrap">
                  {job.code}
                </td>

                {/* Title / Company */}
                <td className="py-2.5 px-3 min-w-[200px]">
                  <b className="block font-semibold text-[0.85rem] text-[#15202C] leading-snug">
                    {job.title || "—"}
                  </b>
                  <span className="block text-[0.78rem] text-[#5A6777] mt-0.5">
                    {job.company || "—"}
                  </span>
                </td>

                {/* Location */}
                <td className="py-2.5 px-3 whitespace-nowrap text-[#15202C]">
                  <div>{job.location || "—"}</div>
                  {job.work_mode && (
                    <div className="text-[0.75rem] text-[#5A6777]">
                      {job.work_mode}
                    </div>
                  )}
                </td>

                {/* Experience */}
                <td className="py-2.5 px-3 font-['IBM_Plex_Mono',monospace] text-[0.82rem] text-[#15202C] whitespace-nowrap">
                  {job.experience || "—"}
                </td>

                {/* Salary */}
                <td className="py-2.5 px-3 text-[#15202C] align-middle">
                  <div className="max-w-[155px] whitespace-normal break-words leading-snug">
                    {job.salary || "—"}
                  </div>
                </td>

                {/* Vault (Supports Cross-Vault Dual-Routing Multi-Badges) */}
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {getJobVaults(job).map((v) => {
                      const isRemote = v.toLowerCase().includes("remote");
                      const isGlobal = v.toLowerCase().includes("global");
                      return (
                        <span
                          key={v}
                          className={`border rounded-[4px] px-[7px] py-[1.5px] text-[0.74rem] font-semibold inline-flex items-center gap-1 whitespace-nowrap ${
                            isRemote
                              ? "border-[#B5D4F4] bg-[#EAF2FB] text-[#1E568B]"
                              : isGlobal
                              ? "border-[#E1D4F4] bg-[#F5F0FB] text-[#5A2C91]"
                              : "border-[#DCE1E8] bg-[#F6F7F9] text-[#15202C]"
                          }`}
                        >
                          {isRemote && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1E568B] inline-block shrink-0" />
                          )}
                          {v}
                        </span>
                      );
                    })}
                  </div>
                </td>

                {/* Source */}
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 text-[0.76rem] font-semibold text-[#15202C]">
                    <i
                      className="w-2 h-2 rounded-[2px] inline-block shrink-0"
                      style={{ backgroundColor: sourceColor }}
                    />
                    {job.source_app || "Other"}
                  </span>
                </td>

                {/* Confidence */}
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <ConfidenceMeter
                    confidence={job.confidence}
                    delayMs={idx * 45}
                    animKey={job.id}
                  />
                </td>

                {/* Status */}
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[0.72rem] font-semibold rounded-[20px] px-2.5 py-0.5 select-none ${pill.bg} ${pill.text}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${pill.dot}`} />
                    {pill.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

