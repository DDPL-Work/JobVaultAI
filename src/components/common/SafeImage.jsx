import { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "../../apis/apiClient";

function isInlineImageSrc(src) {
  return (
    typeof src === "string" &&
    (src.startsWith("data:") || src.startsWith("blob:"))
  );
}

/**
 * Image component with smooth fade-in shimmer and graceful broken-image fallback
 */
export default function SafeImage({
  src,
  alt = "Preview",
  className = "",
  fallbackClassName = "",
  onClick,
  title,
}) {
  const imgRef = useRef(null);
  const resolvedSrc =
    src && typeof src === "string" && src.startsWith("/")
      ? `${API_BASE_URL}${src}`
      : src;
  const isInline = isInlineImageSrc(resolvedSrc);

  const [loaded, setLoaded] = useState(() => isInline);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setErrored(false);
    if (isInlineImageSrc(resolvedSrc)) {
      setLoaded(true);
      return;
    }
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth > 0) {
      setLoaded(true);
    } else {
      setLoaded(false);
    }
  }, [resolvedSrc]);

  if (!resolvedSrc || errored) {
    return (
      <div
        onClick={onClick}
        title={title || "Image unavailable"}
        className={`flex flex-col items-center justify-center bg-[#F6F7F9] text-[#8C9BAE] select-none ${fallbackClassName || className}`}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 stroke-current fill-none stroke-[1.7]"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {!loaded && !isInline && (
        <div
          className="absolute inset-0 skeleton-shimmer"
          aria-hidden="true"
        />
      )}
      <img
        ref={imgRef}
        src={resolvedSrc}
        alt={alt}
        loading={isInline ? "eager" : "lazy"}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setErrored(true);
          setLoaded(true);
        }}
        onClick={onClick}
        title={title}
        className={`${className} transition-opacity duration-300 ${
          loaded || isInline ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
