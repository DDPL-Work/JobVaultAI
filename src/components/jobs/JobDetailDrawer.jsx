import { useState, useEffect } from "react";
import { SOURCE_COLORS, VAULTS } from "./jobsData";

export default function JobDetailDrawer({
  job,
  onClose,
  onZoomImage,
  onStatusChange,
  onOpenJobId,
  onJobUpdate,
}) {
  const [mountedJob, setMountedJob] = useState(job);
  const [isClosing, setIsClosing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formFields, setFormFields] = useState({});

  // Synchronize incoming job prop with internal mounting and closing state
  useEffect(() => {
    if (job) {
      setMountedJob(job);
      setIsClosing(false);
      setIsEditing(false);
      setFormFields({ ...job });
    } else if (mountedJob && !isClosing) {
      // Parent set job to null -> trigger smooth close animation
      setIsClosing(true);
      const timer = setTimeout(() => {
        setMountedJob(null);
        setIsClosing(false);
      }, 260);
      return () => clearTimeout(timer);
    }
  }, [job]);

  // Handle escape key
  useEffect(() => {
    if (!mountedJob) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mountedJob, isClosing]);

  // Smooth exit handler
  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setMountedJob(null);
      onClose?.();
    }, 260);
  };

  const handleStatus = (newStatus) => {
    if (!mountedJob) return;
    onStatusChange?.(mountedJob.id, newStatus);
    setMountedJob((prev) => (prev ? { ...prev, status: newStatus } : prev));
  };

  const handleSave = (e) => {
    e?.preventDefault();
    if (!mountedJob) return;
    const updated = {
      ...mountedJob,
      ...formFields,
    };
    setMountedJob(updated);
    setIsEditing(false);
    onJobUpdate?.(updated);
  };

  if (!mountedJob && !job) return null;

  const activeJob = mountedJob || job;

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

  const pill = getStatusPill(activeJob.status);
  const confPercent = Math.round((activeJob.confidence || 0) * 100);
  const confColor =
    confPercent >= 80 ? "#24734A" : confPercent >= 60 ? "#9A5B00" : "#A8281F";
  const sourceColor =
    SOURCE_COLORS[activeJob.source_app] ||
    SOURCE_COLORS[activeJob.source] ||
    SOURCE_COLORS.Other;

  // 11 fields strictly matching the reference order in dashboard.html
  const fieldDefs = [
    { key: "title", label: "Job title" },
    { key: "sector", label: "Sector" },
    { key: "company", label: "Company" },
    { key: "location", label: "Location" },
    { key: "country", label: "Country" },
    { key: "experience", label: "Experience" },
    { key: "salary", label: "Salary / CTC" },
    { key: "qualification", label: "Qualification" },
    { key: "other_details", label: "Other details" },
    { key: "work_mode", label: "Work mode" },
    { key: "apply_contact", label: "Apply / contact" },
  ];

  const formatReceived = (dateStr) => {
    if (!dateStr) return "16 Nov, 06:15 am";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  const getEvidenceText = (key) => {
    const ev = activeJob.evidence || {};
    if (key === "experience") return ev.exp || ev.experience;
    if (key === "other_details") return ev.details || ev.other_details;
    return ev[key];
  };

  return (
    <div
      className={`fixed inset-0 z-50 select-none overflow-hidden ${
        isClosing ? "pointer-events-none" : "pointer-events-auto"
      }`}
    >
      {/* Self-contained Keyframe Animations to guarantee zero delay & butter smoothness */}
      <style>{`
        @keyframes jvDrawerSlideIn {
          0% { transform: translate3d(100%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        @keyframes jvDrawerSlideOut {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(100%, 0, 0); }
        }
        @keyframes jvScrimFadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes jvScrimFadeOut {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        .jv-scrim-in {
          animation: jvScrimFadeIn 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .jv-scrim-out {
          animation: jvScrimFadeOut 250ms ease-in forwards;
        }
        .jv-panel-in {
          animation: jvDrawerSlideIn 320ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform;
        }
        .jv-panel-out {
          animation: jvDrawerSlideOut 260ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
          will-change: transform;
        }
      `}</style>

      {/* Backdrop Scrim with GPU animated fade */}
      <div
        className={`fixed inset-0 bg-[#0A0F14]/50 backdrop-blur-[2px] ${
          isClosing ? "jv-scrim-out" : "jv-scrim-in"
        }`}
        onClick={handleClose}
      />

      {/* Slide-over Drawer with GPU animated slide */}
      <aside
        className={`fixed top-0 right-0 bottom-0 w-full max-w-[780px] bg-white z-50 flex flex-col shadow-[-4px_0_24px_rgba(21,32,44,0.18)] border-l border-[#DCE1E8] ${
          isClosing ? "jv-panel-out" : "jv-panel-in"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={activeJob.code}
      >
        {/* Drawer Header */}
        <div className="flex justify-between items-start gap-3 p-4 px-6 border-b border-[#DCE1E8] shrink-0 bg-white">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-['IBM_Plex_Mono',monospace] text-[0.8rem] text-[#5A6777]">
                {activeJob.code}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 text-[0.72rem] font-semibold rounded-[20px] px-2.5 py-0.5 ${pill.bg} ${pill.text}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${pill.dot}`} />
                {pill.label}
              </span>
              {/* AI Confidence Meter */}
              <span
                className="inline-flex items-center gap-1.5 font-['IBM_Plex_Mono',monospace] text-[0.78rem] text-[#5A6777]"
                title="AI confidence"
              >
                <span className="w-[38px] h-[5px] bg-[#F6F7F9] rounded-[3px] border border-[#DCE1E8] overflow-hidden inline-block align-middle">
                  <i
                    className="block h-full transition-all duration-300"
                    style={{
                      width: `${confPercent}%`,
                      backgroundColor: confColor,
                    }}
                  />
                </span>
                <span>{confPercent}%</span>
              </span>
            </div>
            <h2 className="font-['Bricolage_Grotesque',sans-serif] text-[1.3rem] font-bold text-[#15202C] mt-1.5 leading-snug">
              {activeJob.title || "Untitled"}
            </h2>
            <span className="text-[#5A6777] text-[0.86rem]">
              {activeJob.company || "Company unclear"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="border border-[#DCE1E8] bg-white hover:bg-[#F6F7F9] text-[#15202C] text-[0.82rem] font-semibold px-3 py-1.5 rounded-[6px] transition-colors cursor-pointer select-none"
          >
            Close
          </button>
        </div>

        {/* Drawer Body: 2-Column Split */}
        <div className="overflow-y-auto p-6 grid grid-cols-[270px_minmax(0,1fr)] max-[700px]:grid-cols-1 gap-6 items-start flex-1">
          {/* Left Column: Screenshot Artwork, Filename, & Collapsible OCR text */}
          <div className="flex flex-col gap-3">
            {activeJob.image ? (
              <img
                src={activeJob.image}
                alt="Original screenshot"
                onClick={() => onZoomImage?.(activeJob.image)}
                className="w-full max-h-[380px] object-contain rounded-[6px] border border-[#DCE1E8] bg-[#F6F7F9] cursor-zoom-in hover:opacity-95 transition-opacity select-none"
              />
            ) : (
              <div className="h-[220px] rounded-[6px] border border-[#DCE1E8] bg-[#F6F7F9] grid place-items-center text-[#5A6777] text-sm">
                Screenshot removed
              </div>
            )}

            <div className="text-[#5A6777] font-['IBM_Plex_Mono',monospace] text-[0.74rem] break-all select-text">
              {activeJob.original_name ||
                activeJob.filename ||
                "IMG-20261106-WA0191.jpg"}
            </div>

            {activeJob.raw_text && (
              <details className="text-[0.78rem] text-[#5A6777] group">
                <summary className="cursor-pointer font-semibold hover:text-[#15202C] py-1 select-none">
                  Text the AI read from the image
                </summary>
                <pre className="font-['IBM_Plex_Mono',monospace] text-[0.74rem] whitespace-pre-wrap bg-[#FFFFFF] border border-[#DCE1E8] rounded-[6px] p-2.5 text-[#5A6777] max-h-[220px] overflow-auto mt-1.5 m-0 select-text">
                  {activeJob.raw_text}
                </pre>
              </details>
            )}
          </div>

          {/* Right Column: Meta badges, Duplicate banner, & 11 Field definitions */}
          <div className="flex flex-col gap-4 min-w-0">
            {/* Meta Tags Row */}
            <div className="flex items-center gap-2.5 flex-wrap text-[0.76rem]">
              <span className="font-semibold border border-[#DCE1E8] rounded-[4px] px-[7px] py-[1.5px] bg-[#F6F7F9] text-[#15202C]">
                {activeJob.vault}
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-[#15202C]">
                <i
                  className="w-2 h-2 rounded-[2px]"
                  style={{ backgroundColor: sourceColor }}
                />
                {activeJob.source_app || activeJob.source || "Other"}
              </span>
              <span className="text-[#5A6777]">
                Received {formatReceived(activeJob.created_at)}
              </span>
            </div>

            {/* Duplicate Notice Banner */}
            {activeJob.status === "duplicate" && (
              <div className="bg-[#DCEAF5] border border-transparent rounded-[6px] p-[10px_14px] text-[0.84rem] text-[#235F8C] flex items-center gap-2">
                <b className="font-bold text-[#235F8C] shrink-0">Duplicate</b>
                <span>
                  Same job as{" "}
                  <button
                    type="button"
                    onClick={() =>
                      onOpenJobId?.(activeJob.duplicate_of || 1041)
                    }
                    className="underline font-bold text-[#235F8C] hover:text-[#15202C] cursor-pointer"
                  >
                    JV-{activeJob.duplicate_of || "1041"}
                  </button>
                  . It was not added twice.
                </span>
              </div>
            )}

            {/* 11 Fields Form */}
            <form onSubmit={handleSave} className="flex flex-col gap-3.5 pt-1">
              {fieldDefs.map(({ key, label }) => {
                const val = formFields[key] ?? activeJob[key] ?? "";
                const evText = getEvidenceText(key);
                const hasEvidence = Boolean(evText);
                const isFieldEmpty = !val || val === "—";

                return (
                  <div key={key} className="flex flex-col gap-0.5">
                    <label className="text-[0.74rem] font-semibold text-[#5A6777]">
                      {label}
                    </label>

                    {isEditing ? (
                      <div>
                        {key === "work_mode" ? (
                          <select
                            value={val}
                            onChange={(e) =>
                              setFormFields((prev) => ({
                                ...prev,
                                [key]: e.target.value,
                              }))
                            }
                            className="w-full h-[36px] px-3 border border-[#DCE1E8] rounded-[6px] text-[0.86rem] text-[#15202C] bg-white focus:outline-2 focus:outline-[#9C6B12]"
                          >
                            <option value="">Not stated</option>
                            <option value="Onsite">Onsite</option>
                            <option value="Hybrid">Hybrid</option>
                            <option value="Remote">Remote</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={val}
                            onChange={(e) =>
                              setFormFields((prev) => ({
                                ...prev,
                                [key]: e.target.value,
                              }))
                            }
                            placeholder={isFieldEmpty ? "Not readable in image" : ""}
                            className="w-full h-[36px] px-3 border border-[#DCE1E8] rounded-[6px] text-[0.86rem] text-[#15202C] bg-white focus:outline-2 focus:outline-[#9C6B12]"
                          />
                        )}
                      </div>
                    ) : (
                      <div className="font-semibold text-[0.88rem] text-[#15202C] break-words">
                        {val || "—"}
                      </div>
                    )}

                    {/* Evidence Footnote (omitted for Country matching dashboard.html) */}
                    {key !== "country" && (
                      <span
                        className={`text-[0.72rem] font-['IBM_Plex_Mono',monospace] truncate ${
                          hasEvidence
                            ? "text-[#5A6777]"
                            : isFieldEmpty
                            ? "text-[#9A5B00]"
                            : "text-[#5A6777]"
                        }`}
                      >
                        {hasEvidence
                          ? `from image: “${evText}”`
                          : !isFieldEmpty
                          ? "edited by you"
                          : "not in the image"}
                      </span>
                    )}
                  </div>
                );
              })}

              {isEditing && (
                <div className="flex flex-col gap-0.5 pt-1">
                  <label className="text-[0.74rem] font-semibold text-[#5A6777]">
                    Vault
                  </label>
                  <select
                    value={formFields.vault ?? activeJob.vault}
                    onChange={(e) =>
                      setFormFields((prev) => ({
                        ...prev,
                        vault: e.target.value,
                      }))
                    }
                    className="w-full h-[36px] px-3 border border-[#DCE1E8] rounded-[6px] text-[0.86rem] text-[#15202C] bg-white focus:outline-2 focus:outline-[#9C6B12]"
                  >
                    {VAULTS.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Drawer Footer Action Bar */}
        <div className="p-3.5 px-6 border-t border-[#DCE1E8] flex items-center justify-between gap-3 flex-wrap bg-white shrink-0">
          <div className="flex items-center gap-2">
            {activeJob.status !== "rejected" && (
              <button
                type="button"
                onClick={() => handleStatus("rejected")}
                className="border border-[#DCE1E8] bg-white text-[#A8281F] hover:bg-[#F8DEDB]/50 text-[0.82rem] font-semibold px-3.5 py-1.5 rounded-[6px] transition-colors cursor-pointer select-none"
              >
                Reject
              </button>
            )}
            {(activeJob.status === "rejected" ||
              activeJob.status === "duplicate") && (
              <button
                type="button"
                onClick={() => handleStatus("review")}
                className="border border-[#DCE1E8] bg-white text-[#15202C] hover:bg-[#F6F7F9] text-[0.82rem] font-semibold px-3.5 py-1.5 rounded-[6px] transition-colors cursor-pointer select-none"
              >
                Move to review
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="border border-[#DCE1E8] bg-white hover:bg-[#F6F7F9] text-[#15202C] text-[0.82rem] font-semibold px-3.5 py-1.5 rounded-[6px] transition-colors cursor-pointer select-none"
              >
                Edit
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                className="bg-[#9C6B12] text-white hover:brightness-105 text-[0.82rem] font-semibold px-4 py-1.5 rounded-[6px] transition-all cursor-pointer select-none shadow-sm"
              >
                Save changes
              </button>
            )}

            {activeJob.status === "review" && (
              <button
                type="button"
                onClick={() => handleStatus("synced")}
                className="bg-[#24734A] text-white hover:brightness-105 text-[0.82rem] font-semibold px-4 py-1.5 rounded-[6px] transition-all cursor-pointer select-none shadow-sm"
              >
                Approve & add to sheet
              </button>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
