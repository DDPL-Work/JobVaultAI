import { useEffect } from "react";
import { createPortal } from "react-dom";
import { FiTrash2 } from "react-icons/fi";

export default function DeleteScreenshotModal({
  screenshot,
  deleting = false,
  onClose,
  onConfirm,
}) {
  useEffect(() => {
    if (!screenshot) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !deleting) {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [screenshot, deleting, onClose]);

  if (!screenshot || typeof document === "undefined") return null;

  const fileName =
    screenshot.originalName || screenshot.filename || "Selected screenshot";

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-[#0A0F14]/50 backdrop-blur-[2px] flex items-center justify-center p-4"
      onClick={() => {
        if (!deleting) onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-screenshot-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[360px] bg-white border border-[#DCE1E8] rounded-[4px] shadow-[0_16px_40px_rgba(21,32,44,0.22)] overflow-hidden jv-upload-popup-in"
      >
        {/* Top subtle accent line matching delete theme */}
        <div className="h-[3px] w-full bg-[#A8281F]" />

        {/* Modal Content */}
        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-[4px] bg-[#F8DEDB] border border-[#A8281F]/25 text-[#A8281F] flex items-center justify-center shrink-0 mt-0.5">
              <FiTrash2 className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h3
                id="delete-screenshot-modal-title"
                className="font-['Bricolage_Grotesque',sans-serif] text-[1.02rem] font-bold text-[#15202C] leading-snug m-0"
              >
                Are you sure?
              </h3>
              <p className="text-[0.8rem] text-[#5A6777] leading-relaxed mt-1 m-0">
                Do you really want to remove this screenshot? This action cannot
                be undone.
              </p>
            </div>
          </div>

          <div className="mt-3.5 px-2.5 py-1.5 rounded-[4px] bg-[#F6F7F9] border border-[#DCE1E8] font-['IBM_Plex_Mono',monospace] text-[0.72rem] font-medium text-[#15202C] truncate">
            {fileName}
          </div>
        </div>

        {/* Two Action Buttons: Close & Confirm */}
        <div className="px-4 sm:px-5 py-3 bg-[#F6F7F9]/75 border-t border-[#DCE1E8] flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={deleting}
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-[4px] border border-[#DCE1E8] bg-white hover:bg-[#F6F7F9] text-[#15202C] text-[0.78rem] font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            Close
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={() => onConfirm?.(screenshot.id)}
            className="px-3.5 py-1.5 rounded-[4px] border border-[#A8281F] bg-[#A8281F] hover:bg-[#8F2018] text-white text-[0.78rem] font-semibold transition-colors cursor-pointer disabled:opacity-60 inline-flex items-center gap-1.5"
          >
            {deleting ? "Removing..." : "Yes, Remove"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
