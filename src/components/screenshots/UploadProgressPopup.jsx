import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FiUploadCloud,
  FiCheck,
  FiX,
  FiMinus,
  FiMaximize2,
  FiFileText,
  FiLayers,
} from "react-icons/fi";

/**
 * Top-right upload progress HUD card + bottom-right completion popup
 * matching JobVault AI's visual layout.
 */
export default function UploadProgressPopup({
  uploadState,
  completionState,
  onDismissUpload,
  onDismissCompletion,
  onViewUploaded,
}) {
  const [minimized, setMinimized] = useState(false);

  // Reset minimized whenever a fresh upload starts
  useEffect(() => {
    if (uploadState?.visible && uploadState?.status === "uploading") {
      setMinimized(false);
    }
  }, [uploadState?.visible, uploadState?.status, uploadState?.fileName]);

  if (typeof document === "undefined") return null;

  const renderTopRightUpload = () => {
    if (!uploadState?.visible) return null;

    const {
      progress = 0,
      fileCount = 1,
      fileName = "",
      isCombine = false,
      hasPdf = false,
      status = "uploading",
      closing = false,
    } = uploadState;

    const clampedPct = Math.max(0, Math.min(100, Math.round(progress)));
    const isDone = status === "done" || clampedPct >= 100;

    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const strokeOffset = circumference - (clampedPct / 100) * circumference;

    const headline = isDone
      ? `Uploaded ${fileCount} ${fileCount > 1 ? "files" : "file"}`
      : isCombine && fileCount > 1
      ? `Combining ${fileCount} parts...`
      : hasPdf
      ? "Uploading PDF..."
      : fileCount > 1
      ? `Uploading ${fileCount} Screenshots...`
      : "Uploading Screenshot...";

    const activeStep = isDone ? 3 : clampedPct >= 55 ? 2 : 1;

    return createPortal(
      <div
        role="status"
        aria-live="polite"
        className={`fixed top-4 right-4 z-[9999] w-[calc(100%-32px)] max-w-[395px] transition-all duration-300 ease-out ${
          closing ? "-translate-y-3 opacity-0 pointer-events-none" : ""
        }`}
      >
        <div className="jv-upload-popup-in bg-[#15202C] text-white border border-[#2B3B4E] rounded-[10px] px-4 py-3 shadow-[0_18px_44px_rgba(10,15,20,0.42)] flex flex-col gap-2.5">
          {/* Header / Main Row */}
          <div className="flex items-center gap-3">
            {/* Circular Ring Progress */}
            <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
              <svg className="w-11 h-11 -rotate-90" viewBox="0 0 44 44">
                <circle
                  cx="22"
                  cy="22"
                  r={radius}
                  fill="none"
                  stroke="#253445"
                  strokeWidth="3.2"
                />
                <circle
                  cx="22"
                  cy="22"
                  r={radius}
                  fill="none"
                  stroke={isDone ? "#22C55E" : "#E0A838"}
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  className="transition-[stroke-dashoffset,stroke] duration-150 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                {isDone ? (
                  <FiCheck className="w-4.5 h-4.5 text-[#4ADE80] stroke-[2.6]" />
                ) : (
                  <FiUploadCloud className="w-4 h-4 text-[#E0A838] animate-pulse" />
                )}
              </div>
            </div>

            {/* Title + Filename */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <b className="text-[0.86rem] font-semibold text-white leading-tight truncate">
                  {headline}
                </b>
                {isCombine && (
                  <FiLayers
                    className="w-3.5 h-3.5 text-[#E0A838] shrink-0"
                    title="Multi-part combine"
                  />
                )}
                {hasPdf && !isCombine && (
                  <FiFileText
                    className="w-3.5 h-3.5 text-[#F87171] shrink-0"
                    title="PDF mode"
                  />
                )}
              </div>
              {fileName && (
                <span className="text-[0.73rem] text-[#9FB0C3] block truncate mt-0.5">
                  {fileName}
                </span>
              )}
            </div>

            {/* Percentage + Minimize + Close */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={`font-['IBM_Plex_Mono',monospace] text-[0.95rem] font-bold tabular-nums mr-1 ${
                  isDone ? "text-[#4ADE80]" : "text-[#E0A838]"
                }`}
              >
                {clampedPct}%
              </span>
              <button
                type="button"
                onClick={() => setMinimized((prev) => !prev)}
                aria-label={minimized ? "Expand upload status" : "Minimize upload status"}
                title={minimized ? "Expand" : "Minimize"}
                className="w-6 h-6 rounded-[5px] text-[#9FB0C3] hover:text-white hover:bg-[#243242] flex items-center justify-center transition-colors cursor-pointer"
              >
                {minimized ? (
                  <FiMaximize2 className="w-3 h-3" />
                ) : (
                  <FiMinus className="w-3.5 h-3.5" />
                )}
              </button>
              {onDismissUpload && (
                <button
                  type="button"
                  onClick={onDismissUpload}
                  aria-label="Close upload progress"
                  title="Close"
                  className="w-6 h-6 rounded-[5px] text-[#9FB0C3] hover:text-white hover:bg-[#243242] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {!minimized && (
            <>
              {/* Linear Shimmering Gold Progress Bar */}
              <div className="w-full h-[6px] rounded-full bg-[#223040] overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-[width] duration-150 ease-out relative overflow-hidden ${
                    isDone
                      ? "bg-gradient-to-r from-[#16A34A] to-[#4ADE80]"
                      : "bg-gradient-to-r from-[#9C6B12] via-[#E0A838] to-[#FDE68A]"
                  }`}
                  style={{ width: `${clampedPct}%` }}
                >
                  {!isDone && <div className="jv-upload-shimmer absolute inset-0" />}
                </div>
              </div>

              {/* Connected 3-Stage Status Row */}
              <div className="flex items-center gap-2 text-[0.7rem] font-medium pt-0.5">
                {[
                  { id: 1, label: "Uploading" },
                  { id: 2, label: "Processing" },
                  { id: 3, label: "AI Analysis" },
                ].map((stage, idx, arr) => {
                  const reached = activeStep >= stage.id;
                  const current = activeStep === stage.id && !isDone;
                  return (
                    <div
                      key={stage.id}
                      className={`flex items-center gap-1.5 ${
                        idx < arr.length - 1 ? "flex-1 min-w-0" : "shrink-0"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isDone
                            ? "bg-[#4ADE80]"
                            : current
                            ? "bg-[#E0A838] animate-pulse"
                            : reached
                            ? "bg-[#E0A838]"
                            : "bg-[#3A4B5E]"
                        }`}
                      />
                      <span
                        className={`whitespace-nowrap transition-colors ${
                          isDone || reached ? "text-[#E2E8F0]" : "text-[#7A8C9F]"
                        }`}
                      >
                        {stage.label}
                      </span>
                      {idx < arr.length - 1 && (
                        <span
                          className={`h-[1px] flex-1 mx-1 ${
                            activeStep > stage.id ? "bg-[#E0A838]/60" : "bg-[#2C3C4E]"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>,
      document.body
    );
  };

  const renderBottomRightCompletion = () => {
    if (!completionState?.visible) return null;

    const { fileCount = 1, closing = false } = completionState;

    return createPortal(
      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-4 right-4 z-[9999] w-[calc(100%-32px)] max-w-[365px] transition-all duration-300 ease-out ${
          closing ? "translate-y-3 opacity-0 pointer-events-none" : ""
        }`}
      >
        <div className="jv-upload-popup-in relative bg-white border border-[#DCE1E8] rounded-[8px] shadow-[0_14px_36px_rgba(21,32,44,0.16)] overflow-hidden">
          <div className="px-3.5 py-3 pr-8 flex items-center gap-3">
            {/* Green Check Badge */}
            <div className="w-9 h-9 rounded-full bg-[#DCF0E3] border border-[#B9E5C9] flex items-center justify-center shrink-0">
              <span className="w-6 h-6 rounded-full bg-[#22C55E] text-white flex items-center justify-center shadow-2xs">
                <FiCheck className="w-3.5 h-3.5 stroke-[2.8]" />
              </span>
            </div>

            {/* Title & Subtitle */}
            <div className="flex-1 min-w-0">
              <b className="block text-[0.83rem] font-bold text-[#15202C] leading-snug">
                Upload completed successfully!
              </b>
              <span className="block text-[0.74rem] text-[#5A6777] mt-0.5 truncate">
                {fileCount} {fileCount > 1 ? "screenshots" : "screenshot"} uploaded and processed
              </span>
            </div>

            {/* View -> Action */}
            {onViewUploaded && (
              <button
                type="button"
                onClick={onViewUploaded}
                className="text-[0.78rem] font-semibold text-[#235F8C] hover:text-[#174263] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                View →
              </button>
            )}
          </div>

          {/* Close Button */}
          {onDismissCompletion && (
            <button
              type="button"
              onClick={onDismissCompletion}
              aria-label="Close notification"
              className="absolute top-2 right-2 w-5 h-5 rounded-[4px] text-[#8C9BAE] hover:text-[#15202C] hover:bg-[#F1F3F6] flex items-center justify-center transition-colors cursor-pointer"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Bottom Green Accent Bar */}
          <div className="w-full h-[3px] bg-[#22C55E]" />
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      {renderTopRightUpload()}
      {renderBottomRightCompletion()}
    </>
  );
}
