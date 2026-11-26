import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { PROVIDERS } from "../components/ai/aiData";
import AiServiceCard from "../components/ai/AiServiceCard";
import AiChecksPanel from "../components/ai/AiChecksPanel";
import AiInstructionsPanel from "../components/ai/AiInstructionsPanel";
import ErrorFallback from "../components/common/ErrorFallback";
import { AiReadingSkeleton } from "../components/common/LoadingSkeletons";
import { fetchSettings, saveAiSettings } from "../apis/thunks/settingsThunks";
import { fetchDashboardStats } from "../apis/thunks/dashboardThunks";

export default function AiReading() {
  const dispatch = useDispatch();
  const {
    ai: savedAi,
    providers: liveProviders,
    prompt: livePrompt,
    loading,
    loaded,
    savingAi,
    error,
  } = useSelector((state) => state.settings);

  const [settings, setSettings] = useState({
    provider: "",
    threshold: 80,
    strict: true,
    dedupe: true,
    dedupeDays: 30,
    extraInstructions: "",
  });

  // Load live AI settings, providers, and system prompt from GET /api/settings/
  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  // Sync Redux savedAi into editable local form state
  useEffect(() => {
    if (savedAi && typeof savedAi === "object") {
      setSettings({
        provider: savedAi.provider || "openai",
        threshold: Number(savedAi.threshold ?? 80),
        strict: Boolean(savedAi.strict ?? true),
        dedupe: Boolean(savedAi.dedupe ?? true),
        dedupeDays: Number(savedAi.dedupeDays ?? 30),
        extraInstructions: savedAi.extraInstructions ?? "",
      });
    }
  }, [savedAi]);

  const dynamicProviders = useMemo(() => {
    return PROVIDERS.map((p) => {
      const live = liveProviders?.[p.id];
      return live
        ? {
            ...p,
            configured: Boolean(live.configured),
            model: live.model || p.model,
          }
        : p;
    });
  }, [liveProviders]);

  const hasUnsavedChanges = useMemo(() => {
    if (!loaded || !savedAi) return false;
    return (
      settings.provider !== (savedAi.provider || "") ||
      Number(settings.threshold) !== Number(savedAi.threshold ?? 80) ||
      Boolean(settings.strict) !== Boolean(savedAi.strict ?? true) ||
      Boolean(settings.dedupe) !== Boolean(savedAi.dedupe ?? true) ||
      Number(settings.dedupeDays) !== Number(savedAi.dedupeDays ?? 30) ||
      (settings.extraInstructions ?? "") !== (savedAi.extraInstructions ?? "")
    );
  }, [loaded, savedAi, settings]);

  const handleProviderSelect = (providerId) => {
    setSettings((prev) => ({ ...prev, provider: providerId }));
  };

  const handleThresholdChange = (threshold) => {
    setSettings((prev) => ({ ...prev, threshold }));
  };

  const handleStrictChange = (strict) => {
    setSettings((prev) => ({ ...prev, strict }));
  };

  const handleDedupeChange = (dedupe) => {
    setSettings((prev) => ({ ...prev, dedupe }));
  };

  const handleDedupeDaysChange = (dedupeDays) => {
    setSettings((prev) => ({ ...prev, dedupeDays }));
  };

  const handleExtraInstructionsChange = (extraInstructions) => {
    setSettings((prev) => ({ ...prev, extraInstructions }));
  };

  const handleSaveSettings = async () => {
    try {
      await dispatch(saveAiSettings(settings)).unwrap();
      toast.success("AI settings saved");
      dispatch(fetchSettings());
      dispatch(fetchDashboardStats());
    } catch (err) {
      toast.error(
        (typeof err === "string" ? err : err?.message) ||
          "Failed to save AI settings"
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
            AI reading
          </h1>
          <p className="mt-1 text-[#5A6777] max-w-[65ch] text-[0.875rem] leading-normal m-0">
            How screenshots are read. These checks are what stop the wrong or made-up values you get when pasting screenshots into ChatGPT.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-2.5 shrink-0 ml-auto">
          {hasUnsavedChanges && (
            <span className="text-[0.72rem] font-semibold bg-[#FBEBCF] text-[#9A5B00] px-2.5 py-1 rounded-full">
              Unsaved changes
            </span>
          )}
          <button
            type="button"
            disabled={savingAi || (loading && !loaded)}
            onClick={handleSaveSettings}
            className="border border-[#9C6B12] bg-[#9C6B12] hover:brightness-105 text-white rounded-[6px] px-3.5 py-1.5 text-[0.85rem] font-semibold transition-all cursor-pointer shadow-sm select-none disabled:opacity-50"
          >
            {savingAi ? "Saving..." : "Save settings"}
          </button>
        </div>
      </div>

      {/* Info Banner: How it avoids made-up values */}
      <div className="bg-[#DCEAF5] text-[#15202C] rounded-[6px] p-3 sm:px-3.5 sm:py-3 flex flex-col sm:flex-row items-start gap-2.5 sm:gap-3 text-[0.85rem] leading-relaxed select-none">
        <b className="text-[#235F8C] font-bold whitespace-nowrap shrink-0">
          How it avoids made-up values
        </b>
        <span className="text-[#15202C]">
          The AI first writes out all the text it can see in the screenshot, then fills the fields. Every value it fills must appear word for word in that text. Anything that doesn't is cleared, and the job goes to the review queue instead of your sheet.
        </span>
      </div>

      {/* Graceful Error Banner when cached settings exist */}
      {error && loaded && (
        <ErrorFallback
          compact
          title="Could not sync AI settings"
          message={error}
          onRetry={() => dispatch(fetchSettings())}
          retrying={loading}
        />
      )}

      {/* Main Content */}
      {loading && !loaded ? (
        <AiReadingSkeleton />
      ) : error && !loaded ? (
        <ErrorFallback
          title="Could not load AI reading settings"
          message={error}
          onRetry={() => dispatch(fetchSettings())}
          retrying={loading}
        />
      ) : (
        <>
          {/* Grid: AI service (Left) + Checks (Right) */}
          <div className="grid grid-cols-2 max-[900px]:grid-cols-1 gap-4 items-stretch">
            {/* Left: AI service Panel */}
            <div className="bg-white border border-[#DCE1E8] rounded-[8px] overflow-hidden shadow-[0_1px_2px_rgba(21,32,44,0.06)] flex flex-col h-full">
              <div className="p-3.5 px-4 border-b border-[#DCE1E8]">
                <h2 className="font-['Bricolage_Grotesque',sans-serif] text-[1.08rem] font-bold text-[#15202C] m-0">
                  AI service
                </h2>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div className="flex flex-col gap-2.5">
                  {dynamicProviders.map((provider) => (
                    <AiServiceCard
                      key={provider.id}
                      provider={provider}
                      selected={settings.provider === provider.id}
                      onSelect={handleProviderSelect}
                    />
                  ))}
                </div>

                <div className="pt-3 border-t border-[#DCE1E8]/80 flex flex-col gap-1.5 text-[0.78rem] text-[#5A6777]">
                  <div className="flex items-center justify-between gap-2">
                    <span>Extraction mode</span>
                    <span className="font-medium text-[#15202C]">
                      Text-grounded OCR verification
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span>API key status</span>
                    <span
                      className={`inline-flex items-center gap-1.5 font-semibold ${
                        dynamicProviders[0]?.configured
                          ? "text-[#24734A]"
                          : "text-[#9A5B00]"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          dynamicProviders[0]?.configured
                            ? "bg-[#24734A]"
                            : "bg-[#9A5B00]"
                        }`}
                      />
                      {dynamicProviders[0]?.configured
                        ? "Configured in server .env"
                        : "Key missing in server .env"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Checks Panel */}
            <AiChecksPanel
              threshold={settings.threshold}
              onThresholdChange={handleThresholdChange}
              strict={settings.strict}
              onStrictChange={handleStrictChange}
              dedupe={settings.dedupe}
              onDedupeChange={handleDedupeChange}
              dedupeDays={settings.dedupeDays}
              onDedupeDaysChange={handleDedupeDaysChange}
            />
          </div>

          {/* Bottom: Extra instructions panel */}
          <AiInstructionsPanel
            extraInstructions={settings.extraInstructions}
            onExtraInstructionsChange={handleExtraInstructionsChange}
            systemPrompt={livePrompt}
          />
        </>
      )}
    </div>
  );
}
