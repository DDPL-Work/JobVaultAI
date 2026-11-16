import { useState, useRef, useEffect } from "react";

export default function ScreenshotUploadZone({ onFilesSelected, uploadingProgress }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Support pasting image from clipboard (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const files = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) files.push(file);
        }
      }

      if (files.length > 0 && onFilesSelected) {
        onFilesSelected(files);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [onFilesSelected]);

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
      onFilesSelected?.(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected?.(Array.from(e.target.files));
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
        className={`border-2 border-dashed rounded-[8px] py-[30px] px-4 text-center flex flex-col gap-2 items-center cursor-pointer transition-colors duration-150 select-none ${
          isDragging
            ? "border-[#9C6B12] bg-[#F5EAD3]"
            : "border-[#C59B47] bg-[#FAF4E8] hover:border-[#9C6B12] hover:bg-[#F5EAD3]"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-[34px] h-[34px] stroke-[#9C6B12] fill-none stroke-[1.6]"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>

        <b className="text-[#15202C] text-[0.95rem] font-semibold">
          Drop job screenshots here, or click to choose
        </b>

        <span className="text-[#5A6777] text-[0.78rem]">
          PNG, JPG, WEBP or HEIC · up to 500 files at a time · you can also paste an image with Ctrl+V
        </span>

        <input
          ref={fileInputRef}
          id="screenshot-file-input"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/heic,image/heif"
          multiple
          className="hidden"
          onChange={handleChange}
        />
      </label>

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
