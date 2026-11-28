import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import ScreenshotUploadZone from "../components/screenshots/ScreenshotUploadZone";
import ScreenshotList from "../components/screenshots/ScreenshotList";
import ScreenshotLightbox from "../components/screenshots/ScreenshotLightbox";
import UploadProgressPopup from "../components/screenshots/UploadProgressPopup";
import DeleteScreenshotModal from "../components/screenshots/DeleteScreenshotModal";
import JobDetailDrawer from "../components/jobs/JobDetailDrawer";
import ErrorFallback from "../components/common/ErrorFallback";
import {
  fetchScreenshots,
  uploadScreenshots,
  deleteScreenshot,
  retryScreenshot,
  fetchScreenshotJobDetail,
} from "../apis/thunks/screenshotsThunks";
import { updateScreenshotJobStatus } from "../apis/slices/screenshotsSlice";
import {
  fetchJobs,
  fetchReviewJobs,
  updateJob,
  approveJob,
  rejectJob,
  restoreJob,
} from "../apis/thunks/jobsThunks";
import { fetchDashboardStats } from "../apis/thunks/dashboardThunks";
import { localUpdateJobStatus } from "../apis/slices/jobsSlice";
import {
  DEFAULT_PAGE_SIZE,
  getEffectivePaginationView,
  getRequestServerPage,
} from "../utils/pagination";

export default function Screenshots() {
  const dispatch = useDispatch();
  const {
    items: screenshots,
    queue,
    pagination,
    loading,
    error,
  } = useSelector((state) => state.screenshots);
  const { items: jobs } = useSelector((state) => state.jobs);

  const [selectedJob, setSelectedJob] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [uploadState, setUploadState] = useState(null);
  const [completionState, setCompletionState] = useState(null);
  const progressTimerRef = useRef(null);
  const dismissTimerRef = useRef(null);
  const completionTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
    };
  }, []);

  const serverPage = getRequestServerPage(currentPage, pageSize, pagination);
  const paginationView = getEffectivePaginationView(
    screenshots,
    pagination,
    currentPage,
    pageSize
  );

  // Load live screenshots for current page + jobs on mount
  useEffect(() => {
    dispatch(fetchScreenshots({ page: serverPage, page_size: pageSize }));
  }, [dispatch, serverPage, pageSize]);

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  // Active processing count (from backend queue or active screenshot stages)
  const activeStageCount = screenshots.filter(
    (s) => s.stage !== "saved" && s.stage !== "failed"
  ).length;
  const runningCount = Math.max(
    Number(queue?.running || 0) + Number(queue?.queued || 0),
    activeStageCount
  );

  const queueInfo =
    runningCount > 0
      ? `${runningCount} reading now · waiting`
      : "Queue is empty";

  // Poll live status every 3s only while screenshots are actively being processed
  useEffect(() => {
    if (runningCount === 0) return;
    const timer = setInterval(() => {
      dispatch(fetchScreenshots({ page: serverPage, page_size: pageSize }));
      dispatch(fetchDashboardStats());
      dispatch(fetchJobs());
    }, 3000);
    return () => clearInterval(timer);
  }, [runningCount, serverPage, pageSize, dispatch]);

  // Upload files (images / multi-page PDFs / multi-part combine) directly to live API
  const handleFilesSelected = useCallback(
    async (files, isCombine = false) => {
      if (!files || files.length === 0) return;

      let uploadFiles = Array.from(files);
      if (isCombine && uploadFiles.length > 4) {
        toast.warning(
          "Combining first 4 parts into 1 job (maximum 4 screenshot parts supported)"
        );
        uploadFiles = uploadFiles.slice(0, 4);
      }

      const hasPdf = uploadFiles.some(
        (f) =>
          f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
      );
      const firstName = uploadFiles[0]?.name || "";
      const fileLabel =
        uploadFiles.length > 1
          ? `${firstName} +${uploadFiles.length - 1} more`
          : firstName;

      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
      setCompletionState(null);

      setUploadState({
        visible: true,
        closing: false,
        progress: 6,
        fileCount: uploadFiles.length,
        fileName: fileLabel,
        isCombine: isCombine && uploadFiles.length > 1,
        hasPdf,
        status: "uploading",
      });

      progressTimerRef.current = setInterval(() => {
        setUploadState((prev) => {
          if (!prev || prev.status !== "uploading") return prev;
          const remaining = 94 - prev.progress;
          if (remaining <= 0.5) return prev;
          const step = Math.max(0.8, remaining * 0.14);
          return {
            ...prev,
            progress: Math.min(94, prev.progress + step),
          };
        });
      }, 95);

      try {
        await dispatch(
          uploadScreenshots({ files: uploadFiles, combine: isCombine })
        ).unwrap();
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        setUploadState((prev) =>
          prev ? { ...prev, progress: 100, status: "done" } : null
        );
        setCurrentPage(1);
        await dispatch(fetchScreenshots({ page: 1, page_size: pageSize }));
        dispatch(fetchJobs());
        dispatch(fetchReviewJobs());
        dispatch(fetchDashboardStats());

        dismissTimerRef.current = setTimeout(() => {
          setUploadState((prev) => (prev ? { ...prev, closing: true } : null));
          setTimeout(() => setUploadState(null), 280);
        }, 650);

        setCompletionState({
          visible: true,
          closing: false,
          fileCount: uploadFiles.length,
        });
        completionTimerRef.current = setTimeout(() => {
          setCompletionState((prev) => (prev ? { ...prev, closing: true } : null));
          setTimeout(() => setCompletionState(null), 280);
        }, 5500);
      } catch (err) {
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        setUploadState(null);
        const msg =
          (typeof err === "string" ? err : err?.message) ||
          "Failed to upload screenshots";
        toast.error(msg);
      }
    },
    [dispatch, pageSize]
  );

  // Open confirmation modal before deleting a screenshot
  const handleRequestDelete = (id) => {
    const target = screenshots.find((s) => s.id === id);
    setDeleteTarget(target || { id });
  };

  // Delete screenshot via live API after confirmation
  const handleConfirmDelete = async (id) => {
    if (!id || isDeleting) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteScreenshot(id)).unwrap();
      setDeleteTarget(null);
      toast.success("Screenshot removed");
      if (paginationView.visibleItems.length <= 1 && currentPage > 1) {
        setCurrentPage((prev) => Math.max(1, prev - 1));
      } else {
        dispatch(fetchScreenshots({ page: serverPage, page_size: pageSize }));
      }
      dispatch(fetchDashboardStats());
      dispatch(fetchJobs());
      dispatch(fetchReviewJobs());
    } catch (err) {
      const msg =
        (typeof err === "string" ? err : err?.message) ||
        "Failed to remove screenshot";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Retry failed screenshot via live API
  const handleRetryScreenshot = async (id) => {
    try {
      await dispatch(retryScreenshot(id)).unwrap();
      toast.info("Screenshot re-queued for AI reading");
      dispatch(fetchScreenshots({ page: serverPage, page_size: pageSize }));
    } catch (err) {
      const msg =
        (typeof err === "string" ? err : err?.message) ||
        "Failed to retry screenshot";
      toast.error(msg);
    }
  };

  // Open job detail drawer by fetching from live backend API (or Redux cache)
  const handleOpenJob = async (jobId) => {
    const cached = jobs.find((j) => j.id === jobId);
    if (cached) {
      setSelectedJob(cached);
    }
    try {
      const liveJob = await dispatch(fetchScreenshotJobDetail(jobId)).unwrap();
      if (liveJob?.id) {
        setSelectedJob(liveJob);
      }
    } catch (err) {
      if (!cached) {
        toast.error(
          (typeof err === "string" ? err : err?.message) ||
            "Could not load job details"
        );
      }
    }
  };

  const handleJobStatusChange = async (jobId, newStatus) => {
    dispatch(localUpdateJobStatus({ jobId, newStatus }));
    dispatch(updateScreenshotJobStatus({ jobId, newStatus }));
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
    } catch (err) {
      toast.error(
        (typeof err === "string" ? err : err?.message) ||
          "Failed to update job status"
      );
      dispatch(fetchScreenshots({ page: serverPage, page_size: pageSize }));
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
      <div className="min-w-0">
        <h1 className="font-['Bricolage_Grotesque',sans-serif] text-[1.45rem] sm:text-[1.65rem] font-bold text-[#15202C] tracking-[-0.01em] leading-tight m-0">
          Screenshots
        </h1>
        <p className="mt-1 text-[#5A6777] max-w-[70ch] text-[0.84rem] sm:text-[0.875rem] leading-normal m-0">
          Add as many screenshots as you like. Each one is read on its own, so there is no 10–20 image limit and no need to make PDFs.
        </p>
      </div>

      {/* Top-Right Upload Progress Popup + Bottom-Right Completion Popup */}
      <UploadProgressPopup
        uploadState={uploadState}
        completionState={completionState}
        onDismissUpload={() => setUploadState(null)}
        onDismissCompletion={() => setCompletionState(null)}
        onViewUploaded={() => {
          setCompletionState(null);
          document
            .getElementById("recent-screenshots-list")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      />

      {/* Upload Dropzone */}
      <ScreenshotUploadZone onFilesSelected={handleFilesSelected} />

      {/* Graceful Error Banner if background refresh fails while cached items exist */}
      {error && screenshots.length > 0 && (
        <ErrorFallback
          compact
          title="Live sync interrupted"
          message={error}
          onRetry={() =>
            dispatch(fetchScreenshots({ page: serverPage, page_size: pageSize }))
          }
          retrying={loading}
        />
      )}

      {/* Recent Screenshots List */}
      <ScreenshotList
        items={paginationView.visibleItems}
        loading={loading}
        error={error}
        queueInfo={queueInfo}
        pagination={paginationView}
        currentPage={paginationView.page}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        onZoom={(img) => setZoomImage(img)}
        onDelete={handleRequestDelete}
        onRetry={handleRetryScreenshot}
        onRefresh={() =>
          dispatch(fetchScreenshots({ page: serverPage, page_size: pageSize }))
        }
        onOpenJob={handleOpenJob}
      />

      {/* Delete Confirmation Modal */}
      <DeleteScreenshotModal
        screenshot={deleteTarget}
        deleting={isDeleting}
        onClose={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      {/* Slide-over Job Detail Drawer with smooth transitions */}
      <JobDetailDrawer
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onZoomImage={(img) => setZoomImage(img)}
        onStatusChange={handleJobStatusChange}
        onJobUpdate={handleJobUpdate}
        onOpenJobId={handleOpenJob}
      />

      {/* Lightbox Modal */}
      <ScreenshotLightbox
        imageSrc={zoomImage}
        onClose={() => setZoomImage(null)}
      />
    </div>
  );
}
