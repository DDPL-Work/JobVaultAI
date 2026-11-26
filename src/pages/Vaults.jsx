import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FiPlus } from "react-icons/fi";
import VaultCard from "../components/vaults/VaultCard";
import VaultModal from "../components/vaults/VaultModal";
import JobDetailDrawer from "../components/jobs/JobDetailDrawer";
import ScreenshotLightbox from "../components/screenshots/ScreenshotLightbox";
import ErrorFallback from "../components/common/ErrorFallback";
import { VaultsGridSkeleton } from "../components/common/LoadingSkeletons";
import { getJobVaults } from "../components/jobs/jobsData";
import {
  fetchVaults,
  createVault,
  updateVault,
  deleteVault,
} from "../apis/thunks/vaultsThunks";
import {
  fetchJobs,
  updateJob,
  approveJob,
  rejectJob,
  restoreJob,
} from "../apis/thunks/jobsThunks";
import { fetchDashboardStats } from "../apis/thunks/dashboardThunks";
import { localUpdateJobStatus } from "../apis/slices/jobsSlice";

export default function Vaults() {
  const dispatch = useDispatch();
  const {
    vaults,
    loading: loadingVaults,
    loaded: vaultsLoaded,
    error: vaultsError,
  } = useSelector((state) => state.vaults);
  const { items: jobs } = useSelector((state) => state.jobs);

  const [selectedJob, setSelectedJob] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);

  // Modal state for Add / Edit Vault
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVault, setEditingVault] = useState(null);
  const [savingVault, setSavingVault] = useState(false);

  useEffect(() => {
    dispatch(fetchVaults());
    dispatch(fetchJobs());
  }, [dispatch]);

  // Filter synced jobs per vault (Supports Cross-Vault Dual-Routing)
  const getJobsForVault = (vaultName) => {
    return jobs.filter(
      (job) => getJobVaults(job).includes(vaultName) && job.status === "synced"
    );
  };

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
      dispatch(fetchVaults());
      dispatch(fetchJobs());
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
      dispatch(fetchJobs());
      return nextJob;
    } catch (err) {
      toast.error(
        (typeof err === "string" ? err : err?.message) ||
          "Failed to update job"
      );
      throw err;
    }
  };

  const handleOpenAddVault = () => {
    setEditingVault(null);
    setModalOpen(true);
  };

  const handleOpenEditVault = (vault) => {
    setEditingVault(vault);
    setModalOpen(true);
  };

  const handleSaveVault = async (savedVault) => {
    setSavingVault(true);
    try {
      if (editingVault) {
        await dispatch(
          updateVault({
            originalName: savedVault.originalName || editingVault.name,
            name: savedVault.name,
            updates: savedVault,
          })
        ).unwrap();
        toast.success(`Vault "${savedVault.name}" updated successfully`);
      } else {
        await dispatch(createVault(savedVault)).unwrap();
        toast.success(`Vault "${savedVault.name}" created successfully`);
      }
      setModalOpen(false);
      setEditingVault(null);
      dispatch(fetchVaults());
      dispatch(fetchJobs());
    } catch (err) {
      toast.error(
        (typeof err === "string" ? err : err?.message) ||
          "Failed to save vault changes"
      );
    } finally {
      setSavingVault(false);
    }
  };

  const handleDeleteVault = async (targetVault) => {
    const vaultName =
      typeof targetVault === "string" ? targetVault : targetVault?.name;
    if (!vaultName) return;

    setSavingVault(true);
    try {
      await dispatch(deleteVault(vaultName)).unwrap();
      toast.info(`Vault "${vaultName}" deleted`);
      setModalOpen(false);
      setEditingVault(null);
      dispatch(fetchVaults());
      dispatch(fetchJobs());
    } catch (err) {
      toast.error(
        (typeof err === "string" ? err : err?.message) ||
          "Failed to delete vault"
      );
    } finally {
      setSavingVault(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Page Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[260px]">
          <span className="text-[0.72rem] font-semibold text-[#5A6777] uppercase tracking-[0.08em] mb-1 block">
            ADMIN
          </span>
          <h1 className="font-['Bricolage_Grotesque',sans-serif] text-[1.65rem] font-bold text-[#15202C] tracking-[-0.01em] leading-tight m-0">
            Vaults
          </h1>
          <p className="mt-1 text-[#5A6777] max-w-[65ch] text-[0.875rem] leading-normal m-0">
            Each vault is an access tier tab in the Excel file and in Google Sheets. Manage custom vaults, experience bounds, and active routing status.
          </p>
        </div>

        {/* Action Buttons: Dedicated + Add Vault & Edit vault rules */}
        <div className="flex items-center justify-end gap-2.5 flex-wrap shrink-0 ml-auto">
          <button
            type="button"
            onClick={handleOpenAddVault}
            className="border border-[#9C6B12] bg-[#9C6B12] hover:bg-[#83590E] text-white rounded-[6px] px-3.5 py-1.5 text-[0.85rem] font-semibold inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer select-none"
          >
            <FiPlus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Vault</span>
          </button>

          <Link
            to="/rules"
            className="border border-[#DCE1E8] bg-white hover:border-[#5A6777] text-[#15202C] rounded-[6px] px-3.5 py-1.5 text-[0.85rem] font-semibold inline-flex items-center transition-colors shadow-sm select-none"
          >
            Edit vault rules
          </Link>
        </div>
      </div>

      {/* Graceful Error Banner if vault sync failed */}
      {vaultsError && !loadingVaults && (
        <ErrorFallback
          compact
          title="Could not refresh vaults"
          message={vaultsError}
          onRetry={() => {
            dispatch(fetchVaults());
            dispatch(fetchJobs());
          }}
          retrying={loadingVaults}
        />
      )}

      {/* 3-Column Vault Grid */}
      {loadingVaults && !vaultsLoaded ? (
        <VaultsGridSkeleton cards={6} />
      ) : (
        <div className="grid grid-cols-3 max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1 gap-2">
          {vaults.map((vault) => {
            const vaultJobs = getJobsForVault(vault.name);
            return (
              <VaultCard
                key={vault.id || vault.name}
                vault={vault}
                name={vault.name}
                desc={vault.desc}
                min_exp={vault.min_exp}
                max_exp={vault.max_exp}
                is_active={vault.is_active}
                jobs={vaultJobs}
                onJobClick={(job) => setSelectedJob(job)}
                onEdit={(v) => handleOpenEditVault(v)}
              />
            );
          })}
        </div>
      )}

      {/* Dynamic Add / Edit Vault Modal */}
      <VaultModal
        isOpen={modalOpen}
        vault={editingVault}
        saving={savingVault}
        onClose={() => {
          if (savingVault) return;
          setModalOpen(false);
          setEditingVault(null);
        }}
        onSave={handleSaveVault}
        onDelete={handleDeleteVault}
      />

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

      {/* Lightbox for zooming screenshot */}
      <ScreenshotLightbox
        imageSrc={zoomImage}
        onClose={() => setZoomImage(null)}
      />
    </div>
  );
}
