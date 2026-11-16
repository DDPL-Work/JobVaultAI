import { useEffect } from "react";

export default function ScreenshotLightbox({ imageSrc, onClose }) {
  useEffect(() => {
    if (!imageSrc) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [imageSrc, onClose]);

  if (!imageSrc) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#05080C]/90 backdrop-blur-sm flex items-center justify-center p-6 cursor-zoom-out select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-6 text-white/80 hover:text-white text-2xl font-light p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        aria-label="Close Lightbox"
      >
        ✕
      </button>

      <div
        className="relative max-h-[90vh] max-w-[90vw] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageSrc}
          alt="Full Screenshot Preview"
          className="max-h-[85vh] max-w-[85vw] object-contain rounded-[6px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/10"
        />
      </div>
    </div>
  );
}

