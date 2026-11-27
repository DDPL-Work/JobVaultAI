import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
  FiImage,
  FiFileText,
  FiAlertTriangle,
  FiCopy,
  FiAlertCircle,
} from "react-icons/fi";
import JobDetailDrawer from "../components/jobs/JobDetailDrawer";
import ScreenshotLightbox from "../components/screenshots/ScreenshotLightbox";
import ErrorFallback from "../components/common/ErrorFallback";
import TruncatedText from "../components/common/TruncatedText";
import {
  DashboardKpiSkeleton,
  DashboardTableSkeleton,
  DashboardListCardSkeleton,
  DashboardSparkSkeleton,
} from "../components/common/LoadingSkeletons";
import { getJobVaults } from "../components/jobs/jobsData";
import {
  fetchDashboardStats,
  fetchRecentJobs,
} from "../apis/thunks/dashboardThunks";
import {
  updateJob,
  approveJob,
  rejectJob,
  restoreJob,
} from "../apis/thunks/jobsThunks";
import {
  updateRecentJobStatus,
  updateRecentJob,
} from "../apis/slices/dashboardSlice";
import { getUser } from "../apis/apiClient";

// Platform brand colors matching the HTML design
const SOURCE_COLORS = {
  LinkedIn: "#0A66C2",
  WhatsApp: "#25A35A",
  Telegram: "#2A86C9",
  Instagram: "#D6336C",
  Other: "#7A8696",
};



/**
 * Reusable KPI Card Component
 */
function KpiCard({
  to,
  label,
  value,
  description,
  icon: Icon,
  iconClassName = "bg-[#F6F7F9] border-[#DCE1E8] text-[#5A6777]",
  isAttn = false,
  isBad = false,
}) {
  const cardContent = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="text-[0.7rem] uppercase tracking-[0.08em] font-semibold text-[#5A6777] leading-snug pt-0.5">
          {label}
        </span>
        {Icon && (
          <span
            className={`w-7 h-7 rounded-[6px] border flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${iconClassName}`}
            aria-hidden="true"
          >
            <Icon className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
      <span
        className={`font-['Bricolage_Grotesque',sans-serif] text-[1.8rem] font-bold tabular-nums leading-[1.1] ${
          isAttn ? "text-[#9A5B00]" : isBad ? "text-[#A8281F]" : "text-[#15202C]"
        }`}
      >
        {value}
      </span>
      <span className="text-[0.78rem] text-[#5A6777]">{description}</span>
    </>
  );

  const baseClasses = `group p-[14px_16px] rounded-[8px] flex flex-col gap-1 transition-all duration-300 ease-out ${
    isAttn
      ? "bg-[#FBEBCF] border border-transparent"
      : "bg-white border border-[#DCE1E8] hover:border-[#5A6777]"
  }`;

  if (to) {
    return (
      <Link to={to} className={baseClasses}>
        {cardContent}
      </Link>
    );
  }

  return <div className={baseClasses}>{cardContent}</div>;
}

/**
 * Reusable Status Pill Component
 */
function StatusPill({ status }) {
  switch (status) {
    case "synced":
      return (
        <span className="inline-flex items-center gap-1.5 text-[0.72rem] font-semibold rounded-full px-2.5 py-0.5 whitespace-nowrap text-[#24734A] bg-[#DCF0E3]">
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
          In sheet
        </span>
      );
    case "review":
      return (
        <span className="inline-flex items-center gap-1.5 text-[0.72rem] font-semibold rounded-full px-2.5 py-0.5 whitespace-nowrap text-[#9A5B00] bg-[#FBEBCF]">
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
          Needs review
        </span>
      );
    case "duplicate":
      return (
        <span className="inline-flex items-center gap-1.5 text-[0.72rem] font-semibold rounded-full px-2.5 py-0.5 whitespace-nowrap text-[#5A6777] bg-[#F6F7F9]">
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
          Duplicate
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center gap-1.5 text-[0.72rem] font-semibold rounded-full px-2.5 py-0.5 whitespace-nowrap text-[#A8281F] bg-[#F8DEDB]">
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
          Rejected
        </span>
      );
    default:
      return null;
  }
}

/**
 * Reusable Source Tag Component
 */
function SourceTag({ source }) {
  const color = SOURCE_COLORS[source] || SOURCE_COLORS.Other;
  return (
    <span className="inline-flex items-center text-[0.76rem] font-semibold whitespace-nowrap text-[#15202C]">
      <i
        className="inline-block w-2 h-2 rounded-[2px] mr-1.5 shrink-0"
        style={{ backgroundColor: color }}
      ></i>
      {source}
    </span>
  );
}

/**
 * Main Dashboard Page
 */
export default function Dashboard() {
  const dispatch = useDispatch();
  const {
    stats: STATS,
    recentJobs,
    loadingStats,
    loadingJobs,
    statsLoaded,
    error,
  } = useSelector((state) => state.dashboard);
  const reduxUser = useSelector((state) => state.auth?.user);
  const storedUser = getUser();
  const hasIdentity = (u) => Boolean(u && (u.username || u.name || u.email));
  const currentUser =
    (hasIdentity(reduxUser) ? reduxUser : null) ||
    (hasIdentity(storedUser) ? storedUser : null) ||
    {};
  const displayName =
    currentUser.username ||
    currentUser.name ||
    (currentUser.email ? currentUser.email.split("@")[0] : "");

  const [selectedJob, setSelectedJob] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);
  const [barsReady, setBarsReady] = useState(false);
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());
  const [recentScrollState, setRecentScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
  });
  const recentJobsScrollRef = useRef(null);

  const syncRecentScrollState = useCallback(() => {
    const el = recentJobsScrollRef.current;
    if (!el) {
      setRecentScrollState({ canScrollLeft: false, canScrollRight: false });
      return;
    }
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setRecentScrollState({
      canScrollLeft: el.scrollLeft > 2,
      canScrollRight: maxScrollLeft > 2 && el.scrollLeft < maxScrollLeft - 2,
    });
  }, []);

  useEffect(() => {
    syncRecentScrollState();
    const el = recentJobsScrollRef.current;
    if (!el) return;

    let observer;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => {
        syncRecentScrollState();
      });
      observer.observe(el);
      if (el.firstElementChild) {
        observer.observe(el.firstElementChild);
      }
    }
    window.addEventListener("resize", syncRecentScrollState);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", syncRecentScrollState);
    };
  }, [syncRecentScrollState, recentJobs, loadingJobs]);

  const handleScrollRecentJobs = (direction) => {
    const el = recentJobsScrollRef.current;
    if (!el) return;
    const step = Math.max(220, Math.round(el.clientWidth * 0.45));
    el.scrollBy({
      left: direction === "left" ? -step : step,
      behavior: "smooth",
    });
  };

  const handleRetryDashboard = () => {
    dispatch(fetchDashboardStats());
    dispatch(fetchRecentJobs(8));
  };

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchRecentJobs(8));
  }, [dispatch]);

  // Trigger smooth bar fill animation from 0% once live stats arrive
  const hasStatsData =
    Object.keys(STATS.byVault || {}).length > 0 ||
    (STATS.bySource || []).length > 0 ||
    (STATS.days || []).some((d) => Number(d.count ?? d.n ?? 0) > 0);

  useEffect(() => {
    if (!hasStatsData || barsReady) return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setBarsReady(true);
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [hasStatsData, barsReady]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const greeting =
    currentHour >= 5 && currentHour < 12
      ? "Good morning"
      : currentHour >= 12 && currentHour < 16
      ? "Good afternoon"
      : currentHour >= 16 && currentHour < 20
      ? "Good evening"
      : "Good night";
  const greetingText = displayName ? `${greeting}, ${displayName}` : greeting;

  const handleJobStatusChange = async (jobId, newStatus) => {
    dispatch(updateRecentJobStatus({ jobId, newStatus }));
    setSelectedJob((prev) =>
      prev && prev.id === jobId ? { ...prev, status: newStatus } : prev
    );

    try {
      if (newStatus === "synced") {
        await dispatch(approveJob(jobId)).unwrap();
      } else if (newStatus === "rejected") {
        await dispatch(rejectJob(jobId)).unwrap();
      } else if (newStatus === "review") {
        await dispatch(restoreJob(jobId)).unwrap();
      } else {
        await dispatch(
          updateJob({ jobId, updates: { status: newStatus } })
        ).unwrap();
      }
      toast.success(
        newStatus === "rejected"
          ? "Job rejected"
          : newStatus === "review"
          ? "Job moved to review"
          : newStatus === "synced"
          ? "Approved & added to sheet"
          : "Job status updated"
      );
      dispatch(fetchDashboardStats());
      dispatch(fetchRecentJobs(8));
    } catch (err) {
      toast.error(
        (typeof err === "string" ? err : err?.message) ||
          "Failed to update job status"
      );
      dispatch(fetchRecentJobs(8));
      throw err;
    }
  };

  const handleJobUpdate = async (updatedJob) => {
    try {
      const saved = await dispatch(
        updateJob({ jobId: updatedJob.id, updates: updatedJob })
      ).unwrap();
      const nextJob = saved?.id ? saved : updatedJob;
      dispatch(updateRecentJob(nextJob));
      setSelectedJob(nextJob);
      toast.success("Job updated successfully");
      dispatch(fetchDashboardStats());
      dispatch(fetchRecentJobs(8));
      return nextJob;
    } catch (err) {
      toast.error(
        (typeof err === "string" ? err : err?.message) ||
          "Failed to update job"
      );
      throw err;
    }
  };

  const maxVaultCount = Math.max(1, ...Object.values(STATS.byVault || {}));
  const maxDayCount = Math.max(
    1,
    ...(STATS.days || []).map((d) => Number(d.count ?? d.n ?? 0))
  );
  const totalSources =
    (STATS.bySource || []).reduce(
      (acc, curr) => acc + Number(curr.count ?? curr.n ?? 0),
      0
    ) || 1;

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[260px]">
          <h1 className="font-['Bricolage_Grotesque',sans-serif] text-[1.65rem] font-bold text-[#15202C] tracking-[-0.01em] leading-tight m-0">
            {greetingText}
          </h1>
          <p className="mt-1 text-[#5A6777] max-w-[65ch] text-[0.875rem] leading-normal m-0">
            Job screenshots are read by AI, checked against the text in the image, sorted into
            vaults and added to your job sheet.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2.5 flex-wrap shrink-0 ml-auto">
          <Link
            to="/jobs"
            className="border border-[#DCE1E8] bg-white text-[#15202C] hover:border-[#5A6777] rounded-[6px] px-3.5 py-1.5 font-semibold text-[0.85rem] inline-flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer select-none"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5 stroke-current fill-none stroke-2"
            >
              <path d="M12 4v12M7 11l5 5 5-5M4 20h16" />
            </svg>
            Export to Excel
          </Link>
          <Link
            to="/inbox"
            className="bg-[#9C6B12] border border-[#9C6B12] text-white hover:brightness-105 rounded-[6px] px-3.5 py-1.5 font-semibold text-[0.85rem] inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer select-none"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5 stroke-current fill-none stroke-2"
            >
              <path d="M12 16V4M7 9l5-5 5 5M4 20h16" />
            </svg>
            Add screenshots
          </Link>
        </div>
      </div>

      {/* Online Demo Banner */}
      {/* <div className="bg-[#FBEBCF] border border-transparent rounded-[6px] p-[12px_14px] text-[0.85rem] flex items-start gap-3 text-[#15202C]">
        <b className="text-[#9A5B00] font-bold shrink-0">Online demo</b>
        <span>
          This page runs in your browser with sample data, so any screenshot you add gets a sample
          job. The installed version reads real screenshots with Gemini or OpenAI and saves to a
          database.
        </span>
      </div> */}

      {/* Graceful Error Fallback Banner if live sync failed */}
      {error && !loadingStats && (
        <ErrorFallback
          compact
          title="Could not refresh dashboard"
          message={error}
          onRetry={handleRetryDashboard}
          retrying={loadingStats || loadingJobs}
        />
      )}

      {/* KPI Cards Grid */}
      {loadingStats && !statsLoaded ? (
        <DashboardKpiSkeleton />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 min-[1101px]:grid-cols-5 gap-4">
          <KpiCard
            to="/inbox"
            label="Screenshots this week"
            value={STATS.screenshotsWeek}
            description={`${STATS.screenshots} in total`}
            icon={FiImage}
            iconClassName="bg-[#FAF4E8] border-[#F0DFB8] text-[#9C6B12]"
          />
          <KpiCard
            to="/jobs"
            label="Jobs in sheet"
            value={STATS.inSheet}
            description={`${STATS.addedToday} added today`}
            icon={FiFileText}
            iconClassName="bg-[#DCF0E3]/70 border-[#BCE2CA] text-[#24734A]"
          />
          <KpiCard
            to="/review"
            label="Needs your review"
            value={STATS.review}
            description={`Unclear or below ${STATS.threshold}% confidence`}
            isAttn={STATS.review > 0}
            icon={FiAlertTriangle}
            iconClassName={
              STATS.review > 0
                ? "bg-white/80 border-[#E8C078] text-[#9A5B00]"
                : "bg-[#FAF4E8] border-[#EFE2C6] text-[#9A5B00]"
            }
          />
          <KpiCard
            label="Duplicates skipped"
            value={STATS.duplicates}
            description="Same job shared again"
            icon={FiCopy}
            iconClassName="bg-[#EDF3FA] border-[#D0E0F2] text-[#235F8C]"
          />
          <KpiCard
            to="/inbox"
            label="Failed to read"
            value={STATS.failed}
            description={STATS.failed ? "Open to retry" : "Nothing failed"}
            isBad={STATS.failed > 0}
            icon={FiAlertCircle}
            iconClassName="bg-[#FDF2F2] border-[#F5C2C0] text-[#A8281F]"
          />
        </div>
      )}

      {/* Main 2-Column Split */}
      <div className="grid grid-cols-1 min-[901px]:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] gap-2.5">
        {/* Left Column: Latest Jobs Table */}
        <div className="bg-white border border-[#DCE1E8] rounded-[8px] overflow-hidden">
          <div className="flex items-center justify-between p-[14px_16px] border-b border-[#DCE1E8] flex-wrap gap-2.5">
            <h2 className="font-['Bricolage_Grotesque',sans-serif] text-[1.08rem] font-bold text-[#15202C] tracking-[-0.01em] m-0">
              Latest jobs
            </h2>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/jobs"
                className="text-[#15202C] hover:border-[#5A6777] border border-[#DCE1E8] rounded-[6px] px-2.5 py-1 text-[0.78rem] font-semibold transition-colors whitespace-nowrap"
              >
                Open job sheet
              </Link>
              <div
                className="inline-flex items-center shrink-0 border border-[#DCE1E8] rounded-[6px] bg-white overflow-hidden"
                role="group"
                aria-label="Scroll latest jobs horizontally"
              >
                <button
                  type="button"
                  onClick={() => handleScrollRecentJobs("left")}
                  disabled={!recentScrollState.canScrollLeft}
                  aria-label="Scroll latest jobs left"
                  title="Scroll list left"
                  className={`w-7 h-[29px] flex items-center justify-center border-r border-[#DCE1E8] transition-colors ${
                    recentScrollState.canScrollLeft
                      ? "text-[#15202C] bg-white hover:bg-[#F6F7F9] cursor-pointer"
                      : "text-[#B0BAC5] bg-[#F8FAFC] cursor-not-allowed"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-3.5 h-3.5 stroke-current fill-none stroke-[2.2]"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 18l-6-6 6-6"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleScrollRecentJobs("right")}
                  disabled={!recentScrollState.canScrollRight}
                  aria-label="Scroll latest jobs right"
                  title="Scroll list right"
                  className={`w-7 h-[29px] flex items-center justify-center transition-colors ${
                    recentScrollState.canScrollRight
                      ? "text-[#15202C] bg-white hover:bg-[#F6F7F9] cursor-pointer"
                      : "text-[#B0BAC5] bg-[#F8FAFC] cursor-not-allowed"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-3.5 h-3.5 stroke-current fill-none stroke-[2.2]"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 18l6-6-6-6"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {loadingJobs && recentJobs.length === 0 ? (
            <DashboardTableSkeleton rows={6} />
          ) : (
            <div
              ref={recentJobsScrollRef}
              onScroll={syncRecentScrollState}
              className="w-full overflow-x-auto"
            >
              <table className="w-full min-w-[650px] border-collapse text-[0.84rem]">
                <thead>
                  <tr className="bg-[#F6F7F9]">
                    <th className="text-left text-[0.7rem] uppercase tracking-[0.07em] text-[#5A6777] font-semibold p-[9px_12px] border-b border-[#DCE1E8] whitespace-nowrap">
                      Job
                    </th>
                    <th className="text-left text-[0.7rem] uppercase tracking-[0.07em] text-[#5A6777] font-semibold p-[9px_12px] border-b border-[#DCE1E8] whitespace-nowrap">
                      Vault
                    </th>
                    <th className="text-left text-[0.7rem] uppercase tracking-[0.07em] text-[#5A6777] font-semibold p-[9px_12px] border-b border-[#DCE1E8] whitespace-nowrap">
                      Source
                    </th>
                    <th className="text-left text-[0.7rem] uppercase tracking-[0.07em] text-[#5A6777] font-semibold p-[9px_12px] border-b border-[#DCE1E8] whitespace-nowrap">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentJobs.length > 0 ? (
                    recentJobs.map((job) => {
                      const companyLocation = [job.company, job.location]
                        .map((part) => (typeof part === "string" ? part.trim() : ""))
                        .filter((part) => part && part !== "—")
                        .join(" · ");

                      return (
                        <tr
                          key={job.id}
                          onClick={() => setSelectedJob(job)}
                          className="hover:bg-[#F6F7F9] transition-colors duration-300 ease-out cursor-pointer"
                        >
                          <td className="p-[10px_12px] border-b border-[#DCE1E8] align-middle whitespace-nowrap">
                            <b className="font-semibold block text-[#15202C] leading-snug whitespace-nowrap">
                              {job.title || "—"}
                            </b>
                            <span className="block text-[0.78rem] text-[#5A6777] mt-0.5 leading-snug whitespace-nowrap">
                              {companyLocation || "—"}
                            </span>
                          </td>
                          <td className="p-[10px_12px] border-b border-[#DCE1E8]">
                            <div className="flex items-center gap-1 flex-wrap">
                              {getJobVaults(job).map((v) => {
                                const isRemote = v.toLowerCase().includes("remote");
                                return (
                                  <span
                                    key={v}
                                    className={`text-[0.74rem] font-semibold border rounded-[4px] px-[7px] py-[1px] whitespace-nowrap ${
                                      isRemote
                                        ? "border-[#B5D4F4] bg-[#EAF2FB] text-[#1E568B]"
                                        : "border-[#DCE1E8] bg-[#F6F7F9] text-[#15202C]"
                                    }`}
                                  >
                                    {v}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                          <td className="p-[10px_12px] border-b border-[#DCE1E8] align-middle whitespace-nowrap">
                            <SourceTag source={job.source_app || job.source} />
                          </td>
                          <td className="p-[10px_12px] border-b border-[#DCE1E8] align-middle whitespace-nowrap">
                            <StatusPill status={job.status} />
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-8 text-center text-[#5A6777] text-[0.84rem]"
                      >
                        No jobs added yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Vaults, 14-Day Spark, and Sources */}
        <div className="flex flex-col gap-2.5">
          {/* Jobs per Vault */}
          <div className="bg-white border border-[#DCE1E8] rounded-[8px]">
            <div className="flex items-center justify-between p-[14px_16px] border-b border-[#DCE1E8]">
              <h2 className="font-['Bricolage_Grotesque',sans-serif] text-[1.08rem] font-bold text-[#15202C] tracking-[-0.01em] m-0">
                Jobs per vault
              </h2>
              <Link
                to="/vaults"
                className="text-[#15202C] hover:border-[#5A6777] border border-[#DCE1E8] rounded-[6px] px-2.5 py-1 text-[0.78rem] font-semibold transition-colors"
              >
                Open vaults
              </Link>
            </div>
            {loadingStats && !statsLoaded ? (
              <DashboardListCardSkeleton rows={6} />
            ) : (
              <div className="p-4 flex flex-col gap-[7px]">
                {Object.entries(STATS.byVault || {}).length > 0 ? (
                  Object.entries(STATS.byVault || {}).map(([vaultName, count], idx) => {
                    const widthPercent = (count / maxVaultCount) * 100;
                    return (
                      <div
                        key={vaultName}
                        className="grid grid-cols-[140px_minmax(0,1fr)_36px] max-[620px]:grid-cols-[110px_minmax(0,1fr)_30px] gap-2.5 items-center text-[0.84rem] py-1 px-1.5 -mx-1.5 rounded-[6px] hover:bg-[#F6F7F9] transition-colors duration-300 ease-out"
                      >
                        <TruncatedText
                          as="span"
                          text={vaultName}
                          className="truncate text-[#15202C]"
                        />
                        <div className="h-[10px] rounded-[5px] bg-[#F6F7F9] overflow-hidden border border-[#DCE1E8]">
                          <div
                            className="h-full bg-[#9C6B12] rounded-[5px] min-w-[2px] transition-[width] duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                            style={{
                              width: barsReady ? `${widthPercent}%` : "0%",
                              transitionDelay: `${idx * 70}ms`,
                            }}
                          ></div>
                        </div>
                        <span className="text-right font-['IBM_Plex_Mono',monospace] tabular-nums text-[#15202C]">
                          {count}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <span className="text-[0.82rem] text-[#5A6777] py-2 text-center">
                    No vault data available.
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Jobs Added Last 14 Days */}
          <div className="bg-white border border-[#DCE1E8] rounded-[8px]">
            <div className="flex items-center justify-between p-[14px_16px] border-b border-[#DCE1E8]">
              <h2 className="font-['Bricolage_Grotesque',sans-serif] text-[1.08rem] font-bold text-[#15202C] tracking-[-0.01em] m-0">
                Jobs added, last 14 days
              </h2>
            </div>
            {loadingStats && !statsLoaded ? (
              <DashboardSparkSkeleton />
            ) : (
              <div className="p-4">
                <div className="grid grid-cols-14 gap-1 items-end h-[84px]">
                  {(STATS.days || []).map((item, index) => {
                    const countVal = Number(item.count ?? item.n ?? 0);
                    const dateLabel =
                      item.date ||
                      (item.d ? String(item.d).split("-").pop() : "");
                    const heightPercent = countVal
                      ? Math.max(8, (countVal / maxDayCount) * 100)
                      : 4;
                    return (
                      <div
                        key={index}
                        title={`${item.fullDate || item.d || dateLabel}: ${countVal} jobs`}
                        className={`rounded-t-[3px] min-h-[3px] transition-[height,background-color,opacity] duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:opacity-85 ${
                          countVal ? "bg-[#9C6B12]" : "bg-[#DCE1E8]"
                        }`}
                        style={{
                          height: barsReady ? `${heightPercent}%` : "4%",
                          transitionDelay: `${index * 35}ms`,
                        }}
                      ></div>
                    );
                  })}
                </div>
                <div className="grid grid-cols-14 gap-1 text-[0.68rem] text-[#5A6777] text-center mt-1.5 font-['IBM_Plex_Mono',monospace] tabular-nums">
                  {(STATS.days || []).map((item, index) => {
                    const dateLabel =
                      item.date ||
                      (item.d ? String(item.d).split("-").pop() : "");
                    return <span key={index}>{dateLabel}</span>;
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Where Jobs Come From */}
          <div className="bg-white border border-[#DCE1E8] rounded-[8px]">
            <div className="flex items-center justify-between p-[14px_16px] border-b border-[#DCE1E8]">
              <h2 className="font-['Bricolage_Grotesque',sans-serif] text-[1.08rem] font-bold text-[#15202C] tracking-[-0.01em] m-0">
                Where jobs come from
              </h2>
            </div>
            {loadingStats && !statsLoaded ? (
              <DashboardListCardSkeleton rows={3} />
            ) : (
              <div className="p-4 flex flex-col gap-[7px]">
                {(STATS.bySource || []).length > 0 ? (
                  (STATS.bySource || []).map(({ source, count }, idx) => {
                    const widthPercent = (count / totalSources) * 100;
                    const sourceColor = SOURCE_COLORS[source] || SOURCE_COLORS.Other;
                    return (
                      <div
                        key={source}
                        className="grid grid-cols-[140px_minmax(0,1fr)_36px] max-[620px]:grid-cols-[110px_minmax(0,1fr)_30px] gap-2.5 items-center text-[0.84rem] py-1 px-1.5 -mx-1.5 rounded-[6px] hover:bg-[#F6F7F9] transition-colors duration-300 ease-out"
                      >
                        <span>
                          <SourceTag source={source} />
                        </span>
                        <div className="h-[10px] rounded-[5px] bg-[#F6F7F9] overflow-hidden border border-[#DCE1E8]">
                          <div
                            className="h-full rounded-[5px] min-w-[2px] transition-[width] duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                            style={{
                              width: barsReady ? `${widthPercent}%` : "0%",
                              backgroundColor: sourceColor,
                              transitionDelay: `${idx * 70}ms`,
                            }}
                          ></div>
                        </div>
                        <span className="text-right font-['IBM_Plex_Mono',monospace] tabular-nums text-[#15202C]">
                          {count}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <span className="text-[0.82rem] text-[#5A6777] py-2 text-center">
                    No source data yet.
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slide-over Job Detail Drawer with smooth transitions */}
      <JobDetailDrawer
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onZoomImage={(img) => setZoomImage(img)}
        onStatusChange={handleJobStatusChange}
        onJobUpdate={handleJobUpdate}
        onOpenJobId={(jobId) => {
          const found = recentJobs.find((j) => j.id === jobId);
          if (found) setSelectedJob(found);
        }}
      />

      {/* Lightbox for zooming screenshot */}
      <ScreenshotLightbox
        imageSrc={zoomImage}
        onClose={() => setZoomImage(null)}
      />
    </div>
  );
}
