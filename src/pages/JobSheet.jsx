import { useState, useMemo, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FiSliders } from "react-icons/fi";
import JobSheetToolbar from "../components/jobs/JobSheetToolbar";
import JobSheetTable from "../components/jobs/JobSheetTable";
import JobSheetPagination from "../components/jobs/JobSheetPagination";
import JobDetailDrawer from "../components/jobs/JobDetailDrawer";
import JobFilterModal, {
  DEFAULT_ADVANCED_FILTERS,
  matchesAdvancedFilters,
  sortFilteredJobs,
  countActiveAdvancedFilters,
} from "../components/jobs/JobFilterModal";
import ScreenshotLightbox from "../components/screenshots/ScreenshotLightbox";
import ErrorFallback from "../components/common/ErrorFallback";
import { getJobVaults } from "../components/jobs/jobsData";
import {
  fetchJobs,
  updateJob,
  approveJob,
  rejectJob,
  restoreJob,
} from "../apis/thunks/jobsThunks";
import { fetchDashboardStats } from "../apis/thunks/dashboardThunks";
import { localUpdateJobStatus } from "../apis/slices/jobsSlice";
import {
  downloadBackendExcel,
  downloadBackendCsv,
  copyToClipboardAsExcel,
  WORKBOOK_TABS,
} from "../utils/excelExport";
import { fetchVaults } from "../apis/thunks/vaultsThunks";
import { fetchReviewJobs } from "../apis/thunks/jobsThunks";
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  getEffectivePaginationView,
  getRequestServerPage,
} from "../utils/pagination";

export default function JobSheet() {
  const dispatch = useDispatch();
  const { items: jobs, pagination, loading, loaded, error } = useSelector(
    (state) => state.jobs
  );
  const { vaults: dynamicVaults } = useSelector((state) => state.vaults);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedVault, setSelectedVault] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedJob, setSelectedJob] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState(
    DEFAULT_ADVANCED_FILTERS
  );
  const [tableScrollState, setTableScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
  });
  const tableScrollRef = useRef(null);

  const handleScrollTable = (direction) => {
    const el = tableScrollRef.current;
    if (!el) return;
    const step = Math.max(240, Math.round(el.clientWidth * 0.45));
    el.scrollBy({
      left: direction === "left" ? -step : step,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (!searchQuery) {
      setDebouncedSearch("");
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const serverPage = getRequestServerPage(currentPage, pageSize, pagination);

  const jobsQueryParams = useMemo(
    () => ({
      page: serverPage,
      page_size: pageSize,
      vault: selectedVault,
      source: selectedSource,
      status: selectedStatus,
      q: debouncedSearch.trim(),
    }),
    [
      serverPage,
      pageSize,
      selectedVault,
      selectedSource,
      selectedStatus,
      debouncedSearch,
    ]
  );

  useEffect(() => {
    dispatch(fetchJobs(jobsQueryParams));
  }, [dispatch, jobsQueryParams]);

  useEffect(() => {
    dispatch(fetchVaults());
  }, [dispatch]);

  const activeAdvancedFilterCount = useMemo(
    () => countActiveAdvancedFilters(advancedFilters),
    [advancedFilters]
  );

  const vaultFilterOptions = useMemo(() => {
    return Array.isArray(dynamicVaults)
      ? dynamicVaults.filter((v) => v.is_active !== false).map((v) => v.name)
      : [];
  }, [dynamicVaults]);

  // Filter jobs based on search, vault, source, status, and modal filters
  const filteredJobs = useMemo(() => {
    const matched = jobs.filter((job) => {
      // 1. Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = job.title?.toLowerCase().includes(q);
        const matchesCompany = job.company?.toLowerCase().includes(q);
        const matchesLocation = job.location?.toLowerCase().includes(q);
        const matchesSalary = job.salary?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCompany && !matchesLocation && !matchesSalary) {
          return false;
        }
      }

      // 2. Vault filter (Supports Cross-Vault Dual-Routing Multi-Badges)
      if (selectedVault !== "all") {
        const vaults = getJobVaults(job);
        if (!vaults.includes(selectedVault)) {
          return false;
        }
      }

      // 3. Source filter
      if (selectedSource !== "all" && job.source_app !== selectedSource) {
        return false;
      }

      // 4. Status filter
      if (selectedStatus !== "all" && job.status !== selectedStatus) {
        return false;
      }

      // 5. Advanced Modal Filters
      if (!matchesAdvancedFilters(job, advancedFilters)) {
        return false;
      }

      return true;
    });

    return sortFilteredJobs(matched, advancedFilters.sortBy);
  }, [
    jobs,
    searchQuery,
    selectedVault,
    selectedSource,
    selectedStatus,
    advancedFilters,
  ]);

  const handleApplyModalFilters = (draft) => {
    setSearchQuery(draft.searchQuery || "");
    setSelectedVault(draft.vault || "all");
    setSelectedSource(draft.source || "all");
    setSelectedStatus(draft.status || "all");
    setAdvancedFilters({
      salaryMode: draft.salaryMode,
      salaryMinLpa: draft.salaryMinLpa,
      salaryMaxLpa: draft.salaryMaxLpa,
      expMin: draft.expMin,
      expMax: draft.expMax,
      workMode: draft.workMode,
      location: draft.location,
      country: draft.country,
      minConfidence: draft.minConfidence,
      sortBy: draft.sortBy,
    });
    setCurrentPage(1);
    setFilterModalOpen(false);
  };

  const handleResetAllFilters = () => {
    setSearchQuery("");
    setSelectedVault("all");
    setSelectedSource("all");
    setSelectedStatus("all");
    setAdvancedFilters(DEFAULT_ADVANCED_FILTERS);
    setCurrentPage(1);
  };

  const handleEmptyStateRefresh = async () => {
    handleResetAllFilters();
    await Promise.all([
      dispatch(fetchJobs({ page: 1, page_size: pageSize })),
      dispatch(fetchVaults()),
    ]);
  };

  // Current page sliced cleanly if backend returned a larger minimum batch
  const paginationView = useMemo(
    () =>
      getEffectivePaginationView(filteredJobs, pagination, currentPage, pageSize),
    [filteredJobs, pagination, currentPage, pageSize]
  );
  const paginatedJobs = paginationView.visibleItems;

  // Handle filter changes and reset to page 1
  const handleSearchChange = (q) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };
  const handleVaultChange = (v) => {
    setSelectedVault(v);
    setCurrentPage(1);
  };
  const handleSourceChange = (s) => {
    setSelectedSource(s);
    setCurrentPage(1);
  };
  const handleStatusChange = (st) => {
    setSelectedStatus(st);
    setCurrentPage(1);
  };

  // Copy for Excel (TSV clipboard copy)
  // Copy exact 12 columns for Excel
  const handleCopyForExcel = async () => {
    const targetRows = filteredJobs.filter(
      (j) => selectedStatus !== "all" || j.status === "synced"
    );
    const jobsToCopy = targetRows.length > 0 ? targetRows : filteredJobs;

    const success = await copyToClipboardAsExcel(jobsToCopy);
    if (success) {
      toast.success(
        `${jobsToCopy.length} rows copied in 12-column client format · paste into Excel`
      );
    } else {
      toast.info(`${jobsToCopy.length} rows prepared`);
    }
  };

  // Download Standard 12-Column CSV from GET /api/export.csv
  const handleDownloadCsv = async () => {
    setExportingCsv(true);
    try {
      await downloadBackendCsv(filteredJobs, {
        search: searchQuery,
        vault: selectedVault,
        source: selectedSource,
        status: selectedStatus,
      });
      toast.success("CSV file downloaded");
    } finally {
      setExportingCsv(false);
    }
  };

  // Download Real Multi-Tab .xlsx Workbook from GET /api/export.xlsx
  const handleDownloadExcel = async () => {
    setExportingExcel(true);
    try {
      const activeVaultNames = Array.isArray(dynamicVaults)
        ? dynamicVaults.filter((v) => v.is_active !== false).map((v) => v.name)
        : [];
      const hasAccessVaults = activeVaultNames.some((n) =>
        n.includes("Access Vault")
      );
      const tabs = hasAccessVaults
        ? ["All Jobs", ...activeVaultNames]
        : WORKBOOK_TABS;

      await downloadBackendExcel(jobs, tabs, {
        search: searchQuery,
        vault: selectedVault,
        source: selectedSource,
        status: selectedStatus,
      });
      toast.success("Multi-tab Excel workbook (.xlsx) downloaded");
    } finally {
      setExportingExcel(false);
    }
  };

  // Update status from drawer via live backend APIs
  const handleJobStatusChange = async (jobId, newStatus) => {
    dispatch(localUpdateJobStatus({ jobId, newStatus }));
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
      dispatch(fetchJobs(jobsQueryParams));
      dispatch(fetchReviewJobs());
      dispatch(fetchVaults());
    } catch (err) {
      toast.error(
        (typeof err === "string" ? err : err?.message) ||
          "Failed to update job status"
      );
      dispatch(fetchJobs(jobsQueryParams));
      throw err;
    }
  };

  const handleJobUpdate = async (updatedJob) => {
    try {
      const saved = await dispatch(
        updateJob({ jobId: updatedJob.id, updates: updatedJob })
      ).unwrap();
      const nextJob = saved?.id ? saved : updatedJob;
      setSelectedJob(nextJob);
      toast.success("Job updated successfully");
      dispatch(fetchDashboardStats());
      dispatch(fetchVaults());
      return nextJob;
    } catch (err) {
      toast.error(
        (typeof err === "string" ? err : err?.message) ||
          "Failed to update job"
      );
      throw err;
    }
  };

  return (
    <div className="w-full min-w-0 flex flex-col gap-4 sm:gap-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="font-['Bricolage_Grotesque',sans-serif] text-[1.45rem] sm:text-[1.65rem] font-bold text-[#15202C] tracking-[-0.01em] leading-tight m-0">
            Job sheet
          </h1>
          <p className="mt-1 text-[#5A6777] max-w-[65ch] text-[0.84rem] sm:text-[0.875rem] leading-normal m-0">
            Every job that was read from your screenshots. Click a row to see the screenshot and where each value came from.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full sm:w-auto flex items-center justify-start sm:justify-end gap-2 sm:gap-2.5 flex-wrap sm:shrink-0 sm:ml-auto">
          {/* Filters Button */}
          <button
            type="button"
            onClick={() => setFilterModalOpen(true)}
            className={`border rounded-[6px] px-2.5 sm:px-3.5 py-1.5 text-[0.78rem] sm:text-[0.85rem] font-semibold inline-flex items-center gap-1.5 sm:gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeAdvancedFilterCount > 0
                ? "border-[#9C6B12] bg-[#FAF4E8] text-[#9C6B12]"
                : "border-[#DCE1E8] bg-white hover:border-[#5A6777] text-[#15202C]"
            }`}
          >
            <FiSliders className="w-3.5 h-3.5 shrink-0" />
            <span>Filters</span>
            {activeAdvancedFilterCount > 0 && (
              <span className="bg-[#9C6B12] text-white text-[0.68rem] font-bold rounded-[4px] px-1.5 py-0.2 leading-tight font-['IBM_Plex_Mono',monospace]">
                {activeAdvancedFilterCount}
              </span>
            )}
          </button>

          {/* Copy for Excel */}
          <button
            type="button"
            onClick={handleCopyForExcel}
            className="border border-[#DCE1E8] bg-white hover:border-[#5A6777] text-[#15202C] rounded-[6px] px-2.5 sm:px-3.5 py-1.5 text-[0.78rem] sm:text-[0.85rem] font-semibold inline-flex items-center gap-1.5 sm:gap-2 transition-colors cursor-pointer whitespace-nowrap"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5 stroke-current fill-none stroke-[2]"
            >
              <rect x="8" y="8" width="12" height="12" rx="1" />
              <path d="M16 8V4H4v12h4" />
            </svg>
            <span>Copy for Excel</span>
          </button>

          {/* CSV */}
          {/* <button
            type="button"
            disabled={exportingCsv}
            onClick={handleDownloadCsv}
            className="border border-[#DCE1E8] bg-white hover:border-[#5A6777] text-[#15202C] rounded-[6px] px-2.5 sm:px-3.5 py-1.5 text-[0.78rem] sm:text-[0.85rem] font-semibold inline-flex items-center gap-1.5 sm:gap-2 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5 stroke-current fill-none stroke-[2]"
            >
              <path d="M12 4v12M7 11l5 5 5-5M4 20h16" />
            </svg>
            <span>{exportingCsv ? "Exporting..." : "CSV"}</span>
          </button> */}

          {/* Download Excel */}
          <button
            type="button"
            disabled={exportingExcel}
            onClick={handleDownloadExcel}
            className="border border-[#9C6B12] bg-[#9C6B12] hover:brightness-105 text-white rounded-[6px] px-2.5 sm:px-3.5 py-1.5 text-[0.78rem] sm:text-[0.85rem] font-semibold inline-flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50 whitespace-nowrap"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5 stroke-current fill-none stroke-[2]"
            >
              <path d="M12 4v12M7 11l5 5 5-5M4 20h16" />
            </svg>
            <span>{exportingExcel ? "Exporting..." : "Download Excel"}</span>
          </button>
        </div>
      </div>

      {/* Graceful Error Banner if job fetch failed */}
      {error && !loading && (
        <ErrorFallback
          compact
          title="Could not sync job sheet"
          message={error}
          onRetry={() => dispatch(fetchJobs(jobsQueryParams))}
          retrying={loading}
        />
      )}

      {/* Main Table Panel */}
      <div className="w-full min-w-0 bg-white border border-[#DCE1E8] rounded-[8px] overflow-hidden shadow-[0_1px_2px_rgba(21,32,44,0.06)]">
        {/* Toolbar */}
        <JobSheetToolbar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          selectedVault={selectedVault}
          onVaultChange={handleVaultChange}
          selectedSource={selectedSource}
          onSourceChange={handleSourceChange}
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusChange}
          totalJobsCount={paginationView.total}
          canScrollLeft={tableScrollState.canScrollLeft}
          canScrollRight={tableScrollState.canScrollRight}
          onScrollLeft={() => handleScrollTable("left")}
          onScrollRight={() => handleScrollTable("right")}
        />

        {/* Table */}
        <JobSheetTable
          jobs={paginatedJobs}
          loading={loading && !loaded}
          refreshing={loading && loaded}
          onRowClick={(job) => setSelectedJob(job)}
          onRefresh={handleEmptyStateRefresh}
          scrollContainerRef={tableScrollRef}
          onScrollStateChange={setTableScrollState}
        />

        {/* Pagination Controls */}
        <JobSheetPagination
          totalItems={paginationView.total}
          currentPage={paginationView.page}
          pageSize={pageSize}
          totalPages={paginationView.totalPages}
          hasNext={paginationView.hasNext}
          hasPrev={paginationView.hasPrev}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          itemLabel="jobs"
          loading={loading}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Detail Drawer with smooth transitions */}
      <JobDetailDrawer
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onZoomImage={(img) => setZoomImage(img)}
        onStatusChange={handleJobStatusChange}
        onJobUpdate={handleJobUpdate}
        onOpenJobId={(jobId) => {
          const found = jobs.find((j) => j.id === jobId);
          if (found) setSelectedJob(found);
        }}
      />

      {/* Advanced Multi-Criteria Filter Modal */}
      <JobFilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        jobs={jobs}
        vaultOptions={vaultFilterOptions}
        searchQuery={searchQuery}
        selectedVault={selectedVault}
        selectedSource={selectedSource}
        selectedStatus={selectedStatus}
        advancedFilters={advancedFilters}
        onApply={handleApplyModalFilters}
        onResetAll={handleResetAllFilters}
      />

      {/* Lightbox for Zooming Screenshot */}
      <ScreenshotLightbox
        imageSrc={zoomImage}
        onClose={() => setZoomImage(null)}
      />
    </div>
  );
}

