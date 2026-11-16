import { VAULTS, SOURCES } from "./jobsData";

export default function JobSheetToolbar({
  searchQuery,
  onSearchChange,
  selectedVault,
  onVaultChange,
  selectedSource,
  onSourceChange,
  selectedStatus,
  onStatusChange,
  totalJobsCount,
}) {
  const statusTabs = [
    { key: "all", label: "All" },
    { key: "synced", label: "In sheet" },
    { key: "review", label: "Review" },
    { key: "duplicate", label: "Duplicates" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <div className="flex items-center justify-between gap-3 p-3.5 border-b border-[#DCE1E8] flex-wrap">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search Input */}
        <input
          type="search"
          placeholder="Search title, company, city, salary"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="border border-[#DCE1E8] bg-white rounded-[6px] px-2.5 py-1.5 text-[0.84rem] text-[#15202C] w-[260px] max-[640px]:w-full focus:outline-none focus:border-[#9C6B12] focus:ring-1 focus:ring-[#9C6B12] placeholder:text-[#8D9CAE]"
        />

        {/* Vault Filter Dropdown */}
        <select
          value={selectedVault}
          onChange={(e) => onVaultChange(e.target.value)}
          aria-label="Filter by vault"
          className="border border-[#DCE1E8] bg-white rounded-[6px] px-2.5 py-1.5 text-[0.84rem] text-[#15202C] focus:outline-none focus:border-[#9C6B12] cursor-pointer"
        >
          <option value="all">All vaults</option>
          {VAULTS.map((vault) => (
            <option key={vault} value={vault}>
              {vault}
            </option>
          ))}
        </select>

        {/* Source Filter Dropdown */}
        <select
          value={selectedSource}
          onChange={(e) => onSourceChange(e.target.value)}
          aria-label="Filter by source"
          className="border border-[#DCE1E8] bg-white rounded-[6px] px-2.5 py-1.5 text-[0.84rem] text-[#15202C] focus:outline-none focus:border-[#9C6B12] cursor-pointer"
        >
          <option value="all">All sources</option>
          {SOURCES.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>

        {/* Status Segmented Tabs */}
        <div className="inline-flex border border-[#DCE1E8] rounded-[6px] overflow-hidden bg-white">
          {statusTabs.map((tab) => {
            const isActive = selectedStatus === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onStatusChange(tab.key)}
                className={`px-3 py-1.5 text-[0.8rem] font-semibold transition-colors cursor-pointer select-none border-r border-[#DCE1E8] last:border-r-0 ${
                  isActive
                    ? "bg-[#15202C] text-white"
                    : "text-[#5A6777] bg-white hover:bg-[#F6F7F9] hover:text-[#15202C]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Jobs Counter */}
      <span className="font-['IBM_Plex_Mono',monospace] text-[0.8rem] text-[#5A6777] select-none">
        {totalJobsCount} job{totalJobsCount === 1 ? "" : "s"}
      </span>
    </div>
  );
}

