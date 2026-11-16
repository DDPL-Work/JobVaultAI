import { useState, useMemo } from "react";
import VaultTierRow from "../components/rules/VaultTierRow";
import VaultRuleTester from "../components/rules/VaultRuleTester";

export default function VaultRules() {
  const [remoteVault, setRemoteVault] = useState("Remote");
  const [globalVault, setGlobalVault] = useState("Global");
  const [homeCountry, setHomeCountry] = useState("India");

  const [tiers, setTiers] = useState([
    { name: "India · Fresher", below: 2 },
    { name: "India · Junior", below: 5 },
    { name: "India · Mid-level", below: 10 },
    { name: "New tier", below: null },
  ]);

  // Tester state
  const [testCountry, setTestCountry] = useState("India");
  const [testMode, setTestMode] = useState("Onsite");
  const [testExp, setTestExp] = useState("4");

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  // Add experience tier
  const handleAddTier = () => {
    setTiers((prev) => {
      const copy = [...prev];
      const last = copy[copy.length - 1];
      const prevBelow = copy.length > 1 ? copy[copy.length - 2].below || 10 : 10;

      // Make old last tier have a below threshold
      if (last) {
        last.below = (prevBelow || 10) + 5;
      }

      copy.push({ name: "New tier", below: null });
      return copy;
    });
  };

  // Remove tier
  const handleRemoveTier = (index) => {
    setTiers((prev) => {
      if (prev.length <= 1) return prev;
      const copy = prev.filter((_, i) => i !== index);
      // Ensure the last tier has below: null
      copy[copy.length - 1].below = null;
      return copy;
    });
  };

  const handleTierNameChange = (index, newName) => {
    setTiers((prev) =>
      prev.map((t, i) => (i === index ? { ...t, name: newName } : t))
    );
  };

  const handleTierBelowChange = (index, newBelow) => {
    setTiers((prev) =>
      prev.map((t, i) => (i === index ? { ...t, below: newBelow } : t))
    );
  };

  // Live classification logic matching prototype
  const computedVault = useMemo(() => {
    if ((testMode || "").toLowerCase() === "remote") {
      return remoteVault;
    }
    const c = (testCountry || "").trim().toLowerCase();
    if (c && c !== (homeCountry || "").trim().toLowerCase()) {
      return globalVault;
    }
    const numExp = parseFloat(testExp);
    if (isNaN(numExp)) {
      return tiers[0]?.name || "Review queue";
    }

    for (let i = 0; i < tiers.length; i++) {
      const t = tiers[i];
      if (t.below == null || t.below === "") {
        return t.name;
      }
      if (numExp < parseFloat(t.below)) {
        return t.name;
      }
    }

    return tiers[tiers.length - 1]?.name || remoteVault;
  }, [testCountry, testMode, testExp, remoteVault, globalVault, homeCountry, tiers]);

  const handleSaveRules = () => {
    showToast("Rules saved · existing jobs re-sorted");
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-60 bg-[#15202C] text-white px-4 py-2.5 rounded-[6px] font-semibold text-[0.85rem] shadow-[0_10px_30px_rgba(21,32,44,0.2)] animate-in fade-in slide-in-from-bottom-2 duration-150 select-none">
          {toastMessage}
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <span className="text-[0.72rem] font-semibold text-[#5A6777] uppercase tracking-[0.08em] mb-1 block">
            ADMIN
          </span>
          <h1 className="font-['Bricolage_Grotesque',sans-serif] text-[1.65rem] font-bold text-[#15202C] tracking-[-0.01em] leading-tight m-0">
            Vault rules
          </h1>
          <p className="mt-1 text-[#5A6777] max-w-[70ch] text-[0.875rem] leading-normal m-0">
            Rules are checked from top to bottom and the first match wins. Saving re-sorts every existing job too.
          </p>
        </div>

        {/* Action Button */}
        <div>
          <button
            type="button"
            onClick={handleSaveRules}
            className="border border-[#9C6B12] bg-[#9C6B12] hover:brightness-105 text-white rounded-[6px] px-3.5 py-1.5 text-[0.85rem] font-semibold transition-all cursor-pointer shadow-sm select-none"
          >
            Save rules
          </button>
        </div>
      </div>

      {/* Grid: Rules Table (Left) + Live Tester (Right) */}
      <div className="grid grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] max-[900px]:grid-cols-1 gap-4 items-start select-none">
        {/* Left Column: How jobs are sorted */}
        <div className="bg-white border border-[#DCE1E8] rounded-[8px] overflow-hidden shadow-[0_1px_2px_rgba(21,32,44,0.06)]">
          <div className="p-3.5 px-4 border-b border-[#DCE1E8]">
            <h2 className="font-['Bricolage_Grotesque',sans-serif] text-[1.08rem] font-bold text-[#15202C] m-0">
              How jobs are sorted
            </h2>
          </div>

          <div className="p-4 flex flex-col">
            {/* Tier 1: Remote */}
            <div className="grid grid-cols-[28px_minmax(0,1.4fr)_minmax(0,1.3fr)_auto] max-[620px]:grid-cols-[24px_minmax(0,1fr)_auto] gap-2.5 items-center py-2.5 border-b border-[#DCE1E8]">
              <span className="font-['IBM_Plex_Mono',monospace] text-[0.74rem] text-[#5A6777] text-center">
                1
              </span>
              <input
                type="text"
                value={remoteVault}
                onChange={(e) => setRemoteVault(e.target.value)}
                aria-label="Remote vault name"
                className="border border-[#DCE1E8] bg-white rounded-[6px] px-2.5 py-1 text-[0.84rem] text-[#15202C] h-[34px] focus:outline-none focus:border-[#9C6B12]"
              />
              <span className="text-[0.82rem] text-[#15202C] whitespace-nowrap max-[620px]:col-span-full max-[620px]:pl-8">
                Work mode is Remote
              </span>
              <span className="w-6" />
            </div>

            {/* Tier 2: Global */}
            <div className="grid grid-cols-[28px_minmax(0,1.4fr)_minmax(0,1.3fr)_auto] max-[620px]:grid-cols-[24px_minmax(0,1fr)_auto] gap-2.5 items-center py-2.5 border-b border-[#DCE1E8]">
              <span className="font-['IBM_Plex_Mono',monospace] text-[0.74rem] text-[#5A6777] text-center">
                2
              </span>
              <input
                type="text"
                value={globalVault}
                onChange={(e) => setGlobalVault(e.target.value)}
                aria-label="Global vault name"
                className="border border-[#DCE1E8] bg-white rounded-[6px] px-2.5 py-1 text-[0.84rem] text-[#15202C] h-[34px] focus:outline-none focus:border-[#9C6B12]"
              />
              <div className="flex items-center gap-1.5 text-[0.82rem] text-[#15202C] whitespace-nowrap max-[620px]:col-span-full max-[620px]:pl-8">
                <span>Country is not</span>
                <input
                  type="text"
                  value={homeCountry}
                  onChange={(e) => setHomeCountry(e.target.value)}
                  aria-label="Home country"
                  className="w-[100px] border border-[#DCE1E8] bg-white rounded-[6px] px-2 py-1 text-[0.84rem] text-[#15202C] h-[34px] focus:outline-none focus:border-[#9C6B12]"
                />
              </div>
              <span className="w-6" />
            </div>

            {/* Dynamic Tiers */}
            {tiers.map((tier, i) => (
              <VaultTierRow
                key={i}
                tier={tier}
                index={i}
                totalTiers={tiers.length}
                isLast={i === tiers.length - 1}
                onNameChange={(name) => handleTierNameChange(i, name)}
                onBelowChange={(below) => handleTierBelowChange(i, below)}
                onDelete={() => handleRemoveTier(i)}
              />
            ))}

            {/* Add Experience Tier Button */}
            <div className="flex items-center gap-2 mt-3.5 flex-wrap">
              <button
                type="button"
                onClick={handleAddTier}
                className="border border-[#DCE1E8] bg-white hover:bg-[#F6F7F9] text-[#15202C] text-[0.78rem] font-semibold px-2.5 py-1 rounded-[6px] transition-colors cursor-pointer"
              >
                Add experience tier
              </button>
              <span className="text-[0.75rem] text-[#5A6777]">
                The last tier catches everything else in {homeCountry}. Jobs with unknown experience go to review.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Tester Card */}
        <VaultRuleTester
          country={testCountry}
          onCountryChange={setTestCountry}
          workMode={testMode}
          onWorkModeChange={setTestMode}
          expMin={testExp}
          onExpMinChange={setTestExp}
          computedVault={computedVault}
        />
      </div>
    </div>
  );
}

