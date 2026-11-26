import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import JobSheetToolbar from "../components/jobs/JobSheetToolbar";
import JobSheetTable from "../components/jobs/JobSheetTable";
import JobSheetPagination from "../components/jobs/JobSheetPagination";
import JobDetailDrawer from "../components/jobs/JobDetailDrawer";
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

export default function JobSheet() {
  const dispatch = useDispatch();
  const { items: jobs, loading, loaded, error } = useSelector(
    (state) => state.jobs
  );
  const { vaults: dynamicVaults } = useSelector((state) => state.vaults);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVault, setSelectedVault] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedJob, setSelectedJob] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  useEffect(() => {
    dispatch(fetchJobs());
    dispatch(fetchVaults());
  }, [dispatch]);

  // Filter jobs based on search, vault, source, status
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
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

      return true;
    });
  }, [jobs, searchQuery, selectedVault, selectedSource, selectedStatus]);

  // Paginated slice of filtered jobs
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredJobs.slice(start, start + pageSize);
  }, [filteredJobs, currentPage, pageSize]);

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
      dispatch(fetchJobs());
      dispatch(fetchVaults());
    } catch (err) {
      toast.error(
        (typeof err === "string" ? err : err?.message) ||
          "Failed to update job status"
      );
      dispatch(fetchJobs());
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
    <div className="flex flex-col gap-5">
      {/* Page Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[260px]">
          <h1 className="font-['Bricolage_Grotesque',sans-serif] text-[1.65rem] font-bold text-[#15202C] tracking-[-0.01em] leading-tight m-0">
            Job sheet
          </h1>
          <p className="mt-1 text-[#5A6777] max-w-[65ch] text-[0.875rem] leading-normal m-0">
            Every job that was read from your screenshots. Click a row to see the screenshot and where each value came from.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 flex-wrap shrink-0 ml-auto">
          {/* Copy for Excel */}
          <button
            type="button"
            onClick={handleCopyForExcel}
            className="border border-[#DCE1E8] bg-white hover:border-[#5A6777] text-[#15202C] rounded-[6px] px-3.5 py-1.5 text-[0.85rem] font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
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
          <button
            type="button"
            disabled={exportingCsv}
            onClick={handleDownloadCsv}
            className="border border-[#DCE1E8] bg-white hover:border-[#5A6777] text-[#15202C] rounded-[6px] px-3.5 py-1.5 text-[0.85rem] font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5 stroke-current fill-none stroke-[2]"
            >
              <path d="M12 4v12M7 11l5 5 5-5M4 20h16" />
            </svg>
            <span>{exportingCsv ? "Exporting..." : "CSV"}</span>
          </button>

          {/* Download Excel */}
          <button
            type="button"
            disabled={exportingExcel}
            onClick={handleDownloadExcel}
            className="border border-[#9C6B12] bg-[#9C6B12] hover:brightness-105 text-white rounded-[6px] px-3.5 py-1.5 text-[0.85rem] font-semibold inline-flex items-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
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
          onRetry={() => dispatch(fetchJobs())}
          retrying={loading}
        />
      )}

      {/* Main Table Panel */}
      <div className="bg-white border border-[#DCE1E8] rounded-[8px] overflow-hidden shadow-[0_1px_2px_rgba(21,32,44,0.06)]">
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
          totalJobsCount={filteredJobs.length}
        />

        {/* Table */}
        <JobSheetTable
          jobs={paginatedJobs}
          loading={loading && !loaded}
          onRowClick={(job) => setSelectedJob(job)}
        />

        {/* Pagination Controls */}
        <JobSheetPagination
          totalItems={filteredJobs.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
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

      {/* Lightbox for Zooming Screenshot */}
      <ScreenshotLightbox
        imageSrc={zoomImage}
        onClose={() => setZoomImage(null)}
      />
    </div>
  );
}

