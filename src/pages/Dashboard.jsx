import { Link } from "react-router-dom";

// Platform brand colors matching the HTML design
const SOURCE_COLORS = {
  LinkedIn: "#0A66C2",
  WhatsApp: "#25A35A",
  Telegram: "#2A86C9",
  Instagram: "#D6336C",
  Other: "#7A8696",
};

// Demo sample data matching the design specification
const STATS = {
  screenshotsWeek: 14,
  screenshots: 14,
  inSheet: 11,
  addedToday: 2,
  review: 2,
  duplicates: 1,
  failed: 0,
  threshold: 80,
  byVault: {
    "India · Fresher": 2,
    "India · Junior": 2,
    "India · Mid-level": 3,
    "India · Senior": 2,
    "Global": 2,
    "Remote": 1,
  },
  bySource: [
    { source: "LinkedIn", count: 5 },
    { source: "WhatsApp", count: 4 },
    { source: "Telegram", count: 3 },
    { source: "Instagram", count: 2 },
  ],
  recentJobs: [
    {
      id: 1040,
      code: "JV-1040",
      title: "Senior Data Analyst",
      company: "Northwind Analytics",
      location: "Bengaluru",
      vault: "India · Mid-level",
      source: "LinkedIn",
      status: "synced",
    },
    {
      id: 1039,
      code: "JV-1039",
      title: "Customer Support Executive",
      company: "Himal BPO Services",
      location: "Dehradun",
      vault: "India · Fresher",
      source: "WhatsApp",
      status: "synced",
    },
    {
      id: 1038,
      code: "JV-1038",
      title: "Frontend Developer (React)",
      company: "Lumen Stack",
      location: "Remote",
      vault: "Remote",
      source: "Telegram",
      status: "synced",
    },
    {
      id: 1037,
      code: "JV-1037",
      title: "Marketing Manager",
      company: "Sandline Retail",
      location: "Dubai, UAE",
      vault: "Global",
      source: "LinkedIn",
      status: "synced",
    },
    {
      id: 1036,
      code: "JV-1036",
      title: "Content Writer",
      company: "Company unclear",
      location: "Location unclear",
      vault: "India · Fresher",
      source: "Instagram",
      status: "review",
    },
    {
      id: 1035,
      code: "JV-1035",
      title: "Sales Manager - B2B",
      company: "Vantage Polymers",
      location: "Noida",
      vault: "India · Mid-level",
      source: "WhatsApp",
      status: "review",
    },
    {
      id: 1034,
      code: "JV-1034",
      title: "Head of Engineering",
      company: "Quickbasket",
      location: "Mumbai",
      vault: "India · Senior",
      source: "LinkedIn",
      status: "synced",
    },
    {
      id: 1033,
      code: "JV-1033",
      title: "Business Analyst",
      company: "Crestview Consulting",
      location: "Gurugram",
      vault: "India · Junior",
      source: "Telegram",
      status: "synced",
    },
  ],
  days: [
    { date: "03", count: 1 },
    { date: "04", count: 0 },
    { date: "05", count: 1 },
    { date: "06", count: 2 },
    { date: "07", count: 1 },
    { date: "08", count: 1 },
    { date: "09", count: 0 },
    { date: "10", count: 1 },
    { date: "11", count: 2 },
    { date: "12", count: 1 },
    { date: "13", count: 1 },
    { date: "14", count: 1 },
    { date: "15", count: 0 },
    { date: "16", count: 2 },
  ],
};

/**
 * Reusable KPI Card Component
 */
function KpiCard({ to, label, value, description, isAttn = false, isBad = false }) {
  const cardContent = (
    <>
      <span className="text-[0.7rem] uppercase tracking-[0.08em] font-semibold text-[#5A6777]">
        {label}
      </span>
      <span
        className={`font-['Bricolage_Grotesque',sans-serif] text-[1.8rem] font-bold tabular-nums leading-[1.1] ${
          isAttn ? "text-[#9A5B00]" : isBad ? "text-[#A8281F]" : "text-[#15202C]"
        }`}
      >
        {value}
      </span>
      <span className="text-[0.78rem] text-[#5A6777]">{description}</span>
    </>
  );

  const baseClasses = `p-[14px_16px] rounded-[8px] flex flex-col gap-1 transition-colors ${
    isAttn
      ? "bg-[#FBEBCF] border border-transparent"
      : "bg-white border border-[#DCE1E8] hover:border-[#5A6777]"
  }`;

  if (to) {
    return (
      <Link to={to} className={baseClasses}>
        {cardContent}
      </Link>
    );
  }

  return <div className={baseClasses}>{cardContent}</div>;
}

/**
 * Reusable Status Pill Component
 */
function StatusPill({ status }) {
  switch (status) {
    case "synced":
      return (
        <span className="inline-flex items-center gap-1.5 text-[0.72rem] font-semibold rounded-full px-2.5 py-0.5 whitespace-nowrap text-[#24734A] bg-[#DCF0E3]">
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
          In sheet
        </span>
      );
    case "review":
      return (
        <span className="inline-flex items-center gap-1.5 text-[0.72rem] font-semibold rounded-full px-2.5 py-0.5 whitespace-nowrap text-[#9A5B00] bg-[#FBEBCF]">
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
          Needs review
        </span>
      );
    case "duplicate":
      return (
        <span className="inline-flex items-center gap-1.5 text-[0.72rem] font-semibold rounded-full px-2.5 py-0.5 whitespace-nowrap text-[#5A6777] bg-[#F6F7F9]">
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
          Duplicate
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center gap-1.5 text-[0.72rem] font-semibold rounded-full px-2.5 py-0.5 whitespace-nowrap text-[#A8281F] bg-[#F8DEDB]">
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
          Rejected
        </span>
      );
    default:
      return null;
  }
}

/**
 * Reusable Source Tag Component
 */
function SourceTag({ source }) {
  const color = SOURCE_COLORS[source] || SOURCE_COLORS.Other;
  return (
    <span className="inline-flex items-center text-[0.76rem] font-semibold whitespace-nowrap text-[#15202C]">
      <i
        className="inline-block w-2 h-2 rounded-[2px] mr-1.5 shrink-0"
        style={{ backgroundColor: color }}
      ></i>
      {source}
    </span>
  );
}

/**
 * Main Dashboard Page
 */
export default function Dashboard() {
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 17
      ? "Good afternoon"
      : "Good evening";

  const maxVaultCount = Math.max(1, ...Object.values(STATS.byVault));
  const maxDayCount = Math.max(1, ...STATS.days.map((d) => d.count));
  const totalSources = STATS.bySource.reduce((acc, curr) => acc + curr.count, 0) || 1;

  return (
    <div className="flex flex-col gap-5">
      {/* Page Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-['Bricolage_Grotesque',sans-serif] text-[1.65rem] font-bold text-[#15202C] tracking-[-0.01em] leading-tight m-0">
            {greeting}
          </h1>
          <p className="mt-1 text-[#5A6777] max-w-[70ch] text-[0.875rem] leading-normal m-0">
            Job screenshots are read by AI, checked against the text in the image, sorted into
            vaults and added to your job sheet.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/jobs"
            className="border border-[#DCE1E8] bg-white text-[#15202C] hover:border-[#5A6777] rounded-[6px] px-3.5 py-1.5 font-semibold text-[0.85rem] inline-flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer select-none"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5 stroke-current fill-none stroke-2"
            >
              <path d="M12 4v12M7 11l5 5 5-5M4 20h16" />
            </svg>
            Export to Excel
          </Link>
          <Link
            to="/inbox"
            className="bg-[#9C6B12] border border-[#9C6B12] text-white hover:brightness-105 rounded-[6px] px-3.5 py-1.5 font-semibold text-[0.85rem] inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer select-none"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5 stroke-current fill-none stroke-2"
            >
              <path d="M12 16V4M7 9l5-5 5 5M4 20h16" />
            </svg>
            Add screenshots
          </Link>
        </div>
      </div>

      {/* Online Demo Banner */}
      <div className="bg-[#FBEBCF] border border-transparent rounded-[6px] p-[12px_14px] text-[0.85rem] flex items-start gap-3 text-[#15202C]">
        <b className="text-[#9A5B00] font-bold shrink-0">Online demo</b>
        <span>
          This page runs in your browser with sample data, so any screenshot you add gets a sample
          job. The installed version reads real screenshots with Gemini or OpenAI and saves to a
          database.
        </span>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 min-[1101px]:grid-cols-5 gap-4">
        <KpiCard
          to="/inbox"
          label="Screenshots this week"
          value={STATS.screenshotsWeek}
          description={`${STATS.screenshots} in total`}
        />
        <KpiCard
          to="/jobs"
          label="Jobs in sheet"
          value={STATS.inSheet}
          description={`${STATS.addedToday} added today`}
        />
        <KpiCard
          to="/review"
          label="Needs your review"
          value={STATS.review}
          description={`Unclear or below ${STATS.threshold}% confidence`}
          isAttn={STATS.review > 0}
        />
        <KpiCard
          label="Duplicates skipped"
          value={STATS.duplicates}
          description="Same job shared again"
        />
        <KpiCard
          to="/inbox"
          label="Failed to read"
          value={STATS.failed}
          description={STATS.failed ? "Open to retry" : "Nothing failed"}
          isBad={STATS.failed > 0}
        />
      </div>

      {/* Main 2-Column Split */}
      <div className="grid grid-cols-1 min-[901px]:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] gap-4">
        {/* Left Column: Latest Jobs Table */}
        <div className="bg-white border border-[#DCE1E8] rounded-[8px] overflow-hidden">
          <div className="flex items-center justify-between p-[14px_16px] border-b border-[#DCE1E8] flex-wrap gap-2.5">
            <h2 className="font-['Bricolage_Grotesque',sans-serif] text-[1.08rem] font-bold text-[#15202C] tracking-[-0.01em] m-0">
              Latest jobs
            </h2>
            <Link
              to="/jobs"
              className="text-[#15202C] hover:border-[#5A6777] border border-[#DCE1E8] rounded-[6px] px-2.5 py-1 text-[0.78rem] font-semibold transition-colors"
            >
              Open job sheet
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[0.84rem]">
              <thead>
                <tr className="bg-[#F6F7F9]">
                  <th className="text-left text-[0.7rem] uppercase tracking-[0.07em] text-[#5A6777] font-semibold p-[9px_12px] border-b border-[#DCE1E8] whitespace-nowrap">
                    Job
                  </th>
                  <th className="text-left text-[0.7rem] uppercase tracking-[0.07em] text-[#5A6777] font-semibold p-[9px_12px] border-b border-[#DCE1E8] whitespace-nowrap">
                    Vault
                  </th>
                  <th className="text-left text-[0.7rem] uppercase tracking-[0.07em] text-[#5A6777] font-semibold p-[9px_12px] border-b border-[#DCE1E8] whitespace-nowrap">
                    Source
                  </th>
                  <th className="text-left text-[0.7rem] uppercase tracking-[0.07em] text-[#5A6777] font-semibold p-[9px_12px] border-b border-[#DCE1E8] whitespace-nowrap">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {STATS.recentJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-[#F6F7F9] transition-colors cursor-pointer"
                  >
                    <td className="p-[10px_12px] border-b border-[#DCE1E8]">
                      <b className="font-semibold block text-[#15202C]">{job.title}</b>
                      <span className="text-[0.78rem] text-[#5A6777]">
                        {job.company} · {job.location}
                      </span>
                    </td>
                    <td className="p-[10px_12px] border-b border-[#DCE1E8]">
                      <span className="text-[0.74rem] font-semibold border border-[#DCE1E8] rounded-[4px] px-[7px] py-[1px] whitespace-nowrap bg-[#F6F7F9]">
                        {job.vault}
                      </span>
                    </td>
                    <td className="p-[10px_12px] border-b border-[#DCE1E8]">
                      <SourceTag source={job.source} />
                    </td>
                    <td className="p-[10px_12px] border-b border-[#DCE1E8]">
                      <StatusPill status={job.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Vaults, 14-Day Spark, and Sources */}
        <div className="flex flex-col gap-4">
          {/* Jobs per Vault */}
          <div className="bg-white border border-[#DCE1E8] rounded-[8px]">
            <div className="flex items-center justify-between p-[14px_16px] border-b border-[#DCE1E8]">
              <h2 className="font-['Bricolage_Grotesque',sans-serif] text-[1.08rem] font-bold text-[#15202C] tracking-[-0.01em] m-0">
                Jobs per vault
              </h2>
              <Link
                to="/vaults"
                className="text-[#15202C] hover:border-[#5A6777] border border-[#DCE1E8] rounded-[6px] px-2.5 py-1 text-[0.78rem] font-semibold transition-colors"
              >
                Open vaults
              </Link>
            </div>
            <div className="p-4 flex flex-col gap-[11px]">
              {Object.entries(STATS.byVault).map(([vaultName, count]) => {
                const widthPercent = (count / maxVaultCount) * 100;
                return (
                  <div
                    key={vaultName}
                    className="grid grid-cols-[140px_minmax(0,1fr)_36px] max-[620px]:grid-cols-[110px_minmax(0,1fr)_30px] gap-2.5 items-center text-[0.84rem]"
                  >
                    <span className="truncate text-[#15202C]">{vaultName}</span>
                    <div className="h-[10px] rounded-[5px] bg-[#F6F7F9] overflow-hidden border border-[#DCE1E8]">
                      <div
                        className="h-full bg-[#9C6B12] rounded-[5px] min-w-[2px] transition-all"
                        style={{ width: `${widthPercent}%` }}
                      ></div>
                    </div>
                    <span className="text-right font-['IBM_Plex_Mono',monospace] text-[#15202C]">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Jobs Added Last 14 Days */}
          <div className="bg-white border border-[#DCE1E8] rounded-[8px]">
            <div className="flex items-center justify-between p-[14px_16px] border-b border-[#DCE1E8]">
              <h2 className="font-['Bricolage_Grotesque',sans-serif] text-[1.08rem] font-bold text-[#15202C] tracking-[-0.01em] m-0">
                Jobs added, last 14 days
              </h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-14 gap-1 items-end h-[84px]">
                {STATS.days.map((item, index) => {
                  const heightPercent = item.count
                    ? Math.max(8, (item.count / maxDayCount) * 100)
                    : 4;
                  return (
                    <div
                      key={index}
                      title={`Day ${item.date}: ${item.count} jobs`}
                      className={`rounded-t-[3px] min-h-[3px] transition-all ${
                        item.count ? "bg-[#9C6B12]" : "bg-[#DCE1E8]"
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    ></div>
                  );
                })}
              </div>
              <div className="grid grid-cols-14 gap-1 text-[0.64rem] text-[#5A6777] text-center mt-1 font-['IBM_Plex_Mono',monospace]">
                {STATS.days.map((item, index) => (
                  <span key={index}>{item.date}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Where Jobs Come From */}
          <div className="bg-white border border-[#DCE1E8] rounded-[8px]">
            <div className="flex items-center justify-between p-[14px_16px] border-b border-[#DCE1E8]">
              <h2 className="font-['Bricolage_Grotesque',sans-serif] text-[1.08rem] font-bold text-[#15202C] tracking-[-0.01em] m-0">
                Where jobs come from
              </h2>
            </div>
            <div className="p-4 flex flex-col gap-[11px]">
              {STATS.bySource.map(({ source, count }) => {
                const widthPercent = (count / totalSources) * 100;
                const sourceColor = SOURCE_COLORS[source] || SOURCE_COLORS.Other;
                return (
                  <div
                    key={source}
                    className="grid grid-cols-[140px_minmax(0,1fr)_36px] max-[620px]:grid-cols-[110px_minmax(0,1fr)_30px] gap-2.5 items-center text-[0.84rem]"
                  >
                    <span>
                      <SourceTag source={source} />
                    </span>
                    <div className="h-[10px] rounded-[5px] bg-[#F6F7F9] overflow-hidden border border-[#DCE1E8]">
                      <div
                        className="h-full rounded-[5px] min-w-[2px] transition-all"
                        style={{
                          width: `${widthPercent}%`,
                          backgroundColor: sourceColor,
                        }}
                      ></div>
                    </div>
                    <span className="text-right font-['IBM_Plex_Mono',monospace] text-[#15202C]">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
