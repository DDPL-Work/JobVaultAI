export default function VaultTierRow({
  tier,
  index,
  totalTiers,
  isLast,
  onNameChange,
  onBelowChange,
  onDelete,
}) {
  return (
    <div className="grid grid-cols-[28px_minmax(0,1.4fr)_minmax(0,1.3fr)_auto] max-[620px]:grid-cols-[24px_minmax(0,1fr)_auto] gap-2.5 items-center py-2.5 border-b border-[#DCE1E8] last:border-b-0">
      {/* Order Number */}
      <span className="font-['IBM_Plex_Mono',monospace] text-[0.74rem] text-[#5A6777] text-center">
        {index + 3}
      </span>

      {/* Vault Name Input */}
      <input
        type="text"
        value={tier.name}
        onChange={(e) => onNameChange?.(e.target.value)}
        aria-label="Vault name"
        className="border border-[#DCE1E8] bg-white rounded-[6px] px-2.5 py-1 text-[0.84rem] text-[#15202C] h-[34px] focus:outline-none focus:border-[#9C6B12]"
      />

      {/* Condition */}
      <div className="flex items-center gap-1.5 text-[0.82rem] text-[#15202C] whitespace-nowrap max-[620px]:col-span-full max-[620px]:pl-8">
        {isLast ? (
          <span className="text-[#5A6777]">Everything else</span>
        ) : (
          <>
            <span className="text-[#15202C]">Experience below</span>
            <input
              type="text"
              inputMode="decimal"
              value={tier.below ?? ""}
              onChange={(e) => onBelowChange?.(e.target.value)}
              aria-label="Years"
              className="w-[60px] border border-[#DCE1E8] bg-white rounded-[6px] px-2 py-1 text-[0.84rem] text-[#15202C] h-[34px] font-['IBM_Plex_Mono',monospace] focus:outline-none focus:border-[#9C6B12]"
            />
            <span className="text-[#15202C]">yrs</span>
          </>
        )}
      </div>

      {/* Delete button */}
      <div>
        {totalTiers > 1 && (
          <button
            type="button"
            onClick={onDelete}
            className="w-6 h-6 rounded-[4px] text-[#A8281F] hover:bg-[#F8DEDB] grid place-items-center transition-colors text-[0.8rem] cursor-pointer"
            title="Remove tier"
            aria-label="Remove tier"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

