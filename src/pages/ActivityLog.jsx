import React, { useState } from "react";
import { INITIAL_ACTIVITY_LOGS } from "../components/activity/activityData";
import ActivityLogRow from "../components/activity/ActivityLogRow";

export default function ActivityLog() {
  const [logs] = useState(() => {
    try {
      const saved = localStorage.getItem("jobvault_activity_logs");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback to initial
    }
    return INITIAL_ACTIVITY_LOGS;
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Page Header */}
      <div>
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

      {/* Log Panel */}
      <div className="bg-white border border-[#DCE1E8] rounded-[8px] overflow-hidden shadow-[0_1px_2px_rgba(21,32,44,0.06)]">
        {logs.length > 0 ? (
          logs.map((item, index) => (
            <ActivityLogRow
              key={item.id || index}
              item={item}
              isLast={index === logs.length - 1}
            />
          ))
        ) : (
          <div className="p-10 text-center text-[#5A6777]">Nothing yet.</div>
        )}
      </div>
    </div>
  );
}

