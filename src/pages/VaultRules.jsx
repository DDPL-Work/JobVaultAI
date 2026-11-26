import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import VaultTierRow from "../components/rules/VaultTierRow";
import VaultRuleTester from "../components/rules/VaultRuleTester";
import ErrorFallback from "../components/common/ErrorFallback";
import { VaultRulesSkeleton } from "../components/common/LoadingSkeletons";
import { computeDualVaults } from "../components/jobs/jobsData";
import {
  fetchSettings,
  saveVaultRules,
  testVaultRule,
} from "../apis/thunks/settingsThunks";
import { fetchVaults } from "../apis/thunks/vaultsThunks";
import { fetchJobs } from "../apis/thunks/jobsThunks";

export default function VaultRules() {
  const dispatch = useDispatch();
  const {
    rules: savedRules,
    loading,
    loaded,
    savingRules,
    testingRule,
    testResultVaults,
    error,
  } = useSelector((state) => state.settings);

  const [remoteVault, setRemoteVault] = useState("");
  const [globalVault, setGlobalVault] = useState("");
  const [homeCountry, setHomeCountry] = useState("");
  const [tiers, setTiers] = useState([]);

  // Tester state
  const [testCountry, setTestCountry] = useState("India");
  const [testMode, setTestMode] = useState("Onsite");
  const [testExp, setTestExp] = useState("4");

  // Load live rules from GET /api/settings/
  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  // Sync Redux savedRules into local editable form state when loaded/saved
  useEffect(() => {
    if (!loaded && (!savedRules?.tiers || savedRules.tiers.length === 0)) return;
    setRemoteVault(savedRules.remoteVault || "");
    setGlobalVault(savedRules.globalVault || "");
    setHomeCountry(savedRules.homeCountry || "");
    setTiers(
      Array.isArray(savedRules.tiers)
        ? savedRules.tiers.map((t) => ({
            name: t.name || "",
            below: t.below ?? null,
          }))
        : []
    );
  }, [savedRules, loaded]);

  // Detect whether user has unsaved local edits in rules
  const hasUnsavedChanges = useMemo(() => {
    if (!loaded) return false;
    return (
      remoteVault !== (savedRules.remoteVault || "") ||
      globalVault !== (savedRules.globalVault || "") ||
      homeCountry !== (savedRules.homeCountry || "") ||
      JSON.stringify(tiers.map((t) => ({ name: t.name, below: t.below ?? null }))) !==
        JSON.stringify(
          (savedRules.tiers || []).map((t) => ({
            name: t.name,
            below: t.below ?? null,
          }))
        )
    );
  }, [loaded, remoteVault, globalVault, homeCountry, tiers, savedRules]);

  // Debounced live backend rule test (POST /api/rules/test/) when rules are synced
  useEffect(() => {
    if (!loaded || hasUnsavedChanges) return;
    const timer = setTimeout(() => {
      dispatch(
        testVaultRule({
          country: testCountry,
          work_mode: testMode,
          exp_min: testExp,
          homeCountry,
          remoteVault,
          globalVault,
          tiers,
        })
      );
    }, 250);
    return () => clearTimeout(timer);
  }, [
    dispatch,
    loaded,
    hasUnsavedChanges,
    testCountry,
    testMode,
    testExp,
    homeCountry,
    remoteVault,
    globalVault,
    tiers,
  ]);

  // Add experience tier
  const handleAddTier = () => {
    setTiers((prev) => {
      const copy = prev.map((t) => ({ ...t }));
      const last = copy[copy.length - 1];
      const prevBelow = copy.length > 1 ? Number(copy[copy.length - 2]?.below) || 10 : 10;

      if (last && (last.below === null || last.below === undefined || last.below === "")) {
        last.below = prevBelow + 5;
      }

      copy.push({ name: "New tier", below: null });
      return copy;
    });
  };

  // Remove tier
  const handleRemoveTier = (index) => {
    setTiers((prev) => {
      if (prev.length <= 1) return prev;
      const copy = prev.filter((_, i) => i !== index).map((t) => ({ ...t }));
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

  // Client-side Dual-Routing calculation (used for unsaved drafts + offline fallback)
  const localComputedVaults = useMemo(() => {
    return computeDualVaults({
      country: testCountry,
      workMode: testMode,
      expMin: testExp,
      tiers,
      remoteVault,
      globalVault,
      homeCountry,
    });
  }, [testCountry, testMode, testExp, remoteVault, globalVault, homeCountry, tiers]);

  const displayedVaults =
    !hasUnsavedChanges && Array.isArray(testResultVaults) && testResultVaults.length > 0
      ? testResultVaults
      : localComputedVaults;

  const handleSaveRules = async () => {
    if (!homeCountry.trim() || !remoteVault.trim() || !globalVault.trim()) {
      toast.warning("Home country, remote vault, and global vault names are required");
      return;
    }

    try {
      await dispatch(
        saveVaultRules({
          homeCountry,
          remoteVault,
          globalVault,
          tiers,
        })
      ).unwrap();
      toast.success("Rules saved · existing jobs re-sorted");
      dispatch(fetchSettings());
      dispatch(fetchVaults());
      dispatch(fetchJobs());
    } catch (err) {
      toast.error(
        (typeof err === "string" ? err : err?.message) ||
          "Failed to save vault rules"
      );
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
            Vault rules
          </h1>
          <p className="mt-1 text-[#5A6777] max-w-[65ch] text-[0.875rem] leading-normal m-0">
            Rules are checked from top to bottom and the first match wins. Saving re-sorts every existing job too.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-2.5 shrink-0 ml-auto">
          <button
            type="button"
            disabled={savingRules || (loading && !loaded)}
            onClick={handleSaveRules}
            className="border border-[#9C6B12] bg-[#9C6B12] hover:brightness-105 text-white rounded-[6px] px-3.5 py-1.5 text-[0.85rem] font-semibold transition-all cursor-pointer shadow-sm select-none disabled:opacity-50"
          >
            {savingRules ? "Saving rules..." : "Save rules"}
          </button>
        </div>
      </div>

      {/* Cross-Vault Dual-Routing Architecture Matrix Banner */}
      <div className="bg-[#F4F8FC] border border-[#C6DCF1] rounded-[8px] p-3.5 px-4 flex items-start gap-3 select-none">
        <div className="w-8 h-8 rounded-full bg-[#E0EDF8] text-[#1E568B] flex items-center justify-center font-bold text-[0.95rem] shrink-0 mt-0.5">
          ⚡
        </div>
        <div className="text-[0.82rem] text-[#1E568B] flex flex-col gap-1">
          <b className="font-bold text-[0.88rem] text-[#15202C]">
            Cross-Vault Dual-Routing Architecture Active
          </b>
          <span className="leading-relaxed">
            In recruitment workflows, candidates search both by <b>work style</b> (e.g. {remoteVault || "Remote"}) and by <b>seniority tier</b>. When a job is marked as <b>Remote</b>, it is automatically routed to the <b>{remoteVault || "Remote"}</b> vault <i>AND</i> placed into its matching experience tier simultaneously.
          </span>
        </div>
      </div>

      {/* Graceful Error Banner if rules fetch failed */}
      {error && loaded && (
        <ErrorFallback
          compact
          title="Could not sync vault rules"
          message={error}
          onRetry={() => dispatch(fetchSettings())}
          retrying={loading}
        />
      )}

      {/* Main Content: Skeleton / Error Fallback / Rules Editor + Live Tester */}
      {loading && !loaded ? (
        <VaultRulesSkeleton />
      ) : error && !loaded ? (
        <ErrorFallback
          title="Could not load vault rules"
          message={error}
          onRetry={() => dispatch(fetchSettings())}
          retrying={loading}
        />
      ) : (
        <div className="grid grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] max-[900px]:grid-cols-1 gap-4 items-start select-none">
          {/* Left Column: How jobs are sorted */}
          <div className="bg-white border border-[#DCE1E8] rounded-[8px] overflow-hidden shadow-[0_1px_2px_rgba(21,32,44,0.06)]">
            <div className="p-3.5 px-4 border-b border-[#DCE1E8] flex items-center justify-between gap-2">
              <h2 className="font-['Bricolage_Grotesque',sans-serif] text-[1.08rem] font-bold text-[#15202C] m-0">
                How jobs are sorted
              </h2>
              {hasUnsavedChanges && (
                <span className="text-[0.7rem] font-semibold bg-[#FBEBCF] text-[#9A5B00] px-2 py-0.5 rounded-full">
                  Unsaved changes
                </span>
              )}
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
                  The last tier catches everything else in {homeCountry || "your home country"}. Jobs with unknown experience go to review.
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
            computedVaults={displayedVaults}
            testing={testingRule}
          />
        </div>
      )}
    </div>
  );
}
