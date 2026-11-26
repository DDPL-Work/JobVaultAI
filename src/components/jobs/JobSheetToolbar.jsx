import { useMemo } from "react";
import { useSelector } from "react-redux";
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
  const { vaults: liveVaults, loaded: vaultsLoaded } = useSelector(
    (state) => state.vaults || {}
  );

  const allVaults = useMemo(() => {
    const activeNames = Array.isArray(liveVaults)
      ? liveVaults.filter((v) => v.is_active !== false).map((v) => v.name)
      : [];
    const baseList =
      vaultsLoaded || activeNames.length > 0 ? activeNames : VAULTS;
    if (selectedVault && selectedVault !== "all" && !baseList.includes(selectedVault)) {
      return [...baseList, selectedVault];
    }
    return Array.from(new Set(baseList));
  }, [liveVaults, vaultsLoaded, selectedVault]);

  const statusTabs = [
    { key: "all", label: "All" },
    { key: "synced", label: "In sheet" },
    { key: "review", label: "Review" },
    { key: "duplicate", label: "Duplicates" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 sm:gap-3 p-3 sm:p-3.5 border-b border-[#DCE1E8] w-full min-w-0">
      <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto min-w-0 flex-1">
        {/* Search Input */}
        <input
          type="search"
          placeholder="Search title, company, city, salary"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="border border-[#DCE1E8] bg-white rounded-[6px] px-2.5 py-1.5 text-[0.84rem] text-[#15202C] w-full sm:w-[250px] min-w-0 focus:outline-none focus:border-[#9C6B12] focus:ring-1 focus:ring-[#9C6B12] placeholder:text-[#8D9CAE]"
        />

        {/* Vault & Source Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto min-w-0">
          <select
            value={selectedVault}
            onChange={(e) => onVaultChange(e.target.value)}
            aria-label="Filter by vault"
            className="border border-[#DCE1E8] bg-white rounded-[6px] px-2.5 py-1.5 text-[0.82rem] sm:text-[0.84rem] text-[#15202C] w-full sm:w-auto sm:max-w-[200px] min-w-0 truncate focus:outline-none focus:border-[#9C6B12] cursor-pointer"
          >
            <option value="all">All vaults</option>
            {allVaults.map((vault) => (
              <option key={vault} value={vault}>
                {vault}
              </option>
            ))}
          </select>

          <select
            value={selectedSource}
            onChange={(e) => onSourceChange(e.target.value)}
            aria-label="Filter by source"
            className="border border-[#DCE1E8] bg-white rounded-[6px] px-2.5 py-1.5 text-[0.82rem] sm:text-[0.84rem] text-[#15202C] w-full sm:w-auto min-w-0 truncate focus:outline-none focus:border-[#9C6B12] cursor-pointer"
          >
            <option value="all">All sources</option>
            {SOURCES.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>

        {/* Status Segmented Tabs */}
        <div className="flex items-center w-full sm:w-auto max-w-full overflow-x-auto no-scrollbar border border-[#DCE1E8] rounded-[6px] bg-white">
          {statusTabs.map((tab) => {
            const isActive = selectedStatus === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onStatusChange(tab.key)}
                className={`flex-1 sm:flex-none whitespace-nowrap px-2.5 sm:px-3 py-1.5 text-[0.75rem] sm:text-[0.8rem] font-semibold transition-colors cursor-pointer select-none border-r border-[#DCE1E8] last:border-r-0 ${
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
      <span className="font-['IBM_Plex_Mono',monospace] text-[0.78rem] sm:text-[0.8rem] text-[#5A6777] select-none shrink-0">
        {totalJobsCount} job{totalJobsCount === 1 ? "" : "s"}
      </span>
    </div>
  );
}

