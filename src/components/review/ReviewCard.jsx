import { useState } from "react";
import { SOURCE_COLORS } from "../jobs/jobsData";

export default function ReviewCard({
  job,
  onApprove,
  onReject,
  onZoomImage,
}) {
  const [formData, setFormData] = useState({ ...job });

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const isFlagged = (fieldName) => {
    return job.flags && job.flags.includes(fieldName);
  };

  const getConfidenceInfo = (conf) => {
    const p = Math.round((conf || 0) * 100);
    let colorClass = "bg-[#24734A]";
    if (p < 60) colorClass = "bg-[#A8281F]";
    else if (p < 80) colorClass = "bg-[#9A5B00]";
    return { p, colorClass };
  };

  const { p: confPercent, colorClass: confBg } = getConfidenceInfo(job.confidence);
  const sourceColor = SOURCE_COLORS[job.source_app] || SOURCE_COLORS.Other;

  return (
    <div className="grid grid-cols-[300px_minmax(0,1fr)] max-[900px]:grid-cols-1 border-t border-[#DCE1E8] first:border-t-0">
      {/* Left Column: Image preview & OCR text */}
      <div className="p-3 bg-[#F6F7F9] border-r border-[#DCE1E8] max-[900px]:border-r-0 max-[900px]:border-b flex flex-col gap-2">
        {job.image && (
          <img
            src={job.image}
            alt={`Screenshot for ${job.code}`}
            onClick={() => onZoomImage?.(job.image)}
            className="w-full max-h-[440px] object-contain rounded-[6px] border border-[#DCE1E8] bg-white cursor-zoom-in hover:opacity-95 transition-opacity"
            loading="lazy"
          />
        )}

        <details className="text-[0.78rem] text-[#5A6777] select-none">
          <summary className="cursor-pointer font-semibold hover:text-[#15202C] py-1 select-none">
            Text the AI read from the image
          </summary>
          <pre className="font-['IBM_Plex_Mono',monospace] text-[0.74rem] whitespace-pre-wrap bg-white border border-[#DCE1E8] rounded-[6px] p-2.5 text-[#5A6777] max-h-[220px] overflow-auto mt-1.5">
            {job.raw_text}
          </pre>
        </details>
      </div>

      {/* Right Column: Editable form & metadata */}
      <div className="p-4 flex flex-col justify-between gap-3.5 min-w-0 bg-white">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <b className="font-['IBM_Plex_Mono',monospace] text-[0.8rem] text-[#15202C]">
              {job.code}
            </b>
            <span className="inline-flex items-center gap-1.5 text-[0.76rem] font-semibold text-[#15202C]">
              <i
                className="w-2 h-2 rounded-[2px] inline-block shrink-0"
                style={{ backgroundColor: sourceColor }}
              />
              {job.source_app}
            </span>
            <span
              className="inline-flex items-center gap-1.5 font-['IBM_Plex_Mono',monospace] text-[0.78rem] text-[#15202C]"
              title={`Confidence: ${confPercent}%`}
            >
              <span className="w-[38px] h-[5px] rounded-[3px] bg-[#F6F7F9] border border-[#DCE1E8] overflow-hidden inline-block shrink-0">
                <i
                  className={`h-full block rounded-[2px] ${confBg}`}
                  style={{ width: `${confPercent}%` }}
                />
              </span>
              <span>{confPercent}%</span>
            </span>
          </div>

          {/* Status Badge */}
          <span className="inline-flex items-center gap-1.5 text-[0.72rem] font-semibold rounded-[20px] px-2.5 py-0.5 bg-[#FBEBCF] text-[#9A5B00] select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9A5B00]" />
            {job.statusBadge || "Needs review"}
          </span>
        </div>

        {/* Form Fields Grid */}
        <div className="grid grid-cols-2 max-[620px]:grid-cols-1 gap-3 pt-1">
          {/* 1. Job Title */}
          <div className="flex flex-col gap-1 min-w-0">
            <label className="text-[0.74rem] font-semibold text-[#5A6777]">
              Job title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="border border-[#DCE1E8] bg-white rounded-[6px] px-2.5 py-1 text-[0.82rem] h-[32px] text-[#15202C] focus:outline-none focus:border-[#9C6B12]"
            />
            <span className="text-[0.72rem] text-[#5A6777] font-['IBM_Plex_Mono',monospace] truncate">
              {job.evidence?.title ? `from image: “${job.evidence.title}”` : ""}
            </span>
          </div>

          {/* 2. Company */}
          <div className="flex flex-col gap-1 min-w-0">
            <label className="text-[0.74rem] font-semibold text-[#5A6777] flex items-center gap-1.5">
              <span>Company</span>
              {isFlagged("company") && (
                <span className="text-[0.68rem] font-semibold text-[#9A5B00] bg-[#FBEBCF] rounded-[10px] px-1.5 py-0.2 select-none">
                  check
                </span>
              )}
            </label>
            <input
              type="text"
              value={formData.company}
              placeholder={isFlagged("company") ? "Not readable in image" : ""}
              onChange={(e) => handleChange("company", e.target.value)}
              className={`rounded-[6px] px-2.5 py-1 text-[0.82rem] h-[32px] text-[#15202C] focus:outline-none ${
                isFlagged("company")
                  ? "border border-[#9A5B00] bg-[#FBEBCF] placeholder:text-[#9A5B00]/70"
                  : "border border-[#DCE1E8] bg-white focus:border-[#9C6B12]"
              }`}
            />
            <span
              className={`text-[0.72rem] font-['IBM_Plex_Mono',monospace] truncate ${
                isFlagged("company") ? "text-[#9A5B00]" : "text-[#5A6777]"
              }`}
            >
              {isFlagged("company")
                ? "not found in the image text"
                : job.evidence?.company
                ? `from image: “${job.evidence.company}”`
                : ""}
            </span>
          </div>

          {/* 3. Location */}
          <div className="flex flex-col gap-1 min-w-0">
            <label className="text-[0.74rem] font-semibold text-[#5A6777] flex items-center gap-1.5">
              <span>Location</span>
              {isFlagged("location") && (
                <span className="text-[0.68rem] font-semibold text-[#9A5B00] bg-[#FBEBCF] rounded-[10px] px-1.5 py-0.2 select-none">
                  check
                </span>
              )}
            </label>
            <input
              type="text"
              value={formData.location}
              placeholder={isFlagged("location") ? "Not readable in image" : ""}
              onChange={(e) => handleChange("location", e.target.value)}
              className={`rounded-[6px] px-2.5 py-1 text-[0.82rem] h-[32px] text-[#15202C] focus:outline-none ${
                isFlagged("location")
                  ? "border border-[#9A5B00] bg-[#FBEBCF] placeholder:text-[#9A5B00]/70"
                  : "border border-[#DCE1E8] bg-white focus:border-[#9C6B12]"
              }`}
            />
            <span
              className={`text-[0.72rem] font-['IBM_Plex_Mono',monospace] truncate ${
                isFlagged("location") ? "text-[#9A5B00]" : "text-[#5A6777]"
              }`}
            >
              {isFlagged("location")
                ? "not found in the image text"
                : job.evidence?.location
                ? `from image: “${job.evidence.location}”`
                : ""}
            </span>
          </div>

          {/* 4. Experience (years) min - to - max */}
          <div className="flex flex-col gap-1 min-w-0">
            <label className="text-[0.74rem] font-semibold text-[#5A6777] flex items-center gap-1.5">
              <span>Experience (years)</span>
              {isFlagged("exp_min") && (
                <span className="text-[0.68rem] font-semibold text-[#9A5B00] bg-[#FBEBCF] rounded-[10px] px-1.5 py-0.2 select-none">
                  check
                </span>
              )}
            </label>
            <div className="flex items-center gap-2 max-w-[200px]">
              <input
                type="text"
                placeholder="min"
                value={formData.exp_min}
                onChange={(e) => handleChange("exp_min", e.target.value)}
                className={`w-full min-w-0 font-['IBM_Plex_Mono',monospace] rounded-[6px] px-2.5 py-1 text-[0.82rem] h-[32px] text-[#15202C] focus:outline-none ${
                  isFlagged("exp_min")
                    ? "border border-[#9A5B00] bg-[#FBEBCF]"
                    : "border border-[#DCE1E8] bg-white focus:border-[#9C6B12]"
                }`}
              />
              <span className="text-[0.78rem] text-[#5A6777] shrink-0 select-none">to</span>
              <input
                type="text"
                placeholder="max"
                value={formData.exp_max}
                onChange={(e) => handleChange("exp_max", e.target.value)}
                className={`w-full min-w-0 font-['IBM_Plex_Mono',monospace] rounded-[6px] px-2.5 py-1 text-[0.82rem] h-[32px] text-[#15202C] focus:outline-none ${
                  isFlagged("exp_min")
                    ? "border border-[#9A5B00] bg-[#FBEBCF]"
                    : "border border-[#DCE1E8] bg-white focus:border-[#9C6B12]"
                }`}
              />
            </div>
            <span
              className={`text-[0.72rem] font-['IBM_Plex_Mono',monospace] truncate ${
                isFlagged("exp_min") ? "text-[#9A5B00]" : "text-[#5A6777]"
              }`}
            >
              {isFlagged("exp_min")
                ? "not found in the image text"
                : job.evidence?.exp
                ? `from image: “${job.evidence.exp}”`
                : ""}
            </span>
          </div>

          {/* 5. Salary / CTC */}
          <div className="flex flex-col gap-1 min-w-0">
            <label className="text-[0.74rem] font-semibold text-[#5A6777]">
              Salary / CTC
            </label>
            <input
              type="text"
              value={formData.salary}
              onChange={(e) => handleChange("salary", e.target.value)}
              className="border border-[#DCE1E8] bg-white rounded-[6px] px-2.5 py-1 text-[0.82rem] h-[32px] text-[#15202C] focus:outline-none focus:border-[#9C6B12]"
            />
            <span className="text-[0.72rem] text-[#5A6777] font-['IBM_Plex_Mono',monospace] truncate">
              {job.evidence?.salary ? `from image: “${job.evidence.salary}”` : ""}
            </span>
          </div>

          {/* 6. Work mode */}
          <div className="flex flex-col gap-1 min-w-0">
            <label className="text-[0.74rem] font-semibold text-[#5A6777]">
              Work mode
            </label>
            <select
              value={formData.work_mode}
              onChange={(e) => handleChange("work_mode", e.target.value)}
              className="border border-[#DCE1E8] bg-white rounded-[6px] px-2.5 py-1 text-[0.82rem] h-[32px] text-[#15202C] focus:outline-none focus:border-[#9C6B12] cursor-pointer"
            >
              <option value="Not stated">Not stated</option>
              <option value="Onsite">Onsite</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          {/* 7. Country */}
          <div className="flex flex-col gap-1 min-w-0">
            <label className="text-[0.74rem] font-semibold text-[#5A6777]">
              Country
            </label>
            <input
              type="text"
              placeholder="e.g. India"
              value={formData.country}
              onChange={(e) => handleChange("country", e.target.value)}
              className="border border-[#DCE1E8] bg-white rounded-[6px] px-2.5 py-1 text-[0.82rem] h-[32px] text-[#15202C] focus:outline-none focus:border-[#9C6B12]"
            />
          </div>

          {/* 8. Apply link / contact */}
          <div className="flex flex-col gap-1 min-w-0">
            <label className="text-[0.74rem] font-semibold text-[#5A6777]">
              Apply link / contact
            </label>
            <input
              type="text"
              value={formData.apply_contact}
              onChange={(e) => handleChange("apply_contact", e.target.value)}
              className="border border-[#DCE1E8] bg-white rounded-[6px] px-2.5 py-1 text-[0.82rem] h-[32px] text-[#15202C] focus:outline-none focus:border-[#9C6B12]"
            />
            <span className="text-[0.72rem] text-[#5A6777] font-['IBM_Plex_Mono',monospace] truncate">
              {job.evidence?.apply_contact
                ? `from image: “${job.evidence.apply_contact}”`
                : ""}
            </span>
          </div>
        </div>

        {/* Bottom Actions Row */}
        <div className="flex items-center justify-between gap-3 pt-3 mt-1 border-t border-[#DCE1E8]/70 flex-wrap">
          <span className="text-[0.78rem] text-[#5A6777]">
            Goes to vault{" "}
            <b className="text-[#15202C] font-semibold">{job.vault}</b>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onReject?.(job.id)}
              className="border border-[#DCE1E8] bg-white hover:bg-[#F8DEDB] text-[#A8281F] rounded-[6px] px-3.5 py-1 text-[0.8rem] font-semibold transition-colors cursor-pointer"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={() => onApprove?.(formData)}
              className="bg-[#24734A] hover:brightness-105 text-white rounded-[6px] px-3.5 py-1 text-[0.8rem] font-semibold transition-all cursor-pointer shadow-sm"
            >
              Approve & add to sheet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

