import { useState, useRef, useEffect } from "react";

export default function ScreenshotUploadZone({ onFilesSelected, uploadingProgress }) {
  const [isDragging, setIsDragging] = useState(false);
  const [combineMode, setCombineMode] = useState(false);
  const fileInputRef = useRef(null);

  // Support pasting image or PDF from clipboard (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const files = [];
      for (let i = 0; i < items.length; i++) {
        if (
          items[i].type.indexOf("image") !== -1 ||
          items[i].type === "application/pdf"
        ) {
          const file = items[i].getAsFile();
          if (file) files.push(file);
        }
      }

      if (files.length > 0 && onFilesSelected) {
        onFilesSelected(files, combineMode);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [onFilesSelected, combineMode]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected?.(Array.from(e.dataTransfer.files), combineMode);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected?.(Array.from(e.target.files), combineMode);
      e.target.value = ""; // Reset to allow re-uploading same file
    }
  };

  return (
    <div className="bg-white border border-[#DCE1E8] rounded-[8px] p-4 shadow-[0_1px_2px_rgba(21,32,44,0.06)]">
      <label
        htmlFor="screenshot-file-input"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-[8px] py-[28px] px-4 text-center flex flex-col gap-2 items-center cursor-pointer transition-colors duration-150 select-none ${
          isDragging
            ? "border-[#9C6B12] bg-[#F5EAD3]"
            : combineMode
            ? "border-[#9C6B12] bg-[#FAF4E8] hover:bg-[#F5EAD3]"
            : "border-[#C59B47] bg-[#FAF4E8] hover:border-[#9C6B12] hover:bg-[#F5EAD3]"
        }`}
      >
        <div className="relative">
          <svg
            viewBox="0 0 24 24"
            className="w-[34px] h-[34px] stroke-[#9C6B12] fill-none stroke-[1.6]"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          {combineMode && (
            <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-[#9C6B12] text-white rounded-full flex items-center justify-center text-[0.6rem] font-bold shadow-xs">
              +
            </span>
          )}
        </div>

        <b className="text-[#15202C] text-[0.95rem] font-semibold">
          {combineMode
            ? "Drop 1–4 screenshot parts here (Multi-part combine is ON)"
            : "Drop job screenshots or multi-page PDFs here, or click to choose"}
        </b>

        <span className="text-[#5A6777] text-[0.78rem]">
          {combineMode
            ? "Combine 1–4 elongated/scrolled screenshot parts into 1 single job listing"
            : "PNG, JPG, WEBP, PDF (auto-split at ~144 DPI) · up to 500 files at a time · Ctrl+V supported"}
        </span>

        {/* Format Badges */}
        <div className="flex items-center gap-1.5 mt-1 flex-wrap justify-center">
          <span className="text-[0.62rem] bg-[#DCF0E3] text-[#24734A] border border-[#B9E5C9] font-bold px-2 py-0.5 rounded-[3px]">
            PNG, JPG, WEBP, HEIC
          </span>
          <span className="text-[0.62rem] bg-[#FDF2F2] text-[#DC2626] border border-[#FCA5A5] font-bold px-2 py-0.5 rounded-[3px] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
            PDF Ingestion (.pdf)
          </span>
          {/* <span className="text-[0.62rem] bg-[#FAF4E8] text-[#9C6B12] border border-[#E5D2A8] font-semibold px-2 py-0.5 rounded-[3px]">
            pypdfium2 (2.0x / ~144 DPI)
          </span> */}
        </div>

        <input
          ref={fileInputRef}
          id="screenshot-file-input"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/heic,image/heif,image/bmp,application/pdf,.pdf"
          multiple
          className="hidden"
          onChange={handleChange}
        />
      </label>

      {/* Multi-Part Screenshot Combination Checkbox Row */}
      <div className="flex items-center justify-between gap-3 pt-3 mt-3 border-t border-[#DCE1E8] flex-wrap">
        <label
          htmlFor="combine-checkbox"
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <input
            id="combine-checkbox"
            type="checkbox"
            checked={combineMode}
            onChange={(e) => setCombineMode(e.target.checked)}
            className="w-4 h-4 rounded border-[#DCE1E8] text-[#9C6B12] focus:ring-[#9C6B12] focus:ring-offset-0 cursor-pointer accent-[#9C6B12]"
          />
          <div className="flex flex-col">
            <span className="text-[0.84rem] font-semibold text-[#15202C] group-hover:text-[#9C6B12] transition-colors flex items-center gap-2 flex-wrap">
              <span>Combine into 1 single job</span>
              {combineMode ? (
                <span className="text-[0.64rem] font-bold bg-[#FAF4E8] text-[#9C6B12] border border-[#E5D2A8] rounded-[4px] px-1.5 py-0.2">
                  ACTIVE · 1–4 parts merged
                </span>
              ) : (
                <span className="text-[0.64rem] font-medium bg-[#F6F7F9] text-[#5A6777] border border-[#DCE1E8] rounded-[4px] px-1.5 py-0.2">
                  Multi-part mode
                </span>
              )}
            </span>
            <span className="text-[0.74rem] text-[#5A6777]">
              Merge 1–4 screenshot parts of a single elongated/scrolled job posting into one consolidated listing
            </span>
          </div>
        </label>

        {/* <div className="flex items-center gap-1.5 text-[0.72rem] font-['IBM_Plex_Mono',monospace] text-[#5A6777]">
          <span
            className={`w-2 h-2 rounded-full ${
              combineMode ? "bg-[#24734A] animate-pulse" : "bg-[#8C9BAE]"
            }`}
          />
          <span>{combineMode ? "combine=true" : "combine=false"}</span>
        </div> */}
      </div>

      {uploadingProgress !== null && uploadingProgress !== undefined && (
        <div className="flex items-center gap-3 mt-3">
          <span className="text-[0.78rem] text-[#5A6777]">
            Processing files ({uploadingProgress}%)...
          </span>
          <div className="flex-1 max-w-[320px] h-[6px] rounded-[3px] bg-[#F6F7F9] border border-[#DCE1E8] overflow-hidden">
            <div
              className="h-full bg-[#9C6B12] transition-all duration-200"
              style={{ width: `${uploadingProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
