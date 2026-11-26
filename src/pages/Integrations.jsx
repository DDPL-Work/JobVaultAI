import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiRefreshCw } from "react-icons/fi";
import IntegrationItem from "../components/integrations/IntegrationItem";
import ErrorFallback from "../components/common/ErrorFallback";
import { IntegrationsSkeleton } from "../components/common/LoadingSkeletons";
import { fetchIntegrations } from "../apis/thunks/settingsThunks";
import { fetchHealthStatus } from "../apis/thunks/dashboardThunks";

function renderExtraPill(label, variant = "neutral") {
  const styles =
    variant === "info"
      ? "bg-[#DCEAF5] text-[#235F8C]"
      : variant === "ok"
      ? "bg-[#DCF0E3] text-[#24734A]"
      : "bg-[#F6F7F9] text-[#5A6777] border border-[#DCE1E8]";

  return (
    <span
      className={`inline-flex items-center text-[0.72rem] font-semibold rounded-full px-2 py-0.5 leading-tight select-none ${styles}`}
    >
      {label}
    </span>
  );
}

function formatSyncTime(value) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleString();
}

export default function Integrations() {
  const dispatch = useDispatch();
  const {
    integrations,
    loadingIntegrations,
    loadedIntegrations,
    integrationsError,
  } = useSelector((state) => state.settings);
  const health = useSelector((state) => state.dashboard?.health);

  useEffect(() => {
    dispatch(fetchIntegrations());
    dispatch(fetchHealthStatus());
  }, [dispatch]);

  const google = integrations?.google || {};
  const drive = google.drive || {};
  const sheets = google.sheets || {};
  const providers = integrations?.providers || {};
  const activeProvider = integrations?.active || "";

  const driveEnabled = Boolean(drive.enabled);
  const sheetsEnabled = Boolean(sheets.enabled);
  const hasGoogleCreds = Boolean(google.credentials);
  const gemini = providers.gemini || {};
  const openai = providers.openai || {};
  const geminiConfigured = Boolean(gemini.configured);
  const openaiConfigured = Boolean(openai.configured);
  const formattedLastSync = formatSyncTime(drive.lastSync);

  return (
    <div className="flex flex-col gap-5">
      {/* Page Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[260px]">
          <span className="text-[0.72rem] font-semibold text-[#5A6777] uppercase tracking-[0.08em] mb-1 block">
            ADMIN
          </span>
          <h1 className="font-['Bricolage_Grotesque',sans-serif] text-[1.65rem] font-bold text-[#15202C] tracking-[-0.01em] leading-tight m-0">
            Integrations
          </h1>
          <p className="mt-1 text-[#5A6777] max-w-[70ch] text-[0.875rem] leading-normal m-0">
            Where screenshots come from and where finished rows go. Connections are set in the server’s .env file.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 shrink-0 ml-auto flex-wrap">
          {health?.ok !== null && (
            <span
              className={`inline-flex items-center gap-1.5 text-[0.74rem] font-semibold rounded-full px-2.5 py-1 select-none ${
                health?.loading
                  ? "bg-[#FBEBCF] text-[#9A5B00]"
                  : health?.ok
                  ? "bg-[#DCF0E3] text-[#24734A]"
                  : "bg-[#F8DEDB] text-[#A8281F]"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  health?.loading
                    ? "bg-[#9A5B00] animate-pulse"
                    : health?.ok
                    ? "bg-[#24734A]"
                    : "bg-[#A8281F]"
                }`}
              />
              <span>
                {health?.loading
                  ? "Checking server..."
                  : health?.ok
                  ? "Server healthy"
                  : "Server offline"}
              </span>
            </span>
          )}
          <button
            type="button"
            disabled={loadingIntegrations || health?.loading}
            onClick={() => {
              dispatch(fetchIntegrations());
              dispatch(fetchHealthStatus());
            }}
            className="inline-flex items-center gap-1.5 border border-[#DCE1E8] bg-white hover:border-[#5A6777] rounded-[6px] px-3 py-1.5 text-[0.8rem] font-semibold text-[#15202C] transition-colors cursor-pointer select-none disabled:opacity-50"
          >
            <FiRefreshCw
              className={`w-3.5 h-3.5 ${
                loadingIntegrations || health?.loading ? "animate-spin" : ""
              }`}
            />
            <span>{loadingIntegrations ? "Refreshing..." : "Refresh status"}</span>
          </button>
        </div>
      </div>

      {/* Active Demo/Mock Banner if active === "mock" */}
      {loadedIntegrations && activeProvider === "mock" && (
        <div className="bg-[#DCEAF5] text-[#15202C] rounded-[6px] p-3 sm:px-3.5 flex items-center justify-between gap-3 flex-wrap text-[0.84rem]">
          <div>
            <b className="text-[#235F8C] font-bold mr-1.5">Active AI mode:</b>
            <span>
              {providers?.mock?.model || "Demo / Mock Data"} is currently selected.
            </span>
          </div>
          <Link
            to="/ai_reading"
            className="border border-[#235F8C]/30 bg-white hover:border-[#235F8C] rounded-[6px] px-2.5 py-1 text-[0.76rem] font-semibold text-[#235F8C] transition-colors"
          >
            Change in AI reading
          </Link>
        </div>
      )}

      {/* Compact Error Banner when cached integrations exist */}
      {integrationsError && loadedIntegrations && (
        <ErrorFallback
          compact
          title="Could not sync integration status"
          message={integrationsError}
          onRetry={() => dispatch(fetchIntegrations())}
          retrying={loadingIntegrations}
        />
      )}

      {/* Main Content */}
      {loadingIntegrations && !loadedIntegrations ? (
        <IntegrationsSkeleton />
      ) : integrationsError && !loadedIntegrations ? (
        <ErrorFallback
          title="Could not load integrations"
          message={integrationsError}
          onRetry={() => dispatch(fetchIntegrations())}
          retrying={loadingIntegrations}
        />
      ) : (
        <div className="bg-white border border-[#DCE1E8] rounded-[8px] overflow-hidden shadow-[0_1px_2px_rgba(21,32,44,0.06)]">
          {/* 1. Google Drive folder */}
          <IntegrationItem
            iconLetter="D"
            iconBg="#1E8E3E"
            title="Google Drive folder"
            statusType={driveEnabled ? "connected" : "not_setup"}
            statusLabel={driveEnabled ? "Connected" : "Not set up"}
            extraPill={
              driveEnabled && drive.pollMinutes
                ? renderExtraPill(`Poll every ${drive.pollMinutes}m`, "neutral")
                : hasGoogleCreds
                ? renderExtraPill("Service account ready", "ok")
                : null
            }
            description={
              driveEnabled
                ? formattedLastSync
                  ? `Watching Drive folder every ${drive.pollMinutes ?? 5} minutes. Last sync: ${formattedLastSync}.`
                  : `Watching Drive folder every ${drive.pollMinutes ?? 5} minutes for new screenshots.`
                : undefined
            }
            steps={
              driveEnabled
                ? undefined
                : [
                    "Create a Google Cloud service account and download its JSON key",
                    "Share your screenshots folder with the service account email",
                    <>
                      Set{" "}
                      <code className="font-mono text-[0.76rem] text-[#15202C]">
                        GOOGLE_SERVICE_ACCOUNT_FILE
                      </code>{" "}
                      and{" "}
                      <code className="font-mono text-[0.76rem] text-[#15202C]">
                        DRIVE_FOLDER_ID
                      </code>{" "}
                      in .env, then restart
                    </>,
                  ]
            }
          />

          {/* 2. Google Sheets */}
          <IntegrationItem
            iconLetter="S"
            iconBg="#188038"
            title="Google Sheets"
            statusType={sheetsEnabled ? "connected" : "not_setup"}
            statusLabel={sheetsEnabled ? "Connected" : "Not set up"}
            extraPill={
              !sheetsEnabled && hasGoogleCreds
                ? renderExtraPill("Service account ready", "ok")
                : null
            }
            description={
              sheetsEnabled
                ? "Finished job rows sync automatically to your connected Google Sheet."
                : undefined
            }
            steps={
              sheetsEnabled
                ? undefined
                : [
                    "Share your sheet with the service account email (Editor)",
                    <>
                      Set{" "}
                      <code className="font-mono text-[0.76rem] text-[#15202C]">
                        GOOGLE_SHEET_ID
                      </code>{" "}
                      in .env, then restart
                    </>,
                  ]
            }
            action={
              sheetsEnabled && sheets.url ? (
                <a
                  href={sheets.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-[#DCE1E8] bg-white hover:border-[#5A6777] rounded-[6px] px-2.5 py-1 text-[0.78rem] font-semibold text-[#15202C] transition-colors inline-block select-none"
                >
                  Open sheet
                </a>
              ) : undefined
            }
          />

          {/* 3. Excel file */}
          <IntegrationItem
            iconLetter="X"
            iconBg="#217346"
            title="Excel file"
            statusType="always_on"
            statusLabel="Always on"
            description="Download from the Job sheet page: one tab for all jobs plus one tab per vault"
            action={
              <Link
                to="/jobs"
                className="border border-[#DCE1E8] bg-white hover:border-[#5A6777] rounded-[6px] px-2.5 py-1 text-[0.78rem] font-semibold text-[#15202C] transition-colors inline-block select-none"
              >
                Job sheet
              </Link>
            }
          />

          {/* 4. Google Gemini */}
          <IntegrationItem
            iconLetter="G"
            iconBg="#4285F4"
            title="Google Gemini"
            statusType={geminiConfigured ? "connected" : "not_setup"}
            statusLabel={geminiConfigured ? "Connected" : "Not set up"}
            extraPill={
              <div className="flex items-center gap-1.5 flex-wrap">
                {activeProvider === "gemini" && renderExtraPill("In use", "info")}
                {gemini.model && renderExtraPill(gemini.model, "neutral")}
              </div>
            }
            description={
              geminiConfigured
                ? `Configured with ${gemini.model || "Gemini"} in server .env to read job screenshots.`
                : "Set GEMINI_API_KEY in .env (get one at aistudio.google.com)"
            }
            action={
              geminiConfigured || activeProvider === "gemini" ? (
                <Link
                  to="/ai_reading"
                  className="border border-[#DCE1E8] bg-white hover:border-[#5A6777] rounded-[6px] px-2.5 py-1 text-[0.78rem] font-semibold text-[#15202C] transition-colors inline-block select-none"
                >
                  AI reading
                </Link>
              ) : undefined
            }
          />

          {/* 5. OpenAI */}
          <IntegrationItem
            iconLetter="O"
            iconBg="#10A37F"
            title="OpenAI"
            statusType={openaiConfigured ? "connected" : "not_setup"}
            statusLabel={openaiConfigured ? "Connected" : "Not set up"}
            extraPill={
              <div className="flex items-center gap-1.5 flex-wrap">
                {activeProvider === "openai" && renderExtraPill("In use", "info")}
                {openai.model && renderExtraPill(openai.model, "neutral")}
              </div>
            }
            description={
              openaiConfigured
                ? `Configured with ${openai.model || "OpenAI"} in server .env to extract fields from screenshots.`
                : "Optional. Set OPENAI_API_KEY in .env"
            }
            action={
              openaiConfigured || activeProvider === "openai" ? (
                <Link
                  to="/ai_reading"
                  className="border border-[#DCE1E8] bg-white hover:border-[#5A6777] rounded-[6px] px-2.5 py-1 text-[0.78rem] font-semibold text-[#15202C] transition-colors inline-block select-none"
                >
                  AI reading
                </Link>
              ) : undefined
            }
            isLast={true}
          />
        </div>
      )}
    </div>
  );
}
