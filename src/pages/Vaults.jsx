import { useState } from "react";
import { Link } from "react-router-dom";
import VaultCard from "../components/vaults/VaultCard";
import JobDetailDrawer from "../components/jobs/JobDetailDrawer";
import ScreenshotLightbox from "../components/screenshots/ScreenshotLightbox";
import { VAULT_CONFIGS } from "../components/vaults/vaultsData";
import { INITIAL_JOBS } from "../components/jobs/jobsData";

export default function Vaults() {
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [selectedJob, setSelectedJob] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);

  // Filter synced jobs per vault
  const getJobsForVault = (vaultName) => {
    return jobs.filter(
      (job) => job.vault === vaultName && job.status === "synced"
    );
  };

  const handleJobStatusChange = (jobId, newStatus) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
    );
    setSelectedJob((prev) =>
      prev && prev.id === jobId ? { ...prev, status: newStatus } : prev
    );
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Page Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-['Bricolage_Grotesque',sans-serif] text-[1.65rem] font-bold text-[#15202C] tracking-[-0.01em] leading-tight m-0">
            Vaults
          </h1>
          <p className="mt-1 text-[#5A6777] max-w-[70ch] text-[0.875rem] leading-normal m-0">
            Each vault is a tab in the Excel file and in Google Sheets. Change how jobs are sorted in Vault rules.
          </p>
        </div>

        {/* Action Button */}
        <div>
          <Link
            to="/rules"
            className="border border-[#DCE1E8] bg-white hover:border-[#5A6777] text-[#15202C] rounded-[6px] px-3.5 py-1.5 text-[0.85rem] font-semibold inline-flex items-center transition-colors shadow-sm select-none"
          >
            Edit vault rules
          </Link>
        </div>
      </div>

      {/* 3-Column Vault Grid */}
      <div className="grid grid-cols-3 max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1 gap-4">
        {VAULT_CONFIGS.map((vault) => {
          const vaultJobs = getJobsForVault(vault.name);
          return (
            <VaultCard
              key={vault.name}
              name={vault.name}
              desc={vault.desc}
              jobs={vaultJobs}
              onJobClick={(job) => setSelectedJob(job)}
            />
          );
        })}
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

      {/* Lightbox for zooming screenshot */}
      <ScreenshotLightbox
        imageSrc={zoomImage}
        onClose={() => setZoomImage(null)}
      />
    </div>
  );
}

