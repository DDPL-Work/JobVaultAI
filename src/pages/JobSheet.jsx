import { useState, useMemo } from "react";
import JobSheetToolbar from "../components/jobs/JobSheetToolbar";
import JobSheetTable from "../components/jobs/JobSheetTable";
import JobSheetPagination from "../components/jobs/JobSheetPagination";
import JobDetailDrawer from "../components/jobs/JobDetailDrawer";
import ScreenshotLightbox from "../components/screenshots/ScreenshotLightbox";
import { INITIAL_JOBS } from "../components/jobs/jobsData";

export default function JobSheet() {
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVault, setSelectedVault] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedJob, setSelectedJob] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Show transient toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

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

      // 2. Vault filter
      if (selectedVault !== "all" && job.vault !== selectedVault) {
        return false;
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
  const handleCopyForExcel = () => {
    const headers = [
      "Job ID",
      "Date",
      "Role",
      "Company",
      "Salary",
      "Location",
      "Experience",
      "Vault",
      "Source",
      "Status",
    ];

    const targetRows = filteredJobs.filter(
      (j) => selectedStatus !== "all" || j.status === "synced"
    );

    const rows = (targetRows.length > 0 ? targetRows : filteredJobs).map((j) => [
      j.code,
      j.created_at?.slice(0, 10) || "",
      j.title || "",
      j.company || "",
      j.salary || "",
      j.location || "",
      j.experience || "",
      j.vault || "",
      j.source_app || "",
      j.status || "",
    ]);

    const tsvContent = [
      headers.join("\t"),
      ...rows.map((r) => r.map((c) => String(c).replace(/[\t\n\r]/g, " ")).join("\t")),
    ].join("\n");

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(tsvContent).then(() => {
        showToast(`${rows.length} rows copied · paste into Excel`);
      });
    } else {
      showToast(`${rows.length} rows prepared`);
    }
  };

  // Download CSV
  const handleDownloadCsv = () => {
    const headers = [
      "Job ID",
      "Role",
      "Company",
      "Location",
      "Experience",
      "Salary",
      "Vault",
      "Source",
      "Status",
    ];

    const rows = filteredJobs.map((j) => [
      `"${j.code}"`,
      `"${(j.title || "").replace(/"/g, '""')}"`,
      `"${(j.company || "").replace(/"/g, '""')}"`,
      `"${(j.location || "").replace(/"/g, '""')}"`,
      `"${(j.experience || "").replace(/"/g, '""')}"`,
      `"${(j.salary || "").replace(/"/g, '""')}"`,
      `"${(j.vault || "").replace(/"/g, '""')}"`,
      `"${(j.source_app || "").replace(/"/g, '""')}"`,
      `"${(j.status || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `jobs_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV file downloaded");
  };

  // Download Excel
  const handleDownloadExcel = () => {
    handleDownloadCsv();
  };

  // Update status from drawer
  const handleJobStatusChange = (jobId, newStatus) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
    );
    setSelectedJob((prev) =>
      prev && prev.id === jobId ? { ...prev, status: newStatus } : prev
    );
    showToast(`Job ${newStatus === "rejected" ? "rejected" : "status updated"}`);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-60 bg-[#15202C] text-white px-4 py-2.5 rounded-[6px] font-semibold text-[0.85rem] shadow-[0_10px_30px_rgba(21,32,44,0.2)] animate-in fade-in slide-in-from-bottom-2 duration-150 select-none">
          {toastMessage}
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-['Bricolage_Grotesque',sans-serif] text-[1.65rem] font-bold text-[#15202C] tracking-[-0.01em] leading-tight m-0">
            Job sheet
          </h1>
          <p className="mt-1 text-[#5A6777] max-w-[70ch] text-[0.875rem] leading-normal m-0">
            Every job that was read from your screenshots. Click a row to see the screenshot and where each value came from.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
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
            onClick={handleDownloadCsv}
            className="border border-[#DCE1E8] bg-white hover:border-[#5A6777] text-[#15202C] rounded-[6px] px-3.5 py-1.5 text-[0.85rem] font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5 stroke-current fill-none stroke-[2]"
            >
              <path d="M12 4v12M7 11l5 5 5-5M4 20h16" />
            </svg>
            <span>CSV</span>
          </button>

          {/* Download Excel */}
          <button
            type="button"
            onClick={handleDownloadExcel}
            className="border border-[#9C6B12] bg-[#9C6B12] hover:brightness-105 text-white rounded-[6px] px-3.5 py-1.5 text-[0.85rem] font-semibold inline-flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5 stroke-current fill-none stroke-[2]"
            >
              <path d="M12 4v12M7 11l5 5 5-5M4 20h16" />
            </svg>
            <span>Download Excel</span>
          </button>
        </div>
      </div>

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
        onJobUpdate={(updatedJob) => {
          setJobs((prev) =>
            prev.map((j) => (j.id === updatedJob.id ? updatedJob : j))
          );
          setSelectedJob(updatedJob);
        }}
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

