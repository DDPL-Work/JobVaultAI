import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import ReviewCard from "../components/review/ReviewCard";
import ScreenshotLightbox from "../components/screenshots/ScreenshotLightbox";
import ErrorFallback from "../components/common/ErrorFallback";
import { ReviewQueueSkeleton } from "../components/common/LoadingSkeletons";
import {
  fetchReviewJobs,
  approveJob,
  rejectJob,
} from "../apis/thunks/jobsThunks";
import { fetchDashboardStats } from "../apis/thunks/dashboardThunks";

export default function ReviewQueue() {
  const dispatch = useDispatch();
  const {
    reviewItems: reviewJobs,
    loadingReview,
    reviewError,
  } = useSelector((state) => state.jobs);

  const [zoomImage, setZoomImage] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);

  useEffect(() => {
    dispatch(fetchReviewJobs());
  }, [dispatch]);

  const handleApprove = async (updatedJob) => {
    setSubmittingId(updatedJob.id);
    try {
      const updates = {
        title: updatedJob.title || "",
        company: updatedJob.company || "",
        location: updatedJob.location || "",
        exp_min:
          updatedJob.exp_min === "" || updatedJob.exp_min === null
            ? null
            : Number(updatedJob.exp_min),
        exp_max:
          updatedJob.exp_max === "" || updatedJob.exp_max === null
            ? null
            : Number(updatedJob.exp_max),
        salary: updatedJob.salary || null,
        work_mode: updatedJob.work_mode || null,
        country: updatedJob.country || "",
        apply_contact: updatedJob.apply_contact || "",
      };
      await dispatch(approveJob({ jobId: updatedJob.id, updates })).unwrap();
      toast.success(`Approved & added to sheet (${updatedJob.code})`);
      dispatch(fetchDashboardStats());
    } catch (err) {
      toast.error(
        (typeof err === "string" ? err : err?.message) ||
          "Failed to approve job"
      );
    } finally {
      setSubmittingId(null);
    }
  };

  const handleReject = async (jobId) => {
    setSubmittingId(jobId);
    try {
      await dispatch(rejectJob(jobId)).unwrap();
      toast.info("Job rejected");
      dispatch(fetchDashboardStats());
    } catch (err) {
      toast.error(
        (typeof err === "string" ? err : err?.message) ||
          "Failed to reject job"
      );
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Page Header */}
      <div>
        <h1 className="font-['Bricolage_Grotesque',sans-serif] text-[1.65rem] font-bold text-[#15202C] tracking-[-0.01em] leading-tight m-0">
          Review queue
        </h1>
        <p className="mt-1 text-[#5A6777] max-w-[70ch] text-[0.875rem] leading-normal m-0">
          The AI could not read these clearly, so it left the unclear fields empty instead of guessing. Check the highlighted fields against the screenshot, then approve. Jobs at 80% confidence or higher skip this step.
        </p>
      </div>

      {/* Graceful Error Banner when cached review items exist */}
      {reviewError && reviewJobs.length > 0 && (
        <ErrorFallback
          compact
          title="Could not refresh review queue"
          message={reviewError}
          onRetry={() => dispatch(fetchReviewJobs())}
          retrying={loadingReview}
        />
      )}

      {/* Main Review Cards Container */}
      <div className="bg-white border border-[#DCE1E8] rounded-[8px] overflow-hidden shadow-[0_1px_2px_rgba(21,32,44,0.06)]">
        {loadingReview && reviewJobs.length === 0 ? (
          <ReviewQueueSkeleton cards={2} />
        ) : reviewError && reviewJobs.length === 0 ? (
          <div className="p-4">
            <ErrorFallback
              title="Could not load review queue"
              message={reviewError}
              onRetry={() => dispatch(fetchReviewJobs())}
              retrying={loadingReview}
            />
          </div>
        ) : reviewJobs.length > 0 ? (
          reviewJobs.map((job) => (
            <ReviewCard
              key={job.id}
              job={job}
              isSubmitting={submittingId === job.id}
              onApprove={handleApprove}
              onReject={handleReject}
              onZoomImage={(img) => setZoomImage(img)}
            />
          ))
        ) : (
          <div className="text-center py-16 px-4 flex flex-col items-center justify-center gap-1.5 text-[#5A6777]">
            <b className="text-[#15202C] text-[1.05rem]">All clear</b>
            <span className="text-[0.84rem]">
              No jobs are waiting for review.
            </span>
          </div>
        )}
      </div>

      {/* Lightbox for zooming screenshot */}
      <ScreenshotLightbox
        imageSrc={zoomImage}
        onClose={() => setZoomImage(null)}
      />
    </div>
  );
}
