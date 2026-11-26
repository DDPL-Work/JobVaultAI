import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { SOURCE_COLORS, VAULTS, getJobVaults } from "./jobsData";
import SafeImage from "../common/SafeImage";
import ConfidenceMeter from "../common/ConfidenceMeter";
import { generateJobContent } from "../../apis/thunks/jobsThunks";

/**
 * Intelligent Social Media Content Generator
 * Generates platform-optimized, high-converting posts for LinkedIn and Instagram
 * matching the specification in README.md (Item 10 & API Reference)
 */
function generateSocialPosts(job) {
  if (!job) return { linkedin: "", instagram: "", hashtags: [] };

  const title = job.title || "Job Opportunity";
  const company =
    job.company && job.company !== "Company unclear"
      ? job.company
      : "Reputed Company";
  const location =
    job.location && job.location !== "Location unclear"
      ? job.location
      : "Pan India";
  const workMode =
    job.work_mode ||
    (location.toLowerCase().includes("remote") ? "Remote" : "Onsite");
  const exp = job.experience || "Freshers / Experienced";
  const salary = job.salary || "Competitive / Best in Industry";
  const qualification = job.qualification || "Any Graduate / Relevant Degree";
  const sector = job.sector || "Recruitment";
  const apply =
    job.apply_contact && job.apply_contact !== "—"
      ? job.apply_contact
      : "Contact HR / Apply directly";
  const details =
    job.other_details && job.other_details !== "—" ? job.other_details : "";

  // Dynamic clean hashtag generator
  const cleanTag = (str) => (str ? str.replace(/[^a-zA-Z0-9]/g, "") : "");
  const roleTag = cleanTag(title);
  const compTag = cleanTag(company);
  const sectorTag = cleanTag(sector);

  const linkedinHashtags = [
    "#Hiring",
    "#JobOpening",
    roleTag ? `#${roleTag}` : "#CareerOpportunity",
    sectorTag ? `#${sectorTag}` : "#Recruitment",
    compTag ? `#${compTag}` : null,
    workMode.toLowerCase().includes("remote") ? "#RemoteJobs" : "#JobSearch",
    "#Careers",
    "#JobVaultAI",
  ].filter(Boolean);

  const instagramHashtags = [
    "#HiringNow",
    "#JobAlert",
    roleTag ? `#${roleTag}` : "#Careers",
    "#NewJob",
    "#WorkFromHome",
    workMode.toLowerCase().includes("remote") ? "#RemoteWork" : "#Opportunity",
    "#CareerGrowth",
    "#JobHunt",
    "#Jobs2026",
    "#JobVaultAI",
  ].filter(Boolean);

  // Professional LinkedIn Format
  const linkedin = `🌟 We are Hiring! | ${title} at ${company} 🚀

Are you ready to take the next step in your career? We have an exciting opening for a talented ${title} to join ${company}!

📌 Key Opportunity Details:
• Role: ${title}
• Company: ${company}
• Domain / Sector: ${sector}
• Location: ${location} (${workMode})
• Experience: ${exp}
• Package / Salary: ${salary}
• Qualification: ${qualification}
${details ? `• Responsibilities & Skills: ${details}\n` : ""}
📩 How to Apply:
Interested candidates are invited to apply directly: ${apply}

Know someone who would be a great fit? Feel free to tag them or share this post! 🤝

${linkedinHashtags.join(" ")}`;

  // Engaging Instagram Format
  const instagram = `💼✨ NEW JOB ALERT: ${title}!
${company} is looking for enthusiastic talent to join the team! 🚀

━━━━━━━━━━━━━━━━━━━━
🏢 Company: ${company}
💼 Role: ${title}
📍 Location: ${location} (${workMode})
⏳ Experience: ${exp}
💰 Salary: ${salary}
🎓 Qualification: ${qualification}
━━━━━━━━━━━━━━━━━━━━

${details ? `📝 Description:\n${details}\n\n` : ""}📩 How to Apply:
👉 Send your resume / Contact: ${apply}

📌 Save this post for later & share with a friend who is job hunting! 👇

${instagramHashtags.join(" ")}`;

  return {
    linkedin,
    instagram,
    hashtags: {
      linkedin: linkedinHashtags,
      instagram: instagramHashtags,
    },
  };
}

function normalizeHashtags(hashtags) {
  const ensureHash = (t) => {
    const clean = String(t || "").trim();
    if (!clean) return "";
    return clean.startsWith("#") ? clean : `#${clean}`;
  };

  if (Array.isArray(hashtags)) {
    const list = hashtags.map(ensureHash).filter(Boolean);
    return { linkedin: list, instagram: list };
  }
  if (hashtags && typeof hashtags === "object") {
    return {
      linkedin: Array.isArray(hashtags.linkedin)
        ? hashtags.linkedin.map(ensureHash).filter(Boolean)
        : [],
      instagram: Array.isArray(hashtags.instagram)
        ? hashtags.instagram.map(ensureHash).filter(Boolean)
        : [],
    };
  }
  return { linkedin: [], instagram: [] };
}

export default function JobDetailDrawer({
  job,
  onClose,
  onZoomImage,
  onStatusChange,
  onOpenJobId,
  onJobUpdate,
}) {
  const dispatch = useDispatch();
  const { vaults: liveVaults } = useSelector((state) => state.vaults || {});

  const [mountedJob, setMountedJob] = useState(job);
  const [isClosing, setIsClosing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formFields, setFormFields] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI Social Media Generator states
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [socialModalClosing, setSocialModalClosing] = useState(false);
  const [hasLoadedLiveSocial, setHasLoadedLiveSocial] = useState(false);
  const [socialPlatform, setSocialPlatform] = useState("linkedin"); // "linkedin" | "instagram"
  const [socialPosts, setSocialPosts] = useState(() => generateSocialPosts(job));
  const [socialEngine, setSocialEngine] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [copiedPlatform, setCopiedPlatform] = useState(null);

  const vaultOptions = useMemo(() => {
    const activeNames = Array.isArray(liveVaults)
      ? liveVaults.filter((v) => v.is_active !== false).map((v) => v.name)
      : [];
    const base = activeNames.length > 0 ? activeNames : VAULTS;
    const currentVault = formFields.vault ?? mountedJob?.vault;
    if (currentVault && !base.includes(currentVault)) {
      return [...base, currentVault];
    }
    return Array.from(new Set(base));
  }, [liveVaults, formFields.vault, mountedJob?.vault]);

  // Smooth exit handler
  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setMountedJob(null);
      onClose?.();
    }, 260);
  }, [isClosing, onClose]);

  const handleCloseSocialModal = useCallback(() => {
    if (!socialModalOpen || socialModalClosing) return;
    setSocialModalClosing(true);
    setTimeout(() => {
      setSocialModalOpen(false);
      setSocialModalClosing(false);
    }, 130);
  }, [socialModalOpen, socialModalClosing]);

  // Synchronize incoming job prop with internal mounting, closing, and social states
  useEffect(() => {
    if (job) {
      setMountedJob(job);
      setIsClosing(false);
      setIsEditing(false);
      setFormFields({ ...job });
      setSocialModalOpen(false);
      setSocialModalClosing(false);
      setHasLoadedLiveSocial(false);
      setSocialPosts(generateSocialPosts(job));
      setSocialEngine("");
      setCopiedPlatform(null);
    } else if (mountedJob && !isClosing) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setMountedJob(null);
        setIsClosing(false);
      }, 260);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job]);

  // Handle escape key (closes Social Post modal first, then drawer)
  useEffect(() => {
    if (!mountedJob) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (socialModalOpen) {
          handleCloseSocialModal();
          return;
        }
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mountedJob, socialModalOpen, handleCloseSocialModal, handleClose]);

  const handleStatus = async (newStatus) => {
    if (!mountedJob || isSubmitting) return;
    const prevStatus = mountedJob.status;
    setMountedJob((prev) => (prev ? { ...prev, status: newStatus } : prev));
    setIsSubmitting(true);
    try {
      await onStatusChange?.(mountedJob.id, newStatus);
    } catch {
      setMountedJob((prev) => (prev ? { ...prev, status: prevStatus } : prev));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!mountedJob || isSubmitting) return;
    const updated = {
      ...mountedJob,
      ...formFields,
    };
    setIsSubmitting(true);
    try {
      const savedResult = await onJobUpdate?.(updated);
      const nextJob = savedResult && savedResult.id ? savedResult : updated;
      setMountedJob(nextJob);
      setIsEditing(false);
      // Also re-generate social copy with updated fields
      setSocialPosts(generateSocialPosts(nextJob));
      setSocialEngine("");
    } catch {
      // keep editing open on API error
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1-Click Copy Social Post with clipboard & toast
  const handleCopySocialPost = (platform) => {
    const textToCopy =
      platform === "linkedin" ? socialPosts.linkedin : socialPosts.instagram;
    if (!textToCopy) return;

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopiedPlatform(platform);
        toast.success(
          platform === "linkedin"
            ? "LinkedIn post copied to clipboard!"
            : "Instagram caption copied to clipboard!"
        );
        setTimeout(() => setCopiedPlatform(null), 2500);
      });
    } else {
      toast.info("Post ready to copy");
    }
  };

  // Regenerate Social Media Content via live POST /api/jobs/<pk>/generate-content/
  const handleRegenerateSocial = async ({ silentToast = false } = {}) => {
    const targetJob = mountedJob || job;
    if (!targetJob) return;
    setIsRegenerating(true);

    try {
      const { data } = await dispatch(
        generateJobContent({ jobId: targetJob.id, platform: "all" })
      ).unwrap();
      if (data?.content) {
        const content = data.content;
        setSocialPosts({
          linkedin: content.linkedin || content.post || "",
          instagram: content.instagram || content.caption || "",
          hashtags: normalizeHashtags(content.hashtags),
        });
        setSocialEngine(data.engine || "");
        setHasLoadedLiveSocial(true);
        if (!silentToast) {
          toast.success(
            data.engine
              ? `AI Social Posts regenerated (${data.engine})`
              : "AI Social Posts regenerated!"
          );
        }
        setIsRegenerating(false);
        return;
      }
    } catch {
      // Fallback to local template generator if offline / error
    }

    const regenerated = generateSocialPosts({
      ...targetJob,
      ...formFields,
    });
    setSocialPosts(regenerated);
    setSocialEngine("");
    setHasLoadedLiveSocial(true);
    setIsRegenerating(false);
    if (!silentToast) {
      toast.info("Generated social posts locally (server AI unavailable)");
    }
  };

  const handleOpenSocialModal = () => {
    setSocialModalOpen(true);
    if (!hasLoadedLiveSocial && !isRegenerating) {
      handleRegenerateSocial({ silentToast: true });
    }
  };

  if (!mountedJob && !job) return null;

  const activeJob = mountedJob || job;

  const getStatusPill = (status) => {
    switch (status) {
      case "synced":
        return {
          label: "In sheet",
          bg: "bg-[#DCF0E3]",
          text: "text-[#24734A]",
          dot: "bg-[#24734A]",
        };
      case "review":
        return {
          label: "Needs review",
          bg: "bg-[#FBEBCF]",
          text: "text-[#9A5B00]",
          dot: "bg-[#9A5B00]",
        };
      case "duplicate":
        return {
          label: "Duplicate",
          bg: "bg-[#EDF1F5]",
          text: "text-[#4F5B69]",
          dot: "bg-[#5A6777]",
        };
      case "rejected":
        return {
          label: "Rejected",
          bg: "bg-[#F8DEDB]",
          text: "text-[#A8281F]",
          dot: "bg-[#A8281F]",
        };
      default:
        return {
          label: status,
          bg: "bg-[#F6F7F9]",
          text: "text-[#5A6777]",
          dot: "bg-[#5A6777]",
        };
    }
  };

  const pill = getStatusPill(activeJob.status);
  const sourceColor =
    SOURCE_COLORS[activeJob.source_app] ||
    SOURCE_COLORS[activeJob.source] ||
    SOURCE_COLORS.Other;

  // 11 fields strictly matching the reference order in dashboard.html
  const fieldDefs = [
    { key: "title", label: "Job title" },
    { key: "sector", label: "Sector" },
    { key: "company", label: "Company" },
    { key: "location", label: "Location" },
    { key: "country", label: "Country" },
    { key: "experience", label: "Experience" },
    { key: "salary", label: "Salary / CTC" },
    { key: "qualification", label: "Qualification" },
    { key: "other_details", label: "Other details" },
    { key: "work_mode", label: "Work mode" },
    { key: "apply_contact", label: "Apply / contact" },
  ];

  const formatReceived = (dateStr) => {
    if (!dateStr) return "16 Nov, 06:15 am";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 select-none overflow-hidden ${
        isClosing ? "pointer-events-none" : "pointer-events-auto"
      }`}
    >
      {/* Self-contained Keyframe Animations to guarantee zero delay & butter smoothness */}
      <style>{`
        @keyframes jvDrawerSlideIn {
          0% { transform: translate3d(100%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        @keyframes jvDrawerSlideOut {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(100%, 0, 0); }
        }
        @keyframes jvScrimFadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes jvScrimFadeOut {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes jvModalPopIn {
          0% {
            opacity: 0;
            transform: translate3d(0, 6px, 0) scale(0.97);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }
        @keyframes jvModalPopOut {
          0% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate3d(0, 4px, 0) scale(0.97);
          }
        }
        .jv-modal-in {
          animation: jvModalPopIn 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity;
        }
        .jv-modal-out {
          animation: jvModalPopOut 130ms cubic-bezier(0.4, 0, 1, 1) forwards;
          will-change: transform, opacity;
        }
        .jv-modal-scrim-in {
          animation: jvScrimFadeIn 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .jv-modal-scrim-out {
          animation: jvScrimFadeOut 130ms ease-out forwards;
        }
        .jv-scrim-in {
          animation: jvScrimFadeIn 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .jv-scrim-out {
          animation: jvScrimFadeOut 250ms ease-in forwards;
        }
        .jv-panel-in {
          animation: jvDrawerSlideIn 320ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform;
        }
        .jv-panel-out {
          animation: jvDrawerSlideOut 260ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
          will-change: transform;
        }
      `}</style>

      {/* Backdrop Scrim with GPU animated fade */}
      <div
        className={`fixed inset-0 bg-[#0A0F14]/50 backdrop-blur-[2px] ${
          isClosing ? "jv-scrim-out" : "jv-scrim-in"
        }`}
        onClick={handleClose}
      />

      {/* Slide-over Drawer with GPU animated slide */}
      <aside
        className={`fixed top-0 right-0 bottom-0 w-full max-w-[820px] bg-white z-50 flex flex-col shadow-[-4px_0_24px_rgba(21,32,44,0.18)] border-l border-[#DCE1E8] ${
          isClosing ? "jv-panel-out" : "jv-panel-in"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={activeJob.code}
      >
        {/* Drawer Header */}
        <div className="flex justify-between items-start gap-3 p-4 px-6 border-b border-[#DCE1E8] shrink-0 bg-white">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-['IBM_Plex_Mono',monospace] text-[0.8rem] text-[#5A6777]">
                {activeJob.code}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 text-[0.72rem] font-semibold rounded-[20px] px-2.5 py-0.5 ${pill.bg} ${pill.text}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${pill.dot}`} />
                {pill.label}
              </span>
              {/* AI Confidence Meter */}
              <ConfidenceMeter
                confidence={activeJob.confidence}
                animKey={activeJob.id}
                textClassName="text-[#5A6777]"
                titlePrefix="AI confidence"
              />
            </div>
            <h2 className="font-['Bricolage_Grotesque',sans-serif] text-[1.3rem] font-bold text-[#15202C] mt-1.5 leading-snug">
              {activeJob.title || "Untitled"}
            </h2>
            <span className="text-[#5A6777] text-[0.86rem]">
              {activeJob.company || "Company unclear"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="border border-[#DCE1E8] bg-white hover:bg-[#F6F7F9] text-[#15202C] text-[0.82rem] font-semibold px-3 py-1.5 rounded-[6px] transition-colors cursor-pointer select-none"
          >
            Close
          </button>
        </div>

        {/* Drawer Body: 2-Column Split */}
        <div className="overflow-y-auto p-6 grid grid-cols-[270px_minmax(0,1fr)] max-[750px]:grid-cols-1 gap-6 items-start flex-1">
          {/* Left Column: Screenshot Artwork, Filename, & Collapsible OCR text */}
          <div className="flex flex-col gap-3">
            {activeJob.image ? (
              <SafeImage
                src={activeJob.image}
                alt="Original screenshot"
                onClick={() => onZoomImage?.(activeJob.image)}
                className="w-full max-h-[380px] object-contain rounded-[6px] border border-[#DCE1E8] bg-[#F6F7F9] cursor-zoom-in hover:opacity-95 transition-opacity select-none"
                fallbackClassName="w-full h-[220px] rounded-[6px] border border-[#DCE1E8]"
                fallbackLabel="Screenshot preview unavailable"
              />
            ) : (
              <div className="h-[220px] rounded-[6px] border border-[#DCE1E8] bg-[#F6F7F9] grid place-items-center text-[#5A6777] text-sm">
                Screenshot removed
              </div>
            )}

            <div className="text-[#5A6777] font-['IBM_Plex_Mono',monospace] text-[0.74rem] break-all select-text">
              {activeJob.original_name ||
                activeJob.filename ||
                "IMG-20261106-WA0191.jpg"}
            </div>

            {activeJob.raw_text && (
              <details className="text-[0.78rem] text-[#5A6777] group">
                <summary className="cursor-pointer font-semibold hover:text-[#15202C] py-1 select-none">
                  Text the AI read from the image
                </summary>
                <pre className="font-['IBM_Plex_Mono',monospace] text-[0.74rem] whitespace-pre-wrap bg-[#FFFFFF] border border-[#DCE1E8] rounded-[6px] p-2.5 text-[#5A6777] max-h-[220px] overflow-auto mt-1.5 m-0 select-text">
                  {activeJob.raw_text}
                </pre>
              </details>
            )}
          </div>

          {/* Right Column: Meta badges, Duplicate banner, 11 Field definitions, & AI Social Media Generator */}
          <div className="flex flex-col gap-4 min-w-0">
            {/* Meta Tags Row */}
            <div className="flex items-center gap-2 flex-wrap text-[0.76rem]">
              {getJobVaults(activeJob).map((v) => {
                const isRemote = v.toLowerCase().includes("remote");
                const isGlobal = v.toLowerCase().includes("global");
                return (
                  <span
                    key={v}
                    className={`font-semibold border rounded-[4px] px-[7px] py-[1.5px] inline-flex items-center gap-1 ${
                      isRemote
                        ? "border-[#B5D4F4] bg-[#EAF2FB] text-[#1E568B]"
                        : isGlobal
                        ? "border-[#E1D4F4] bg-[#F5F0FB] text-[#5A2C91]"
                        : "border-[#DCE1E8] bg-[#F6F7F9] text-[#15202C]"
                    }`}
                  >
                    {isRemote && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1E568B] inline-block shrink-0" />
                    )}
                    {v}
                  </span>
                );
              })}
              <span className="inline-flex items-center gap-1.5 font-semibold text-[#15202C]">
                <i
                  className="w-2 h-2 rounded-[2px]"
                  style={{ backgroundColor: sourceColor }}
                />
                {activeJob.source_app || activeJob.source || "Other"}
              </span>
              <span className="text-[#5A6777]">
                Received {formatReceived(activeJob.created_at)}
              </span>
            </div>

            {/* Duplicate Notice Banner */}
            {activeJob.status === "duplicate" && (
              <div className="bg-[#DCEAF5] border border-transparent rounded-[6px] p-[10px_14px] text-[0.84rem] text-[#235F8C] flex items-center gap-2">
                <b className="font-bold text-[#235F8C] shrink-0">Duplicate</b>
                <span>
                  Same job as{" "}
                  <button
                    type="button"
                    onClick={() =>
                      onOpenJobId?.(activeJob.duplicate_of || 1041)
                    }
                    className="underline font-bold text-[#235F8C] hover:text-[#15202C] cursor-pointer"
                  >
                    {activeJob.duplicate_of_code || "M-031126-01"}
                  </button>
                  . It was not added twice.
                </span>
              </div>
            )}

            {/* 11 Fields Form */}
            <form onSubmit={handleSave} className="flex flex-col gap-3.5 pt-1">
              {fieldDefs.map(({ key, label }) => {
                const val = formFields[key] ?? activeJob[key] ?? "";
                const isFieldEmpty = !val || val === "—";

                return (
                  <div key={key} className="flex flex-col gap-0.5">
                    <label className="text-[0.74rem] font-semibold text-[#5A6777]">
                      {label}
                    </label>

                    {isEditing ? (
                      <div>
                        {key === "work_mode" ? (
                          <select
                            value={val}
                            onChange={(e) =>
                              setFormFields((prev) => ({
                                ...prev,
                                [key]: e.target.value,
                              }))
                            }
                            className="w-full h-[36px] px-3 border border-[#DCE1E8] rounded-[6px] text-[0.86rem] text-[#15202C] bg-white focus:outline-2 focus:outline-[#9C6B12]"
                          >
                            <option value="">Not stated</option>
                            <option value="Onsite">Onsite</option>
                            <option value="Hybrid">Hybrid</option>
                            <option value="Remote">Remote</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={val}
                            onChange={(e) =>
                              setFormFields((prev) => ({
                                ...prev,
                                [key]: e.target.value,
                              }))
                            }
                            placeholder={isFieldEmpty ? "Not readable in image" : ""}
                            className="w-full h-[36px] px-3 border border-[#DCE1E8] rounded-[6px] text-[0.86rem] text-[#15202C] bg-white focus:outline-2 focus:outline-[#9C6B12]"
                          />
                        )}
                      </div>
                    ) : (
                      <div className="font-semibold text-[0.88rem] text-[#15202C] break-words">
                        {val || "—"}
                      </div>
                    )}
                  </div>
                );
              })}

              {isEditing && (
                <div className="flex flex-col gap-0.5 pt-1">
                  <label className="text-[0.74rem] font-semibold text-[#5A6777]">
                    Vault
                  </label>
                  <select
                    value={formFields.vault ?? activeJob.vault}
                    onChange={(e) =>
                      setFormFields((prev) => ({
                        ...prev,
                        vault: e.target.value,
                      }))
                    }
                    className="w-full h-[36px] px-3 border border-[#DCE1E8] rounded-[6px] text-[0.86rem] text-[#15202C] bg-white focus:outline-2 focus:outline-[#9C6B12]"
                  >
                    {vaultOptions.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Drawer Footer Action Bar */}
        <div className="p-3.5 px-6 border-t border-[#DCE1E8] flex items-center justify-between gap-3 flex-wrap bg-white shrink-0">
          <div className="flex items-center gap-2">
            {activeJob.status !== "rejected" && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleStatus("rejected")}
                className="border border-[#DCE1E8] bg-white text-[#A8281F] hover:bg-[#F8DEDB]/50 text-[0.82rem] font-semibold px-3.5 py-1.5 rounded-[6px] transition-colors cursor-pointer select-none disabled:opacity-50"
              >
                Reject
              </button>
            )}
            {(activeJob.status === "rejected" ||
              activeJob.status === "duplicate") && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleStatus("review")}
                className="border border-[#DCE1E8] bg-white text-[#15202C] hover:bg-[#F6F7F9] text-[0.82rem] font-semibold px-3.5 py-1.5 rounded-[6px] transition-colors cursor-pointer select-none disabled:opacity-50"
              >
                Move to review
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Social Post Modal Trigger Button */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleOpenSocialModal}
              className="inline-flex items-center gap-1.5 border border-[#E5C98E] bg-[#FAF4E8] hover:bg-[#F5EAD3] text-[#9C6B12] text-[0.82rem] font-semibold px-3.5 py-1.5 rounded-[6px] transition-colors cursor-pointer select-none disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current shrink-0">
                <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2zm7 12l.9 2.6L22.5 17.5l-2.6.9L19 21l-.9-2.6-2.6-.9 2.6-.9L19 14z" />
              </svg>
              <span>Social Post</span>
            </button>

            {!isEditing ? (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsEditing(true)}
                className="border border-[#DCE1E8] bg-white hover:bg-[#F6F7F9] text-[#15202C] text-[0.82rem] font-semibold px-3.5 py-1.5 rounded-[6px] transition-colors cursor-pointer select-none disabled:opacity-50"
              >
                Edit
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSave}
                className="bg-[#9C6B12] text-white hover:brightness-105 text-[0.82rem] font-semibold px-4 py-1.5 rounded-[6px] transition-all cursor-pointer select-none shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save changes"}
              </button>
            )}

            {activeJob.status === "review" && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleStatus("synced")}
                className="bg-[#24734A] text-white hover:brightness-105 text-[0.82rem] font-semibold px-4 py-1.5 rounded-[6px] transition-all cursor-pointer select-none shadow-sm disabled:opacity-50"
              >
                Approve & add to sheet
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Rounded AI Social Post Generator Modal */}
      {socialModalOpen && (
        <div
          className={`fixed inset-0 z-[60] bg-[#0A0F14]/55 backdrop-blur-[2px] flex items-center justify-center p-4 ${
            socialModalClosing
              ? "jv-modal-scrim-out pointer-events-none"
              : "jv-modal-scrim-in pointer-events-auto"
          }`}
          onClick={handleCloseSocialModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="AI Social Post Generator"
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-[780px] bg-white border border-[#DCE1E8] rounded-[8px] shadow-[0_24px_60px_rgba(15,23,42,0.28)] overflow-hidden flex flex-col max-h-[90vh] ${
              socialModalClosing ? "jv-modal-out" : "jv-modal-in"
            }`}
          >
            {/* Modal Header */}
            <div className="p-4 px-5 border-b border-[#DCE1E8] flex items-start justify-between gap-3 shrink-0 bg-white">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-[30px] h-[30px] rounded-[6px] bg-gradient-to-tr from-[#9C6B12] to-[#E0A838] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                    <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2zm7 12l.9 2.6L22.5 17.5l-2.6.9L19 21l-.9-2.6-2.6-.9 2.6-.9L19 14z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h3 className="font-['Bricolage_Grotesque',sans-serif] text-[1.08rem] font-bold text-[#15202C] m-0 leading-tight">
                    AI Social Post Generator
                  </h3>
                  <span className="text-[0.76rem] text-[#5A6777] block mt-0.5">
                    {socialEngine
                      ? `Generated live via ${socialEngine}`
                      : "Auto-generated from screenshot & job data for LinkedIn & Instagram"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseSocialModal}
                aria-label="Close Social Post modal"
                className="w-8 h-8 rounded-[6px] border border-[#DCE1E8] bg-white hover:bg-[#F6F7F9] text-[#5A6777] hover:text-[#15202C] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 stroke-current fill-none stroke-[2]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Platform Tabs + Regenerate Row */}
            <div className="px-5 py-3 bg-white border-b border-[#DCE1E8] flex items-center justify-between gap-3 flex-wrap shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSocialPlatform("linkedin")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[0.78rem] font-semibold transition-all cursor-pointer select-none ${
                    socialPlatform === "linkedin"
                      ? "bg-[#E8F3FF] text-[#0A66C2] border border-[#B8D8F8] shadow-2xs"
                      : "text-[#5A6777] hover:text-[#15202C] hover:bg-[#F6F7F9] border border-transparent"
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#0A66C2]">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.74v-8.37H5.06v8.37h2.8z" />
                  </svg>
                  <span>LinkedIn Post</span>
                  <span className="text-[0.62rem] bg-[#0A66C2]/15 text-[#0A66C2] px-1.5 py-0.2 rounded-full font-bold ml-0.5">
                    Professional
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSocialPlatform("instagram")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[0.78rem] font-semibold transition-all cursor-pointer select-none ${
                    socialPlatform === "instagram"
                      ? "bg-[#FDF2F4] text-[#D6336C] border border-[#F9CCD5] shadow-2xs"
                      : "text-[#5A6777] hover:text-[#15202C] hover:bg-[#F6F7F9] border border-transparent"
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#D6336C]">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span>Instagram Caption</span>
                  <span className="text-[0.62rem] bg-[#D6336C]/15 text-[#D6336C] px-1.5 py-0.2 rounded-full font-bold ml-0.5">
                    Engaging
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleRegenerateSocial()}
                disabled={isRegenerating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[0.76rem] font-semibold rounded-[6px] border border-[#DCE1E8] bg-white hover:border-[#5A6777] text-[#15202C] transition-all cursor-pointer disabled:opacity-50 select-none shadow-2xs"
                title="Regenerate with AI"
              >
                <svg
                  viewBox="0 0 24 24"
                  className={`w-3.5 h-3.5 stroke-current fill-none stroke-[2] ${
                    isRegenerating ? "animate-spin text-[#9C6B12]" : ""
                  }`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>{isRegenerating ? "Generating..." : "Regenerate"}</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-3">
              {isRegenerating ? (
                <div className="min-h-[220px] flex flex-col items-center justify-center gap-2.5 text-center text-[#5A6777]">
                  <span className="w-6 h-6 rounded-full border-2 border-[#DCE1E8] border-t-[#9C6B12] animate-spin" />
                  <span className="text-[0.84rem] font-medium">
                    AI is reading job details &amp; drafting social posts...
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-[0.74rem] text-[#5A6777]">
                    <span className="font-semibold text-[#15202C]">
                      {socialPlatform === "linkedin"
                        ? "LinkedIn Post Content"
                        : "Instagram Caption Content"}
                    </span>
                    <span className="font-mono text-[0.7rem]">
                      {socialPlatform === "linkedin"
                        ? `${socialPosts.linkedin?.length || 0} characters`
                        : `${socialPosts.instagram?.length || 0} characters`}
                    </span>
                  </div>

                  <textarea
                    rows={10}
                    value={
                      socialPlatform === "linkedin"
                        ? socialPosts.linkedin
                        : socialPosts.instagram
                    }
                    onChange={(e) => {
                      const text = e.target.value;
                      setSocialPosts((prev) => ({
                        ...prev,
                        [socialPlatform]: text,
                      }));
                    }}
                    placeholder="Social post content..."
                    className="w-full bg-[#FAFBFD] border border-[#DCE1E8] rounded-[6px] p-3.5 text-[0.82rem] text-[#15202C] leading-relaxed resize-y focus:outline-none focus:border-[#9C6B12] focus:ring-1 focus:ring-[#9C6B12] font-normal transition-all"
                  />

                  {/* Hashtags Bar */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[0.7rem] text-[#5A6777] font-semibold mr-1">
                      Hashtags:
                    </span>
                    {(socialPlatform === "linkedin"
                      ? socialPosts.hashtags?.linkedin
                      : socialPosts.hashtags?.instagram
                    )?.map((tag, idx) => (
                      <span
                        key={idx}
                        className="font-mono text-[0.68rem] bg-[#F6F7F9] border border-[#DCE1E8] rounded-[4px] px-2 py-0.5 text-[#5A6777]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 border-t border-[#DCE1E8] bg-white flex items-center justify-between gap-3 flex-wrap shrink-0">
              <button
                type="button"
                onClick={handleCloseSocialModal}
                className="border border-[#DCE1E8] bg-white hover:bg-[#F6F7F9] text-[#15202C] text-[0.82rem] font-semibold px-3.5 py-1.5 rounded-[6px] transition-colors cursor-pointer select-none"
              >
                Close
              </button>

              <button
                type="button"
                disabled={isRegenerating}
                onClick={() => handleCopySocialPost(socialPlatform)}
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-[6px] font-semibold text-[0.82rem] transition-all cursor-pointer shadow-sm select-none disabled:opacity-50 ${
                  copiedPlatform === socialPlatform
                    ? "bg-[#24734A] text-white"
                    : socialPlatform === "linkedin"
                    ? "bg-[#0A66C2] hover:bg-[#084e96] text-white"
                    : "bg-gradient-to-r from-[#D6336C] to-[#E1306C] hover:opacity-95 text-white"
                }`}
              >
                {copiedPlatform === socialPlatform ? (
                  <>
                    <svg
                      viewBox="0 0 24 24"
                      className="w-3.5 h-3.5 stroke-current fill-none stroke-[2.5]"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <svg
                      viewBox="0 0 24 24"
                      className="w-3.5 h-3.5 stroke-current fill-none stroke-[2]"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                    <span>
                      {socialPlatform === "linkedin"
                        ? "Copy for LinkedIn"
                        : "Copy for Instagram"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
