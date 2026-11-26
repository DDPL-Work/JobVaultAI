import { useState, useEffect } from "react";

/**
 * Animated AI Confidence progress bar + synchronized count-up percentage
 */
export default function ConfidenceMeter({
  confidence = 0,
  delayMs = 0,
  durationMs = 900,
  animKey,
  textClassName = "text-[#15202C]",
  titlePrefix = "AI Confidence",
}) {
  const target = Math.max(0, Math.min(100, Math.round((confidence || 0) * 100)));
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    setCurrent(0);
    if (target === 0) return;

    let rafId = 0;
    let startTime = 0;

    const timer = setTimeout(() => {
      const tick = (now) => {
        if (!startTime) startTime = now;
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / durationMs);
        // Smooth ease-out cubic curve
        const eased = 1 - Math.pow(1 - progress, 3);
        setCurrent(target * eased);
        if (progress < 1) {
          rafId = requestAnimationFrame(tick);
        } else {
          setCurrent(target);
        }
      };
      rafId = requestAnimationFrame(tick);
    }, delayMs);

    return () => {
      clearTimeout(timer);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [target, delayMs, durationMs, animKey]);

  const colorClass =
    target >= 80
      ? "bg-[#24734A]"
      : target >= 60
      ? "bg-[#9A5B00]"
      : "bg-[#A8281F]";

  const displayPercent = Math.round(current);

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-['IBM_Plex_Mono',monospace] text-[0.78rem] tabular-nums ${textClassName}`}
      title={`${titlePrefix}: ${target}%`}
    >
      <span className="w-[42px] h-[5px] rounded-[3px] bg-[#F6F7F9] border border-[#DCE1E8] overflow-hidden inline-block align-middle shrink-0">
        <i
          className={`h-full block rounded-[2px] ${colorClass}`}
          style={{ width: `${current}%` }}
        />
      </span>
      <span className="inline-block min-w-[32px]">{displayPercent}%</span>
    </span>
  );
}
