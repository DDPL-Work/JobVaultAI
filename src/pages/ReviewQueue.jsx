import { useState } from "react";
import ReviewCard from "../components/review/ReviewCard";
import ScreenshotLightbox from "../components/screenshots/ScreenshotLightbox";
import { INITIAL_REVIEW_JOBS } from "../components/review/reviewData";

export default function ReviewQueue() {
  const [reviewJobs, setReviewJobs] = useState(INITIAL_REVIEW_JOBS);
  const [zoomImage, setZoomImage] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleApprove = (updatedJob) => {
    setReviewJobs((prev) => prev.filter((j) => j.id !== updatedJob.id));
    showToast(`Approved & added to sheet (${updatedJob.code})`);
  };

  const handleReject = (jobId) => {
    setReviewJobs((prev) => prev.filter((j) => j.id !== jobId));
    showToast("Job rejected");
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
      <div>
        <h1 className="font-['Bricolage_Grotesque',sans-serif] text-[1.65rem] font-bold text-[#15202C] tracking-[-0.01em] leading-tight m-0">
          Review queue
        </h1>
        <p className="mt-1 text-[#5A6777] max-w-[70ch] text-[0.875rem] leading-normal m-0">
          The AI could not read these clearly, so it left the unclear fields empty instead of guessing. Check the highlighted fields against the screenshot, then approve. Jobs at 80% confidence or higher skip this step.
        </p>
      </div>

      {/* Main Review Cards Container */}
      <div className="bg-white border border-[#DCE1E8] rounded-[8px] overflow-hidden shadow-[0_1px_2px_rgba(21,32,44,0.06)]">
        {reviewJobs.length > 0 ? (
          reviewJobs.map((job) => (
            <ReviewCard
              key={job.id}
              job={job}
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

