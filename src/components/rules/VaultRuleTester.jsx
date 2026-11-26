export default function VaultRuleTester({
  country,
  onCountryChange,
  workMode,
  onWorkModeChange,
  expMin,
  onExpMinChange,
  computedVault,
  computedVaults,
  testing = false,
}) {
  const vaultsList = Array.isArray(computedVaults)
    ? computedVaults
    : Array.isArray(computedVault)
    ? computedVault
    : computedVault
    ? [computedVault]
    : [];

  const isDualRouted = vaultsList.length > 1;

  return (
    <div className="bg-[#F6F7F9] border border-[#DCE1E8] rounded-[8px] p-4 flex flex-col gap-3.5 shadow-[0_1px_2px_rgba(21,32,44,0.06)] self-start select-none">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-['Bricolage_Grotesque',sans-serif] text-[0.98rem] font-bold text-[#15202C] m-0">
          Test a job
        </h3>
        <div className="flex items-center gap-1.5">
          {testing && (
            <span className="text-[0.66rem] font-medium text-[#5A6777] animate-pulse">
              Checking...
            </span>
          )}
          {isDualRouted && (
            <span className="text-[0.68rem] font-bold bg-[#EAF2FB] border border-[#B5D4F4] text-[#1E568B] px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              ⚡ Dual-Routed
            </span>
          )}
        </div>
      </div>

      {/* Country Field */}
      <div className="flex flex-col gap-1 min-w-0">
        <label
          htmlFor="test-country"
          className="text-[0.82rem] font-semibold text-[#15202C]"
        >
          Country
        </label>
        <input
          id="test-country"
          type="text"
          value={country}
          onChange={(e) => onCountryChange?.(e.target.value)}
          className="border border-[#DCE1E8] bg-white rounded-[6px] px-2.5 py-1 text-[0.84rem] text-[#15202C] h-[34px] focus:outline-none focus:border-[#9C6B12]"
        />
      </div>

      {/* Work Mode Field */}
      <div className="flex flex-col gap-1 min-w-0">
        <label
          htmlFor="test-work-mode"
          className="text-[0.82rem] font-semibold text-[#15202C]"
        >
          Work mode
        </label>
        <select
          id="test-work-mode"
          value={workMode}
          onChange={(e) => onWorkModeChange?.(e.target.value)}
          className="border border-[#DCE1E8] bg-white rounded-[6px] px-2.5 py-1 text-[0.84rem] text-[#15202C] h-[34px] focus:outline-none focus:border-[#9C6B12] cursor-pointer"
        >
          <option value="Onsite">Onsite</option>
          <option value="Hybrid">Hybrid</option>
          <option value="Remote">Remote (Dual-Routed)</option>
        </select>
      </div>

      {/* Minimum Experience Field */}
      <div className="flex flex-col gap-1 min-w-0">
        <label
          htmlFor="test-exp"
          className="text-[0.82rem] font-semibold text-[#15202C]"
        >
          Minimum experience (years)
        </label>
        <input
          id="test-exp"
          type="text"
          inputMode="decimal"
          value={expMin}
          onChange={(e) => onExpMinChange?.(e.target.value)}
          className="border border-[#DCE1E8] bg-white rounded-[6px] px-2.5 py-1 text-[0.84rem] text-[#15202C] font-['IBM_Plex_Mono',monospace] h-[34px] focus:outline-none focus:border-[#9C6B12]"
        />
      </div>

      {/* Result Section with Multi-Badge Support */}
      <div className="pt-1 flex flex-col gap-2">
        <span className="text-[0.7rem] uppercase tracking-[0.08em] font-semibold text-[#5A6777] block">
          {isDualRouted ? "DUAL-ROUTED ACCESS VAULTS" : "GOES TO"}
        </span>

        {/* Dynamic Multi-Badge Pills */}
        <div className="flex flex-col gap-1.5">
          {vaultsList.map((vaultName) => {
            const isRemote = vaultName.toLowerCase().includes("remote");
            const isGlobal = vaultName.toLowerCase().includes("global");
            return (
              <div
                key={vaultName}
                className={`border rounded-[6px] p-[8px_12px] flex items-center justify-between ${
                  isRemote
                    ? "bg-[#EAF2FB] border-[#B5D4F4] text-[#1E568B]"
                    : isGlobal
                    ? "bg-[#F5F0FB] border-[#E1D4F4] text-[#5A2C91]"
                    : "bg-white border-[#DCE1E8] text-[#15202C]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isRemote
                        ? "bg-[#1E568B]"
                        : isGlobal
                        ? "bg-[#5A2C91]"
                        : "bg-[#9C6B12]"
                    }`}
                  />
                  <b className="font-['Bricolage_Grotesque',sans-serif] text-[0.95rem] font-bold">
                    {vaultName}
                  </b>
                </div>
                <span className="text-[0.7rem] font-medium text-[#5A6777] bg-black/5 px-2 py-0.5 rounded">
                  {isRemote
                    ? "Work Mode Pipeline"
                    : isDualRouted
                    ? "Experience Pipeline"
                    : "Primary Vault"}
                </span>
              </div>
            );
          })}
        </div>

        {isDualRouted && (
          <div className="bg-[#FFFDF7] border border-[#F1D196] rounded-[6px] p-2.5 text-[0.74rem] text-[#9A5B00] leading-snug">
            <b>Automated Dual-Routing Active:</b> Candidate will be visible in both the <b>{vaultsList[0]}</b> (work style) and <b>{vaultsList[1]}</b> (experience tier) recruiter pipelines simultaneously.
          </div>
        )}

        <span className="text-[0.72rem] text-[#5A6777]">
          Uses the active dual-routing matrix &amp; experience tiers
        </span>
      </div>
    </div>
  );
}

