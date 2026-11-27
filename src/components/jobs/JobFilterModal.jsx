import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { FiX, FiSliders, FiRotateCcw } from "react-icons/fi";
import { VAULTS, SOURCES, getJobVaults } from "./jobsData";

export const DEFAULT_ADVANCED_FILTERS = {
  salaryMode: "all", // "all" | "disclosed" | "undisclosed"
  salaryMinLpa: "",
  salaryMaxLpa: "",
  expMin: "",
  expMax: "",
  workMode: "all", // "all" | "Remote" | "Hybrid" | "Onsite"
  location: "",
  country: "all",
  minConfidence: "all", // "all" | "70" | "80" | "90" | "95"
  sortBy: "default", // "default" | "confidence_desc" | "exp_asc" | "exp_desc" | "salary_desc"
};

/**
 * Parses a salary string (e.g. "Up to 7.2 LPA", "₹20,000-25,000 per month", "$130,000–$160,000/year")
 * into an approximate annual LPA range `{ min, max }`, or `null` if undisclosed/unparseable.
 */
export function parseSalaryLpa(salaryStr) {
  if (!salaryStr || typeof salaryStr !== "string") return null;
  const raw = salaryStr.trim();
  if (!raw || raw === "—" || raw === "-" || /not disclosed|not stated|n\/a/i.test(raw)) {
    return null;
  }

  const lower = raw.toLowerCase();
  const isUsd = /\$|\busd\b/i.test(raw);
  const isMonthly = /\b(month|mo|pm|per month|\/m)\b/i.test(lower);
  const isLpa = /\blpa\b|\blakh/i.test(lower);

  const matches = [...raw.matchAll(/(\d+(?:,\d{3})*(?:\.\d+)?)\s*(k|lakh|lakhs|lpa|cr|crore)?/gi)];
  const values = [];

  for (const m of matches) {
    const num = parseFloat(m[1].replace(/,/g, ""));
    if (isNaN(num)) continue;
    const unit = (m[2] || "").toLowerCase();

    let lpaVal = num;
    if (unit === "lpa" || unit === "lakh" || unit === "lakhs" || isLpa) {
      lpaVal = num;
    } else if (unit === "cr" || unit === "crore") {
      lpaVal = num * 100;
    } else {
      let baseNum = unit === "k" ? num * 1000 : num;
      if (isMonthly) baseNum *= 12;
      if (isUsd) baseNum *= 85;
      // Treat large absolute annual numbers (>= 10,000) as currency units; small numbers (< 1000) as LPA
      lpaVal = baseNum >= 10000 ? baseNum / 100000 : baseNum;
    }
    values.push(lpaVal);
  }

  if (values.length === 0) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  return { min, max };
}

/**
 * Parses job experience fields/strings into `{ min, max }` years, or `null` if unavailable.
 */
export function parseExperienceRange(job) {
  if (!job) return null;

  const hasMin = job.exp_min !== null && job.exp_min !== undefined && job.exp_min !== "";
  const hasMax = job.exp_max !== null && job.exp_max !== undefined && job.exp_max !== "";

  if (hasMin || hasMax) {
    const min = hasMin ? Number(job.exp_min) : 0;
    const max = hasMax ? Number(job.exp_max) : 99;
    if (!isNaN(min) && !isNaN(max)) {
      return { min, max: Math.max(min, max) };
    }
  }

  const raw = (job.experience || "").trim();
  if (!raw || raw === "—" || raw === "-") return null;
  const lower = raw.toLowerCase();
  if (lower.includes("fresher") && !/\d/.test(lower)) {
    return { min: 0, max: 1 };
  }

  const nums = [...raw.matchAll(/(\d+(?:\.\d+)?)/g)].map((m) => parseFloat(m[1]));
  if (nums.length === 0) return null;
  if (nums.length >= 2) {
    return { min: Math.min(nums[0], nums[1]), max: Math.max(nums[0], nums[1]) };
  }
  const single = nums[0];
  if (raw.includes("+")) {
    return { min: single, max: 99 };
  }
  return { min: single, max: single };
}

export function getNormalizedWorkMode(job) {
  const mode = (job?.work_mode || "").toLowerCase();
  const loc = (job?.location || "").toLowerCase();
  if (mode.includes("remote") || loc.includes("remote") || loc.includes("wfh")) {
    return "Remote";
  }
  if (mode.includes("hybrid") || loc.includes("hybrid")) {
    return "Hybrid";
  }
  if (mode.includes("onsite") || mode.includes("on-site") || mode.includes("office")) {
    return "Onsite";
  }
  return "";
}

export function getNormalizedConfidencePct(job) {
  const raw = Number(job?.confidence ?? 0);
  if (isNaN(raw) || raw <= 0) return 0;
  // Backend stores confidence as 0–1 floats (e.g. 0.95) or occasionally 0–100 numbers
  const pct = raw <= 1 ? raw * 100 : raw;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

export function matchesAdvancedFilters(job, filters) {
  if (!filters) return true;

  // 1. Salary mode & LPA range
  const parsedSalary = parseSalaryLpa(job.salary);
  if (filters.salaryMode === "disclosed" && !parsedSalary) return false;
  if (filters.salaryMode === "undisclosed" && parsedSalary) return false;

  const salMin =
    filters.salaryMinLpa !== "" && !isNaN(Number(filters.salaryMinLpa))
      ? Number(filters.salaryMinLpa)
      : null;
  const salMax =
    filters.salaryMaxLpa !== "" && !isNaN(Number(filters.salaryMaxLpa))
      ? Number(filters.salaryMaxLpa)
      : null;

  if (salMin !== null || salMax !== null) {
    if (!parsedSalary) return false;
    if (salMin !== null && parsedSalary.max < salMin) return false;
    if (salMax !== null && parsedSalary.min > salMax) return false;
  }

  // 2. Experience range
  const expMinFilter =
    filters.expMin !== "" && !isNaN(Number(filters.expMin))
      ? Number(filters.expMin)
      : null;
  const expMaxFilter =
    filters.expMax !== "" && !isNaN(Number(filters.expMax))
      ? Number(filters.expMax)
      : null;

  if (expMinFilter !== null || expMaxFilter !== null) {
    const parsedExp = parseExperienceRange(job);
    if (!parsedExp) return false;
    if (expMinFilter !== null && parsedExp.max < expMinFilter) return false;
    if (expMaxFilter !== null && parsedExp.min > expMaxFilter) return false;
  }

  // 3. Work mode
  if (filters.workMode && filters.workMode !== "all") {
    const mode = getNormalizedWorkMode(job);
    if (mode !== filters.workMode) return false;
  }

  // 4. Location text match
  if (filters.location && filters.location.trim()) {
    const locQuery = filters.location.trim().toLowerCase();
    const jobLoc = (job.location || "").toLowerCase();
    if (!jobLoc.includes(locQuery)) return false;
  }

  // 5. Country match
  if (filters.country && filters.country !== "all") {
    const jobCountry = (job.country || "").trim().toLowerCase();
    if (jobCountry !== filters.country.toLowerCase()) return false;
  }

  // 6. Minimum confidence
  if (filters.minConfidence && filters.minConfidence !== "all") {
    const minConf = Number(filters.minConfidence);
    const jobConf = getNormalizedConfidencePct(job);
    if (jobConf < minConf) return false;
  }

  return true;
}

export function sortFilteredJobs(list, sortBy) {
  if (!sortBy || sortBy === "default") return list;
  const copy = [...list];
  if (sortBy === "confidence_desc") {
    return copy.sort((a, b) => getNormalizedConfidencePct(b) - getNormalizedConfidencePct(a));
  }
  if (sortBy === "exp_asc") {
    return copy.sort((a, b) => {
      const ea = parseExperienceRange(a)?.min ?? 999;
      const eb = parseExperienceRange(b)?.min ?? 999;
      return ea - eb;
    });
  }
  if (sortBy === "exp_desc") {
    return copy.sort((a, b) => {
      const ea = parseExperienceRange(a)?.max ?? -1;
      const eb = parseExperienceRange(b)?.max ?? -1;
      return eb - ea;
    });
  }
  if (sortBy === "salary_desc") {
    return copy.sort((a, b) => {
      const sa = parseSalaryLpa(a.salary)?.max ?? -1;
      const sb = parseSalaryLpa(b.salary)?.max ?? -1;
      return sb - sa;
    });
  }
  return copy;
}

export function countActiveAdvancedFilters(filters) {
  if (!filters) return 0;
  let count = 0;
  if (filters.salaryMode !== "all") count += 1;
  if (filters.salaryMinLpa !== "" || filters.salaryMaxLpa !== "") count += 1;
  if (filters.expMin !== "" || filters.expMax !== "") count += 1;
  if (filters.workMode !== "all") count += 1;
  if (filters.location && filters.location.trim()) count += 1;
  if (filters.country !== "all") count += 1;
  if (filters.minConfidence !== "all") count += 1;
  if (filters.sortBy !== "default") count += 1;
  return count;
}

/**
 * Dual-thumb interactive horizontal range slider bar synced with min/max inputs.
 */
function DualRangeSlider({
  minBound = 0,
  maxBound = 50,
  step = 1,
  minValue,
  maxValue,
  unit = "",
  onChange,
  disabled = false,
}) {
  const numericMin =
    minValue !== "" && minValue !== null && minValue !== undefined && !isNaN(Number(minValue))
      ? Math.max(minBound, Math.min(maxBound, Number(minValue)))
      : minBound;
  const numericMax =
    maxValue !== "" && maxValue !== null && maxValue !== undefined && !isNaN(Number(maxValue))
      ? Math.max(minBound, Math.min(maxBound, Number(maxValue)))
      : maxBound;

  const safeMin = Math.min(numericMin, numericMax);
  const safeMax = Math.max(numericMin, numericMax);
  const leftPct = ((safeMin - minBound) / (maxBound - minBound)) * 100;
  const rightPct = ((safeMax - minBound) / (maxBound - minBound)) * 100;

  const isAllOpen =
    (minValue === "" || Number(minValue) <= minBound) &&
    (maxValue === "" || maxValue === null || maxValue === undefined);

  const summaryLabel = isAllOpen
    ? "Any"
    : maxValue === "" || Number(maxValue) >= maxBound
    ? `${safeMin}+ ${unit}`
    : `${safeMin} – ${safeMax} ${unit}`;

  return (
    <div className={`flex flex-col gap-1 pt-0.5 ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <div className="flex items-center justify-between text-[0.72rem] font-['IBM_Plex_Mono',monospace]">
        <span className="text-[#5A6777]">
          {minBound} {unit}
        </span>
        <span className="text-[#9C6B12] font-semibold bg-[#FAF4E8] border border-[#E5D2A8] rounded-[3px] px-1.5 py-0.5 leading-none">
          {summaryLabel}
        </span>
        <span className="text-[#5A6777]">
          {maxBound}+ {unit}
        </span>
      </div>

      <div className="relative h-6 flex items-center select-none">
        {/* Background Track */}
        <div className="w-full h-[5px] rounded-[3px] bg-[#E2E7EF] relative overflow-hidden">
          <div
            className="absolute top-0 bottom-0 bg-[#9C6B12] transition-[left,right] duration-75"
            style={{
              left: `${leftPct}%`,
              right: `${100 - rightPct}%`,
            }}
          />
        </div>

        {/* Min Thumb */}
        <input
          type="range"
          min={minBound}
          max={maxBound}
          step={step}
          value={safeMin}
          aria-label={`Minimum ${unit}`}
          onChange={(e) => {
            const nextMin = Math.min(Number(e.target.value), safeMax);
            const nextMinStr =
              nextMin <= minBound && (maxValue === "" || maxValue === undefined)
                ? ""
                : String(nextMin);
            onChange?.(nextMinStr, maxValue === undefined ? "" : String(maxValue));
          }}
          className={`jv-range-input absolute inset-0 w-full m-0 ${
            safeMin > maxBound - step * 2 ? "z-30" : "z-20"
          }`}
        />

        {/* Max Thumb */}
        <input
          type="range"
          min={minBound}
          max={maxBound}
          step={step}
          value={safeMax}
          aria-label={`Maximum ${unit}`}
          onChange={(e) => {
            const nextMax = Math.max(Number(e.target.value), safeMin);
            const nextMaxStr = nextMax >= maxBound ? "" : String(nextMax);
            const nextMinStr =
              minValue === "" && nextMaxStr !== ""
                ? String(minBound)
                : minValue === undefined
                ? ""
                : String(minValue);
            onChange?.(nextMinStr, nextMaxStr);
          }}
          className="jv-range-input absolute inset-0 w-full m-0 z-20"
        />
      </div>
    </div>
  );
}

export default function JobFilterModal({
  isOpen,
  onClose,
  jobs = [],
  vaultOptions = [],
  searchQuery,
  selectedVault,
  selectedSource,
  selectedStatus,
  advancedFilters,
  onApply,
  onResetAll,
}) {
  const [draft, setDraft] = useState({
    searchQuery: searchQuery || "",
    vault: selectedVault || "all",
    source: selectedSource || "all",
    status: selectedStatus || "all",
    ...DEFAULT_ADVANCED_FILTERS,
    ...advancedFilters,
  });

  useEffect(() => {
    if (!isOpen) return;
    setDraft({
      searchQuery: searchQuery || "",
      vault: selectedVault || "all",
      source: selectedSource || "all",
      status: selectedStatus || "all",
      ...DEFAULT_ADVANCED_FILTERS,
      ...advancedFilters,
    });
  }, [isOpen, searchQuery, selectedVault, selectedSource, selectedStatus, advancedFilters]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [isOpen, onClose]);

  const vaultOptionsWithCounts = useMemo(() => {
    const counts = new Map();
    for (const job of jobs) {
      for (const v of getJobVaults(job)) {
        if (v) counts.set(v, (counts.get(v) || 0) + 1);
      }
    }
    const list = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }));

    if (draft.vault && draft.vault !== "all" && !counts.has(draft.vault)) {
      list.unshift({ name: draft.vault, count: 0 });
    }
    if (list.length === 0) {
      const fallback = vaultOptions.length > 0 ? vaultOptions : VAULTS;
      return fallback.map((name) => ({ name, count: 0 }));
    }
    return list;
  }, [jobs, vaultOptions, draft.vault]);

  const sourceOptionsWithCounts = useMemo(() => {
    const counts = new Map();
    for (const job of jobs) {
      if (job.source_app) {
        counts.set(job.source_app, (counts.get(job.source_app) || 0) + 1);
      }
    }
    const list = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }));

    if (draft.source && draft.source !== "all" && !counts.has(draft.source)) {
      list.unshift({ name: draft.source, count: 0 });
    }
    if (list.length === 0) {
      return SOURCES.map((name) => ({ name, count: 0 }));
    }
    return list;
  }, [jobs, draft.source]);

  const statusOptionsWithCounts = useMemo(() => {
    const labelMap = {
      synced: "In sheet",
      review: "Needs review",
      duplicate: "Duplicates",
      rejected: "Rejected",
    };
    const counts = new Map();
    for (const job of jobs) {
      if (job.status) counts.set(job.status, (counts.get(job.status) || 0) + 1);
    }
    const orderedKeys = ["synced", "review", "duplicate", "rejected"];
    const extraKeys = Array.from(counts.keys()).filter((k) => !orderedKeys.includes(k));
    return [...orderedKeys, ...extraKeys]
      .filter((k) => counts.has(k) || draft.status === k)
      .map((key) => ({
        key,
        label: labelMap[key] || key,
        count: counts.get(key) || 0,
      }));
  }, [jobs, draft.status]);

  const salaryStats = useMemo(() => {
    const parsedList = jobs.map((j) => parseSalaryLpa(j.salary));
    const disclosed = parsedList.filter(Boolean);
    const mentionedCount = disclosed.length;
    const notMentionedCount = jobs.length - mentionedCount;

    const maxVal = disclosed.length > 0 ? Math.max(...disclosed.map((s) => s.max)) : 20;
    const roundedMax =
      maxVal <= 15
        ? Math.max(10, Math.ceil(maxVal / 5) * 5)
        : Math.ceil(maxVal / 10) * 10;
    const step = roundedMax > 60 ? 5 : roundedMax > 25 ? 1 : 0.5;

    const candidateBands = [
      { label: "0 – 5 LPA", min: "0", max: "5" },
      { label: "5 – 10 LPA", min: "5", max: "10" },
      { label: "10 – 25 LPA", min: "10", max: "25" },
      { label: "25 – 50 LPA", min: "25", max: "50" },
      { label: "50 – 100 LPA", min: "50", max: "100" },
      { label: "100+ LPA", min: "100", max: "" },
    ];

    const dynamicPresets = [{ label: "Any", min: "", max: "" }];
    for (const band of candidateBands) {
      const bMin = Number(band.min);
      const bMax = band.max !== "" ? Number(band.max) : Infinity;
      const matchesAny = disclosed.some((s) => s.max >= bMin && s.min <= bMax);
      if (matchesAny) {
        dynamicPresets.push(band);
      }
    }

    return {
      mentionedCount,
      notMentionedCount,
      minBound: 0,
      maxBound: roundedMax,
      step,
      presets: dynamicPresets,
    };
  }, [jobs]);

  const expStats = useMemo(() => {
    const parsedList = jobs.map((j) => parseExperienceRange(j)).filter(Boolean);
    const finiteMaxes = parsedList.map((e) => (e.max >= 99 ? e.min : e.max));
    const maxObserved = finiteMaxes.length > 0 ? Math.max(...finiteMaxes) : 15;
    const maxBound = Math.max(10, Math.ceil(maxObserved / 5) * 5);

    const candidateBands = [
      { label: "Fresher (0–1y)", min: "0", max: "1" },
      { label: "1–3 yrs", min: "1", max: "3" },
      { label: "3–7 yrs", min: "3", max: "7" },
      { label: "7–12 yrs", min: "7", max: "12" },
      { label: "12–20 yrs", min: "12", max: "20" },
      { label: "20+ yrs", min: "20", max: "" },
    ];

    const dynamicPresets = [{ label: "Any", min: "", max: "" }];
    for (const band of candidateBands) {
      const bMin = Number(band.min);
      const bMax = band.max !== "" ? Number(band.max) : Infinity;
      const matchesAny = parsedList.some((e) => e.max >= bMin && e.min <= bMax);
      if (matchesAny) {
        dynamicPresets.push(band);
      }
    }

    return {
      minBound: 0,
      maxBound,
      presets: dynamicPresets,
    };
  }, [jobs]);

  const availableWorkModes = useMemo(() => {
    const counts = new Map();
    for (const job of jobs) {
      const mode = getNormalizedWorkMode(job);
      if (mode) counts.set(mode, (counts.get(mode) || 0) + 1);
    }
    const order = ["Remote", "Hybrid", "Onsite"];
    return order
      .filter((m) => counts.has(m) || draft.workMode === m)
      .map((mode) => ({ mode, count: counts.get(mode) || 0 }));
  }, [jobs, draft.workMode]);

  const confidenceOptions = useMemo(() => {
    const thresholds = [70, 80, 90, 95, 98];
    return thresholds
      .map((t) => ({
        key: String(t),
        label: `${t}%+`,
        count: jobs.filter((j) => getNormalizedConfidencePct(j) >= t).length,
      }))
      .filter((opt) => opt.count > 0 || draft.minConfidence === opt.key);
  }, [jobs, draft.minConfidence]);

  const availableLocations = useMemo(() => {
    const byKey = new Map();
    for (const job of jobs) {
      const loc = (job.location || "").trim();
      if (loc && loc !== "—") {
        const key = loc.toLowerCase();
        const existing = byKey.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          byKey.set(key, { name: loc, count: 1 });
        }
      }
    }
    const list = Array.from(byKey.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    if (draft.location && !byKey.has(draft.location.toLowerCase())) {
      list.unshift({ name: draft.location, count: 0 });
    }
    return list;
  }, [jobs, draft.location]);

  const availableCountries = useMemo(() => {
    const byKey = new Map();
    for (const job of jobs) {
      const c = (job.country || "").trim();
      if (c && c !== "—") {
        const key = c.toLowerCase();
        const existing = byKey.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          byKey.set(key, { name: c, count: 1 });
        }
      }
    }
    const list = Array.from(byKey.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    if (
      draft.country &&
      draft.country !== "all" &&
      !byKey.has(draft.country.toLowerCase())
    ) {
      list.unshift({ name: draft.country, count: 0 });
    }
    return list;
  }, [jobs, draft.country]);

  const previewMatchCount = useMemo(() => {
    return jobs.filter((job) => {
      if (draft.searchQuery.trim()) {
        const q = draft.searchQuery.toLowerCase();
        const hit =
          job.title?.toLowerCase().includes(q) ||
          job.company?.toLowerCase().includes(q) ||
          job.location?.toLowerCase().includes(q) ||
          job.salary?.toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (draft.vault !== "all" && !getJobVaults(job).includes(draft.vault)) {
        return false;
      }
      if (draft.source !== "all" && job.source_app !== draft.source) {
        return false;
      }
      if (draft.status !== "all" && job.status !== draft.status) {
        return false;
      }
      return matchesAdvancedFilters(job, draft);
    }).length;
  }, [jobs, draft]);

  if (!isOpen || typeof document === "undefined") return null;

  const updateDraft = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetModal = () => {
    setDraft({
      searchQuery: "",
      vault: "all",
      source: "all",
      status: "all",
      ...DEFAULT_ADVANCED_FILTERS,
    });
    onResetAll?.();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onApply?.(draft);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9998] bg-[#0A0F14]/55 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-4 overscroll-none"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-filter-modal-title"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[1080px] bg-white border border-[#DCE1E8] rounded-[6px] shadow-[0_18px_48px_rgba(10,15,20,0.28)] flex flex-col max-h-[92vh] overflow-hidden overscroll-contain"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-[#DCE1E8] bg-[#F8FAFC] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 rounded-[4px] bg-[#FAF4E8] border border-[#E5D2A8] text-[#9C6B12] flex items-center justify-center shrink-0">
              <FiSliders className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <h2
                id="job-filter-modal-title"
                className="font-['Bricolage_Grotesque',sans-serif] text-[1.05rem] font-bold text-[#15202C] leading-tight m-0"
              >
                Filter jobs
              </h2>
              <p className="text-[0.75rem] text-[#5A6777] m-0 mt-0.5">
                Filter by salary range, experience, vault, source, work mode, location & confidence.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close filter modal"
            className="w-8 h-8 rounded-[4px] border border-[#DCE1E8] bg-white hover:bg-[#F1F3F6] text-[#5A6777] hover:text-[#15202C] flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:px-5 sm:py-4 overflow-y-auto overscroll-contain flex flex-col gap-3">
          {/* Row 1: Keyword Search + Vault + Source + Status + Sort */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            <div className="flex flex-col gap-1 lg:col-span-4">
              <label className="text-[0.7rem] uppercase tracking-[0.06em] font-semibold text-[#5A6777]">
                Search keyword
              </label>
              <input
                type="search"
                value={draft.searchQuery}
                onChange={(e) => updateDraft("searchQuery", e.target.value)}
                placeholder="Job title, company, city, salary..."
                className="border border-[#DCE1E8] bg-white rounded-[4px] px-2.5 py-1.5 text-[0.82rem] text-[#15202C] focus:outline-none focus:border-[#9C6B12]"
              />
            </div>

            <div className="flex flex-col gap-1 lg:col-span-2">
              <label className="text-[0.7rem] uppercase tracking-[0.06em] font-semibold text-[#5A6777]">
                Vault
              </label>
              <select
                value={draft.vault}
                onChange={(e) => updateDraft("vault", e.target.value)}
                className="border border-[#DCE1E8] bg-white rounded-[4px] px-2 py-1.5 text-[0.82rem] text-[#15202C] focus:outline-none focus:border-[#9C6B12] cursor-pointer"
              >
                <option value="all">All vaults</option>
                {vaultOptionsWithCounts.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1 lg:col-span-2">
              <label className="text-[0.7rem] uppercase tracking-[0.06em] font-semibold text-[#5A6777]">
                Source
              </label>
              <select
                value={draft.source}
                onChange={(e) => updateDraft("source", e.target.value)}
                className="border border-[#DCE1E8] bg-white rounded-[4px] px-2 py-1.5 text-[0.82rem] text-[#15202C] focus:outline-none focus:border-[#9C6B12] cursor-pointer"
              >
                <option value="all">All sources</option>
                {sourceOptionsWithCounts.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1 lg:col-span-2">
              <label className="text-[0.7rem] uppercase tracking-[0.06em] font-semibold text-[#5A6777]">
                Status
              </label>
              <select
                value={draft.status}
                onChange={(e) => updateDraft("status", e.target.value)}
                className="border border-[#DCE1E8] bg-white rounded-[4px] px-2 py-1.5 text-[0.82rem] text-[#15202C] focus:outline-none focus:border-[#9C6B12] cursor-pointer"
              >
                <option value="all">All statuses</option>
                {statusOptionsWithCounts.map((st) => (
                  <option key={st.key} value={st.key}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1 lg:col-span-2">
              <label className="text-[0.7rem] uppercase tracking-[0.06em] font-semibold text-[#5A6777]">
                Sort order
              </label>
              <select
                value={draft.sortBy}
                onChange={(e) => updateDraft("sortBy", e.target.value)}
                className="border border-[#DCE1E8] bg-white rounded-[4px] px-2 py-1.5 text-[0.82rem] text-[#15202C] focus:outline-none focus:border-[#9C6B12] cursor-pointer"
              >
                <option value="default">Default order</option>
                <option value="confidence_desc">Confidence: High to Low</option>
                <option value="exp_asc">Experience: Low to High</option>
                <option value="exp_desc">Experience: High to Low</option>
                <option value="salary_desc">Salary: High to Low</option>
              </select>
            </div>
          </div>

          {/* Row 3: Salary Range & Experience Range Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Salary Range (LPA approx.) */}
            <div className="border border-[#DCE1E8] rounded-[4px] p-3.5 bg-[#FAFBFD] flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[0.72rem] uppercase tracking-[0.06em] font-semibold text-[#5A6777]">
                  Salary range (LPA approx.)
                </span>
                <div className="inline-flex border border-[#DCE1E8] rounded-[4px] bg-white overflow-hidden">
                  {[
                    { key: "all", label: "All" },
                    { key: "disclosed", label: "Mentioned" },
                    { key: "undisclosed", label: "Not mentioned" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => {
                        updateDraft("salaryMode", opt.key);
                        if (opt.key === "undisclosed") {
                          setDraft((prev) => ({
                            ...prev,
                            salaryMode: "undisclosed",
                            salaryMinLpa: "",
                            salaryMaxLpa: "",
                          }));
                        }
                      }}
                      className={`px-2 py-1 text-[0.72rem] font-semibold border-r border-[#DCE1E8] last:border-r-0 transition-colors cursor-pointer ${
                        draft.salaryMode === opt.key
                          ? "bg-[#15202C] text-white"
                          : "text-[#5A6777] hover:bg-[#F6F7F9]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {salaryStats.presets.map((preset) => {
                  const isActive =
                    String(draft.salaryMinLpa) === preset.min &&
                    String(draft.salaryMaxLpa) === preset.max &&
                    draft.salaryMode !== "undisclosed";
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          salaryMode:
                            preset.min === "" && preset.max === ""
                              ? prev.salaryMode === "undisclosed"
                                ? "all"
                                : prev.salaryMode
                              : "disclosed",
                          salaryMinLpa: preset.min,
                          salaryMaxLpa: preset.max,
                        }))
                      }
                      className={`px-2.5 py-1 rounded-[4px] text-[0.76rem] font-semibold border transition-colors cursor-pointer ${
                        isActive
                          ? "border-[#9C6B12] bg-[#FAF4E8] text-[#9C6B12]"
                          : "border-[#DCE1E8] bg-white text-[#5A6777] hover:border-[#5A6777] hover:text-[#15202C]"
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              <DualRangeSlider
                minBound={salaryStats.minBound}
                maxBound={salaryStats.maxBound}
                step={salaryStats.step}
                minValue={draft.salaryMinLpa}
                maxValue={draft.salaryMaxLpa}
                unit="LPA"
                disabled={draft.salaryMode === "undisclosed"}
                onChange={(nextMin, nextMax) =>
                  setDraft((prev) => ({
                    ...prev,
                    salaryMode:
                      nextMin !== "" || nextMax !== "" ? "disclosed" : "all",
                    salaryMinLpa: nextMin,
                    salaryMaxLpa: nextMax,
                  }))
                }
              />

              <div className="grid grid-cols-2 gap-2.5 mt-auto">
                <div className="flex flex-col gap-1">
                  <label className="text-[0.72rem] text-[#5A6777]">Min salary (LPA)</label>
                  <input
                    type="number"
                    min="0"
                    step={salaryStats.step}
                    placeholder={`e.g. ${salaryStats.minBound}`}
                    value={draft.salaryMinLpa}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        salaryMode: e.target.value ? "disclosed" : prev.salaryMode,
                        salaryMinLpa: e.target.value,
                      }))
                    }
                    className="border border-[#DCE1E8] bg-white rounded-[4px] px-2.5 py-1.5 text-[0.82rem] text-[#15202C] font-['IBM_Plex_Mono',monospace] focus:outline-none focus:border-[#9C6B12]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[0.72rem] text-[#5A6777]">Max salary (LPA)</label>
                  <input
                    type="number"
                    min="0"
                    step={salaryStats.step}
                    placeholder={`e.g. ${salaryStats.maxBound}`}
                    value={draft.salaryMaxLpa}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        salaryMode: e.target.value ? "disclosed" : prev.salaryMode,
                        salaryMaxLpa: e.target.value,
                      }))
                    }
                    className="border border-[#DCE1E8] bg-white rounded-[4px] px-2.5 py-1.5 text-[0.82rem] text-[#15202C] font-['IBM_Plex_Mono',monospace] focus:outline-none focus:border-[#9C6B12]"
                  />
                </div>
              </div>
            </div>

            {/* Experience Range (Years) */}
            <div className="border border-[#DCE1E8] rounded-[4px] p-3.5 bg-[#FAFBFD] flex flex-col gap-2.5">
              <div className="flex items-center justify-between min-h-[26px]">
                <span className="text-[0.72rem] uppercase tracking-[0.06em] font-semibold text-[#5A6777]">
                  Experience range (Years)
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {expStats.presets.map((preset) => {
                  const isActive =
                    String(draft.expMin) === preset.min &&
                    String(draft.expMax) === preset.max;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          expMin: preset.min,
                          expMax: preset.max,
                        }))
                      }
                      className={`px-2.5 py-1 rounded-[4px] text-[0.76rem] font-semibold border transition-colors cursor-pointer ${
                        isActive
                          ? "border-[#9C6B12] bg-[#FAF4E8] text-[#9C6B12]"
                          : "border-[#DCE1E8] bg-white text-[#5A6777] hover:border-[#5A6777] hover:text-[#15202C]"
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              <DualRangeSlider
                minBound={expStats.minBound}
                maxBound={expStats.maxBound}
                step={1}
                minValue={draft.expMin}
                maxValue={draft.expMax}
                unit="yrs"
                onChange={(nextMin, nextMax) =>
                  setDraft((prev) => ({
                    ...prev,
                    expMin: nextMin,
                    expMax: nextMax,
                  }))
                }
              />

              <div className="grid grid-cols-2 gap-2.5 mt-auto">
                <div className="flex flex-col gap-1">
                  <label className="text-[0.72rem] text-[#5A6777]">Min years</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder={`e.g. ${expStats.minBound}`}
                    value={draft.expMin}
                    onChange={(e) => updateDraft("expMin", e.target.value)}
                    className="border border-[#DCE1E8] bg-white rounded-[4px] px-2.5 py-1.5 text-[0.82rem] text-[#15202C] font-['IBM_Plex_Mono',monospace] focus:outline-none focus:border-[#9C6B12]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[0.72rem] text-[#5A6777]">Max years</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder={`e.g. ${expStats.maxBound}`}
                    value={draft.expMax}
                    onChange={(e) => updateDraft("expMax", e.target.value)}
                    className="border border-[#DCE1E8] bg-white rounded-[4px] px-2.5 py-1.5 text-[0.82rem] text-[#15202C] font-['IBM_Plex_Mono',monospace] focus:outline-none focus:border-[#9C6B12]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Work Mode + Confidence + Location + Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            <div className="flex flex-col gap-1 lg:col-span-3">
              <label className="text-[0.7rem] uppercase tracking-[0.06em] font-semibold text-[#5A6777]">
                Work mode
              </label>
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => updateDraft("workMode", "all")}
                  className={`px-2 py-1.5 rounded-[4px] text-[0.75rem] font-semibold border transition-colors cursor-pointer ${
                    draft.workMode === "all"
                      ? "border-[#15202C] bg-[#15202C] text-white"
                      : "border-[#DCE1E8] bg-white text-[#5A6777] hover:border-[#5A6777] hover:text-[#15202C]"
                  }`}
                >
                  All
                </button>
                {availableWorkModes.map(({ mode }) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => updateDraft("workMode", mode)}
                    className={`px-2 py-1.5 rounded-[4px] text-[0.75rem] font-semibold border transition-colors cursor-pointer ${
                      draft.workMode === mode
                        ? "border-[#15202C] bg-[#15202C] text-white"
                        : "border-[#DCE1E8] bg-white text-[#5A6777] hover:border-[#5A6777] hover:text-[#15202C]"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1 lg:col-span-4">
              <label className="text-[0.7rem] uppercase tracking-[0.06em] font-semibold text-[#5A6777]">
                Minimum AI confidence
              </label>
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => updateDraft("minConfidence", "all")}
                  className={`px-2 py-1.5 rounded-[4px] text-[0.75rem] font-semibold border transition-colors cursor-pointer font-['IBM_Plex_Mono',monospace] ${
                    draft.minConfidence === "all"
                      ? "border-[#15202C] bg-[#15202C] text-white"
                      : "border-[#DCE1E8] bg-white text-[#5A6777] hover:border-[#5A6777] hover:text-[#15202C]"
                  }`}
                >
                  Any
                </button>
                {confidenceOptions.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => updateDraft("minConfidence", opt.key)}
                    className={`px-2 py-1.5 rounded-[4px] text-[0.75rem] font-semibold border transition-colors cursor-pointer font-['IBM_Plex_Mono',monospace] ${
                      draft.minConfidence === opt.key
                        ? "border-[#15202C] bg-[#15202C] text-white"
                        : "border-[#DCE1E8] bg-white text-[#5A6777] hover:border-[#5A6777] hover:text-[#15202C]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1 lg:col-span-3">
              <label className="text-[0.7rem] uppercase tracking-[0.06em] font-semibold text-[#5A6777]">
                Location / City
              </label>
              <select
                value={draft.location}
                onChange={(e) => updateDraft("location", e.target.value)}
                className="border border-[#DCE1E8] bg-white rounded-[4px] px-2 py-1.5 text-[0.82rem] text-[#15202C] focus:outline-none focus:border-[#9C6B12] cursor-pointer"
              >
                <option value="">All locations</option>
                {availableLocations.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1 lg:col-span-2">
              <label className="text-[0.7rem] uppercase tracking-[0.06em] font-semibold text-[#5A6777]">
                Country
              </label>
              <select
                value={draft.country}
                onChange={(e) => updateDraft("country", e.target.value)}
                className="border border-[#DCE1E8] bg-white rounded-[4px] px-2 py-1.5 text-[0.82rem] text-[#15202C] focus:outline-none focus:border-[#9C6B12] cursor-pointer"
              >
                <option value="all">All countries</option>
                {availableCountries.map((country) => (
                  <option key={country.name} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-3 border-t border-[#DCE1E8] bg-[#F8FAFC] flex items-center justify-between gap-2.5 flex-wrap shrink-0">
          <button
            type="button"
            onClick={handleResetModal}
            className="border border-[#DCE1E8] bg-white hover:border-[#5A6777] text-[#5A6777] hover:text-[#15202C] rounded-[4px] px-3 py-1.5 text-[0.8rem] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FiRotateCcw className="w-3.5 h-3.5" />
            <span>Reset all</span>
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="border border-[#DCE1E8] bg-white hover:border-[#5A6777] text-[#15202C] rounded-[4px] px-3.5 py-1.5 text-[0.82rem] font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="border border-[#9C6B12] bg-[#9C6B12] hover:brightness-105 text-white rounded-[4px] px-4 py-1.5 text-[0.82rem] font-semibold transition-all cursor-pointer shadow-xs"
            >
              Apply filters ({previewMatchCount})
            </button>
          </div>
        </div>
      </form>
    </div>,
    document.body
  );
}
