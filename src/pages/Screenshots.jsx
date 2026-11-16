
import { useState } from "react";
import ScreenshotUploadZone from "../components/screenshots/ScreenshotUploadZone";
import ScreenshotList from "../components/screenshots/ScreenshotList";
import ScreenshotLightbox from "../components/screenshots/ScreenshotLightbox";
import JobDetailDrawer from "../components/jobs/JobDetailDrawer";
import { INITIAL_JOBS } from "../components/jobs/jobsData";
import {
  INITIAL_SCREENSHOTS,
  shotSvg,
  DEMO_ITEMS,
} from "../components/screenshots/screenshotData";

export default function Screenshots() {
  const [screenshots, setScreenshots] = useState(INITIAL_SCREENSHOTS);
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [selectedJob, setSelectedJob] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [nextId, setNextId] = useState(1055);

  // Compute active queue count
  const runningCount = screenshots.filter(
    (s) => s.stage !== "saved" && s.stage !== "failed"
  ).length;

  const queueInfo =
    runningCount > 0
      ? `${runningCount} reading now · waiting`
      : "Queue is empty";

  // Handle uploaded or dropped files
  const handleFilesSelected = (files) => {
    if (!files || files.length === 0) return;

    setUploadProgress(15);

    const now = new Date();
    const dateFormatted = now.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

    files.forEach((file, index) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const imageSrc = e.target.result;
        const currentJobId = nextId + index;
        const sampleDemo = DEMO_ITEMS[index % DEMO_ITEMS.length];

        const newScreenshot = {
          id: Date.now() + index,
          filename: file.name,
          originalName: file.name,
          dateFormatted,
          origin: "Uploaded",
          sourceApp: sampleDemo.app || "WhatsApp",
          stage: "received",
          stageText: "Waiting in queue",
          image: imageSrc || shotSvg(sampleDemo.app, sampleDemo.text),
          jobs: [
            {
              id: currentJobId,
              code: `JV-${currentJobId}`,
              status: sampleDemo.status || "synced",
              statusLabel:
                sampleDemo.status === "review"
                  ? "Needs review"
                  : sampleDemo.status === "duplicate"
                  ? "Duplicate"
                  : "In sheet",
            },
          ],
        };

        // Add to top of list
        setScreenshots((prev) => [newScreenshot, ...prev]);

        // Simulate AI Pipeline stages
        setTimeout(() => {
          setUploadProgress(45);
          updateScreenshotStage(newScreenshot.id, "reading", "AI is reading the image");
        }, 600);

        setTimeout(() => {
          setUploadProgress(75);
          updateScreenshotStage(
            newScreenshot.id,
            "verifying",
            "Checking every value against the text"
          );
        }, 1300);

        setTimeout(() => {
          setUploadProgress(95);
          updateScreenshotStage(
            newScreenshot.id,
            "sorting",
            "Skipping duplicates, sorting to vault"
          );
        }, 2000);

        setTimeout(() => {
          setUploadProgress(null);
          updateScreenshotStage(newScreenshot.id, "saved", "Done");
        }, 2700);
      };

      if (file.type.startsWith("image/")) {
        reader.readAsDataURL(file);
      } else {
        // Fallback for non-standard image formats
        const sampleDemo = DEMO_ITEMS[index % DEMO_ITEMS.length];
        const currentJobId = nextId + index;
        const newScreenshot = {
          id: Date.now() + index,
          filename: file.name,
          originalName: file.name,
          dateFormatted,
          origin: "Uploaded",
          sourceApp: sampleDemo.app || "WhatsApp",
          stage: "saved",
          stageText: "Done",
          image: shotSvg(sampleDemo.app, sampleDemo.text),
          jobs: [
            {
              id: currentJobId,
              code: `JV-${currentJobId}`,
              status: sampleDemo.status || "synced",
              statusLabel:
                sampleDemo.status === "review"
                  ? "Needs review"
                  : "In sheet",
            },
          ],
        };
        setScreenshots((prev) => [newScreenshot, ...prev]);
        setUploadProgress(null);
      }
    });

    setNextId((prev) => prev + files.length);
  };

  const updateScreenshotStage = (id, stage, stageText) => {
    setScreenshots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, stage, stageText } : s))
    );
  };

  // Delete screenshot item
  const handleDeleteScreenshot = (id) => {
    setScreenshots((prev) => prev.filter((s) => s.id !== id));
  };

  const handleJobStatusChange = (jobId, newStatus) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
    );
    setSelectedJob((prev) =>
      prev && prev.id === jobId ? { ...prev, status: newStatus } : prev
    );
    setScreenshots((prev) =>
      prev.map((s) => ({
        ...s,
        jobs: s.jobs?.map((j) =>
          j.id === jobId ? { ...j, status: newStatus } : j
        ),
      }))
    );
  };

  const handleJobUpdate = (updatedJob) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === updatedJob.id ? updatedJob : j))
    );
    setSelectedJob(updatedJob);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Page Header */}
      <div>
        <h1 className="font-['Bricolage_Grotesque',sans-serif] text-[1.65rem] font-bold text-[#15202C] tracking-[-0.01em] leading-tight m-0">
          Screenshots
        </h1>
        <p className="mt-1 text-[#5A6777] max-w-[70ch] text-[0.875rem] leading-normal m-0">
          Add as many screenshots as you like. Each one is read on its own, so there is no 10–20 image limit and no need to make PDFs.
        </p>
      </div>

      {/* Upload Dropzone */}
      <ScreenshotUploadZone
        onFilesSelected={handleFilesSelected}
        uploadingProgress={uploadProgress}
      />

      {/* Recent Screenshots List */}
      <ScreenshotList
        items={screenshots}
        queueInfo={queueInfo}
        onZoom={(img) => setZoomImage(img)}
        onDelete={handleDeleteScreenshot}
        onOpenJob={(jobId) => {
          const found =
            jobs.find((j) => j.id === jobId) ||
            INITIAL_JOBS.find((j) => j.id === jobId);
          if (found) setSelectedJob(found);
        }}
      />

      {/* Slide-over Job Detail Drawer with smooth transitions */}
      <JobDetailDrawer
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onZoomImage={(img) => setZoomImage(img)}
        onStatusChange={handleJobStatusChange}
        onJobUpdate={handleJobUpdate}
        onOpenJobId={(jobId) => {
          const found =
            jobs.find((j) => j.id === jobId) ||
            INITIAL_JOBS.find((j) => j.id === jobId);
          if (found) setSelectedJob(found);
        }}
      />

      {/* Lightbox Modal */}
      <ScreenshotLightbox
        imageSrc={zoomImage}
        onClose={() => setZoomImage(null)}
      />
    </div>
  );
}

