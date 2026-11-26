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
  canScrollLeft = false,
  canScrollRight = false,
  onScrollLeft,
  onScrollRight,
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
    <div className="flex flex-col lg:flex-row lg:items-center lg:flex-nowrap justify-between gap-2 p-3 border-b border-[#DCE1E8] w-full min-w-0">
      {/* Left Filters: Search + Vault & Source */}
      <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap w-full lg:flex-1 min-w-0">
        {/* Search Input */}
        <input
          type="search"
          placeholder="Search title, company, city"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="border border-[#DCE1E8] bg-white rounded-[6px] px-2.5 py-1.5 text-[0.8rem] text-[#15202C] w-full sm:flex-1 lg:min-w-[140px] lg:max-w-[225px] min-w-0 focus:outline-none focus:border-[#9C6B12] focus:ring-1 focus:ring-[#9C6B12] placeholder:text-[#8D9CAE]"
        />

        {/* Vault & Source Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 w-full sm:w-auto shrink-0 min-w-0">
          <select
            value={selectedVault}
            onChange={(e) => onVaultChange(e.target.value)}
            aria-label="Filter by vault"
            className="border border-[#DCE1E8] bg-white rounded-[6px] px-2 py-1.5 text-[0.78rem] sm:text-[0.8rem] text-[#15202C] w-full sm:w-[112px] xl:w-[130px] min-w-0 truncate focus:outline-none focus:border-[#9C6B12] cursor-pointer"
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
            className="border border-[#DCE1E8] bg-white rounded-[6px] px-2 py-1.5 text-[0.78rem] sm:text-[0.8rem] text-[#15202C] w-full sm:w-[110px] xl:w-[118px] min-w-0 truncate focus:outline-none focus:border-[#9C6B12] cursor-pointer"
          >
            <option value="all">All sources</option>
            {SOURCES.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right Side: Status Segmented Tabs + Horizontal Scroll Arrows */}
      <div className="flex items-center justify-between lg:justify-end gap-1.5 w-full lg:w-auto lg:ml-auto min-w-0 shrink-0">
        {/* Status Segmented Tabs */}
        <div className="flex items-center flex-1 sm:flex-initial min-w-0 max-w-full overflow-x-auto no-scrollbar border border-[#DCE1E8] rounded-[6px] bg-white">
          {statusTabs.map((tab) => {
            const isActive = selectedStatus === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onStatusChange(tab.key)}
                className={`flex-1 sm:flex-none whitespace-nowrap px-2 xl:px-2.5 py-1.5 text-[0.74rem] sm:text-[0.76rem] xl:text-[0.8rem] font-semibold transition-colors cursor-pointer select-none border-r border-[#DCE1E8] last:border-r-0 ${
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

        {/* Left / Right Horizontal List Scroll Arrows */}
        <div
          className="inline-flex items-center shrink-0 border border-[#DCE1E8] rounded-[6px] bg-white overflow-hidden"
          role="group"
          aria-label="Scroll job list horizontally"
        >
          <button
            type="button"
            onClick={onScrollLeft}
            disabled={!canScrollLeft}
            aria-label="Scroll list left"
            title="Scroll list left"
            className={`w-7 h-[30px] flex items-center justify-center border-r border-[#DCE1E8] transition-colors ${
              canScrollLeft
                ? "text-[#15202C] bg-white hover:bg-[#F6F7F9] cursor-pointer"
                : "text-[#B0BAC5] bg-[#F8FAFC] cursor-not-allowed"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5 stroke-current fill-none stroke-[2.2]"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 18l-6-6 6-6"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={onScrollRight}
            disabled={!canScrollRight}
            aria-label="Scroll list right"
            title="Scroll list right"
            className={`w-7 h-[30px] flex items-center justify-center transition-colors ${
              canScrollRight
                ? "text-[#15202C] bg-white hover:bg-[#F6F7F9] cursor-pointer"
                : "text-[#B0BAC5] bg-[#F8FAFC] cursor-not-allowed"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5 stroke-current fill-none stroke-[2.2]"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 18l6-6-6-6"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

