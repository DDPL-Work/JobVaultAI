export default function VaultRuleTester({
  country,
  onCountryChange,
  workMode,
  onWorkModeChange,
  expMin,
  onExpMinChange,
  computedVault,
}) {
  return (
    <div className="bg-[#F6F7F9] border border-[#DCE1E8] rounded-[8px] p-4 flex flex-col gap-3.5 shadow-[0_1px_2px_rgba(21,32,44,0.06)] self-start select-none">
      <h3 className="font-['Bricolage_Grotesque',sans-serif] text-[0.98rem] font-bold text-[#15202C] m-0">
        Test a job
      </h3>

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
          <option value="Remote">Remote</option>
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

      {/* Result Section */}
      <div className="pt-1">
        <span className="text-[0.7rem] uppercase tracking-[0.08em] font-semibold text-[#5A6777] block">
          GOES TO
        </span>
        <div className="font-['Bricolage_Grotesque',sans-serif] text-[1.25rem] font-bold text-[#9C6B12] mt-0.5 leading-snug">
          {computedVault}
        </div>
        <span className="text-[0.75rem] text-[#5A6777] mt-0.5 block">
          Uses the saved rules
        </span>
      </div>
    </div>
  );
}

