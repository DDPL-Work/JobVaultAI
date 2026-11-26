import { useState, useEffect, useRef, useCallback } from "react";
import { FiZoomIn, FiZoomOut, FiRotateCcw, FiX } from "react-icons/fi";
import SafeImage from "../common/SafeImage";

const MIN_SCALE = 0.5;
const MAX_SCALE = 4;
const ZOOM_STEP = 0.25;

export default function ScreenshotLightbox({ imageSrc, onClose }) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });
  const didDragRef = useRef(false);

  // Reset zoom/pan whenever a new image opens
  useEffect(() => {
    if (imageSrc) {
      setScale(1);
      setOffset({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [imageSrc]);

  const clampScale = (val) =>
    Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number(val.toFixed(2))));

  const handleZoomIn = useCallback(() => {
    setScale((prev) => clampScale(prev + ZOOM_STEP));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => {
      const next = clampScale(prev - ZOOM_STEP);
      if (next <= 1) setOffset({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  // Keyboard shortcuts: Esc (close), + / = (zoom in), - (zoom out), 0 (reset)
  useEffect(() => {
    if (!imageSrc) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === "0") {
        e.preventDefault();
        handleReset();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [imageSrc, onClose, handleZoomIn, handleZoomOut, handleReset]);

  if (!imageSrc) return null;

  const handleWheel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY < 0 ? 0.2 : -0.2;
    setScale((prev) => {
      const next = clampScale(prev + delta);
      if (next <= 1) setOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const handlePointerDown = (e) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    didDragRef.current = false;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    };
    if (scale > 1) {
      setIsDragging(true);
      e.currentTarget.setPointerCapture?.(e.pointerId);
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      didDragRef.current = true;
    }
    setOffset({
      x: dragStartRef.current.offsetX + dx,
      y: dragStartRef.current.offsetY + dy,
    });
  };

  const handlePointerUp = (e) => {
    e.stopPropagation();
    if (isDragging) {
      setIsDragging(false);
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    }
    if (!didDragRef.current) {
      // Single click toggles between 1x and 2x zoom
      if (scale <= 1) {
        setScale(2);
      } else {
        handleReset();
      }
    }
  };

  const zoomPercent = Math.round(scale * 100);

  return (
    <div
      className="fixed inset-0 z-[70] bg-[#05080C]/92 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 select-none overflow-hidden"
      onClick={onClose}
      onWheel={handleWheel}
    >
      {/* Top Floating Zoom Toolbar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed top-4 right-4 sm:top-5 sm:right-6 z-[72] flex items-center gap-1 bg-[#15202C]/90 border border-white/15 backdrop-blur-md rounded-[8px] px-2 py-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.45)] text-white"
      >
        <button
          type="button"
          onClick={handleZoomOut}
          disabled={scale <= MIN_SCALE}
          title="Zoom out (-)"
          aria-label="Zoom out"
          className="w-8 h-8 rounded-[6px] hover:bg-white/10 disabled:opacity-35 flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <FiZoomOut className="w-4 h-4" />
        </button>

        <span className="font-['IBM_Plex_Mono',monospace] text-[0.76rem] font-semibold min-w-[48px] text-center tabular-nums text-white/90">
          {zoomPercent}%
        </span>

        <button
          type="button"
          onClick={handleZoomIn}
          disabled={scale >= MAX_SCALE}
          title="Zoom in (+)"
          aria-label="Zoom in"
          className="w-8 h-8 rounded-[6px] hover:bg-white/10 disabled:opacity-35 flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <FiZoomIn className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleReset}
          disabled={scale === 1 && offset.x === 0 && offset.y === 0}
          title="Reset zoom (0)"
          aria-label="Reset zoom"
          className="w-8 h-8 rounded-[6px] hover:bg-white/10 disabled:opacity-35 flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <FiRotateCcw className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-5 bg-white/15 mx-0.5" />

        <button
          type="button"
          onClick={onClose}
          title="Close (Esc)"
          aria-label="Close Lightbox"
          className="w-8 h-8 rounded-[6px] hover:bg-white/15 text-white/85 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <FiX className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Bottom Hint Pill */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[72] bg-[#15202C]/85 border border-white/10 text-white/75 text-[0.72rem] px-3 py-1 rounded-full backdrop-blur-md pointer-events-none hidden sm:block"
      >
        Scroll or click image to zoom · Drag to move · Esc to close
      </div>

      {/* Zoomable & Pannable Image Viewport */}
      <div
        onClick={(e) => e.stopPropagation()}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => setIsDragging(false)}
        className={`relative max-h-[88vh] max-w-[92vw] flex items-center justify-center touch-none ${
          scale > 1
            ? isDragging
              ? "cursor-grabbing"
              : "cursor-grab"
            : "cursor-zoom-in"
        }`}
      >
        <div
          style={{
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
            transition: isDragging
              ? "none"
              : "transform 160ms cubic-bezier(0.16, 1, 0.3, 1)",
            transformOrigin: "center center",
          }}
          className="pointer-events-none select-none will-change-transform"
        >
          <SafeImage
            src={imageSrc}
            alt="Full Screenshot Preview"
            className="max-h-[85vh] max-w-[88vw] object-contain rounded-[6px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/10"
            fallbackClassName="w-[320px] h-[240px] rounded-[6px] border border-white/15 bg-[#15202C] text-[#94A3B8]"
          />
        </div>
      </div>
    </div>
  );
}
