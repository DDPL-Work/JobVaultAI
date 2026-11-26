import { SOURCE_COLORS, getJobVaults } from "./jobsData";
import { JobSheetTableSkeleton } from "../common/LoadingSkeletons";

export default function JobSheetTable({
  jobs = [],
  loading = false,
  onRowClick,
}) {
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

  const getConfidenceInfo = (conf) => {
    const p = Math.round((conf || 0) * 100);
    let colorClass = "bg-[#24734A]";
    if (p < 60) colorClass = "bg-[#A8281F]";
    else if (p < 80) colorClass = "bg-[#9A5B00]";
    return { p, colorClass };
  };

  if (loading) {
    return <JobSheetTableSkeleton rows={8} />;
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-12 px-4 flex flex-col items-center justify-center gap-1.5 text-[#5A6777]">
        <b className="text-[#15202C] text-[0.95rem]">No jobs match</b>
        <span className="text-[0.82rem]">
          Try another vault or status, or clear the search.
        </span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto select-none">
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
            <th className="py-2.5 px-3 text-[0.7rem] uppercase tracking-[0.07em] font-semibold text-[#5A6777] whitespace-nowrap">
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
          {jobs.map((job) => {
            const pill = getStatusPill(job.status);
            const { p: confPercent, colorClass: confBg } = getConfidenceInfo(
              job.confidence
            );
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
                  <span
                    className="inline-flex items-center gap-1.5 font-['IBM_Plex_Mono',monospace] text-[0.78rem] text-[#15202C]"
                    title={`AI Confidence: ${confPercent}%`}
                  >
                    <span className="w-[38px] h-[5px] rounded-[3px] bg-[#F6F7F9] border border-[#DCE1E8] overflow-hidden inline-block shrink-0">
                      <i
                        className={`h-full block rounded-[2px] ${confBg}`}
                        style={{ width: `${confPercent}%` }}
                      />
                    </span>
                    <span>{confPercent}%</span>
                  </span>
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

