import { useState } from "react";
import { PROVIDERS, INITIAL_AI_SETTINGS } from "../components/ai/aiData";
import AiServiceCard from "../components/ai/AiServiceCard";
import AiChecksPanel from "../components/ai/AiChecksPanel";
import AiInstructionsPanel from "../components/ai/AiInstructionsPanel";

export default function AiReading() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("jobvault_ai_settings");
      if (saved) {
        return { ...INITIAL_AI_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // fallback to initial
    }
    return INITIAL_AI_SETTINGS;
  });

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

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

  const handleSaveSettings = () => {
    try {
      localStorage.setItem("jobvault_ai_settings", JSON.stringify(settings));
    } catch {
      // ignore
    }
    showToast("AI settings saved");
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
            AI reading
          </h1>
          <p className="mt-1 text-[#5A6777] max-w-[70ch] text-[0.875rem] leading-normal m-0">
            How screenshots are read. These checks are what stop the wrong or made-up values you get when pasting screenshots into ChatGPT or Gemini.
          </p>
        </div>

        {/* Action Button */}
        <div>
          <button
            type="button"
            onClick={handleSaveSettings}
            className="border border-[#9C6B12] bg-[#9C6B12] hover:brightness-105 text-white rounded-[6px] px-3.5 py-1.5 text-[0.85rem] font-semibold transition-all cursor-pointer shadow-sm select-none"
          >
            Save settings
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

      {/* Grid: AI service (Left) + Checks (Right) */}
      <div className="grid grid-cols-2 max-[900px]:grid-cols-1 gap-4 items-start">
        {/* Left: AI service Panel */}
        <div className="bg-white border border-[#DCE1E8] rounded-[8px] overflow-hidden shadow-[0_1px_2px_rgba(21,32,44,0.06)] flex flex-col">
          <div className="p-3.5 px-4 border-b border-[#DCE1E8]">
            <h2 className="font-['Bricolage_Grotesque',sans-serif] text-[1.08rem] font-bold text-[#15202C] m-0">
              AI service
            </h2>
          </div>
          <div className="p-4 flex flex-col gap-2.5">
            {PROVIDERS.map((provider) => (
              <AiServiceCard
                key={provider.id}
                provider={provider}
                selected={settings.provider === provider.id}
                onSelect={handleProviderSelect}
              />
            ))}
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
      />
    </div>
  );
}

