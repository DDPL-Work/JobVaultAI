import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import ScreenshotUploadZone from "../components/screenshots/ScreenshotUploadZone";
import ScreenshotList from "../components/screenshots/ScreenshotList";
import ScreenshotLightbox from "../components/screenshots/ScreenshotLightbox";
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
  updateJob,
  approveJob,
  rejectJob,
  restoreJob,
} from "../apis/thunks/jobsThunks";
import { fetchDashboardStats } from "../apis/thunks/dashboardThunks";
import { localUpdateJobStatus } from "../apis/slices/jobsSlice";

export default function Screenshots() {
  const dispatch = useDispatch();
  const {
    items: screenshots,
    queue,
    loading,
    error,
  } = useSelector((state) => state.screenshots);
  const { items: jobs } = useSelector((state) => state.jobs);

  const [selectedJob, setSelectedJob] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);

  // Load live screenshots and jobs on mount
  useEffect(() => {
    dispatch(fetchScreenshots());
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
      dispatch(fetchScreenshots());
    }, 3000);
    return () => clearInterval(timer);
  }, [runningCount, dispatch]);

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

      if (isCombine && uploadFiles.length > 1) {
        toast.info(
          `Combining ${uploadFiles.length} parts into 1 single job · reading queued`
        );
      } else if (hasPdf) {
        toast.info(
          `${uploadFiles.length} file${uploadFiles.length > 1 ? "s" : ""} uploading · PDF auto page-splitting active`
        );
      } else {
        toast.info(
          `${uploadFiles.length} screenshot${uploadFiles.length > 1 ? "s" : ""} uploading · reading queued`
        );
      }

      setUploadProgress(25);

      try {
        setUploadProgress(65);
        await dispatch(
          uploadScreenshots({ files: uploadFiles, combine: isCombine })
        ).unwrap();
        setUploadProgress(100);
        await dispatch(fetchScreenshots());
        dispatch(fetchJobs());
        toast.success(
          `${uploadFiles.length} file${uploadFiles.length > 1 ? "s" : ""} uploaded to queue`
        );
      } catch (err) {
        const msg =
          (typeof err === "string" ? err : err?.message) ||
          "Failed to upload screenshots";
        toast.error(msg);
      } finally {
        setTimeout(() => setUploadProgress(null), 400);
      }
    },
    [dispatch]
  );

  // Delete screenshot via live API
  const handleDeleteScreenshot = async (id) => {
    try {
      await dispatch(deleteScreenshot(id)).unwrap();
      toast.success("Screenshot removed");
    } catch (err) {
      const msg =
        (typeof err === "string" ? err : err?.message) ||
        "Failed to remove screenshot";
      toast.error(msg);
    }
  };

  // Retry failed screenshot via live API
  const handleRetryScreenshot = async (id) => {
    try {
      await dispatch(retryScreenshot(id)).unwrap();
      toast.info("Screenshot re-queued for AI reading");
      dispatch(fetchScreenshots());
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
      dispatch(fetchScreenshots());
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

      {/* Upload Dropzone */}
      <ScreenshotUploadZone
        onFilesSelected={handleFilesSelected}
        uploadingProgress={uploadProgress}
      />

      {/* Graceful Error Banner if background refresh fails while cached items exist */}
      {error && screenshots.length > 0 && (
        <ErrorFallback
          compact
          title="Live sync interrupted"
          message={error}
          onRetry={() => dispatch(fetchScreenshots())}
          retrying={loading}
        />
      )}

      {/* Recent Screenshots List */}
      <ScreenshotList
        items={screenshots}
        loading={loading}
        error={error}
        queueInfo={queueInfo}
        onZoom={(img) => setZoomImage(img)}
        onDelete={handleDeleteScreenshot}
        onRetry={handleRetryScreenshot}
        onRefresh={() => dispatch(fetchScreenshots())}
        onOpenJob={handleOpenJob}
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
