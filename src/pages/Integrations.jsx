import React from "react";
import { Link } from "react-router-dom";
import IntegrationItem from "../components/integrations/IntegrationItem";

export default function Integrations() {
  return (
    <div className="flex flex-col gap-5">
      {/* Page Header */}
      <div>
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

      {/* Integrations List Panel */}
      <div className="bg-white border border-[#DCE1E8] rounded-[8px] overflow-hidden shadow-[0_1px_2px_rgba(21,32,44,0.06)]">
        {/* 1. Google Drive folder */}
        <IntegrationItem
          iconLetter="D"
          iconBg="#1E8E3E"
          title="Google Drive folder"
          statusType="not_setup"
          statusLabel="Not set up"
          steps={[
            "Create a Google Cloud service account and download its JSON key",
            "Share your screenshots folder with the service account email",
            <>
              Set <code className="font-mono text-[0.76rem] text-[#15202C]">GOOGLE_SERVICE_ACCOUNT_FILE</code> and{" "}
              <code className="font-mono text-[0.76rem] text-[#15202C]">DRIVE_FOLDER_ID</code> in .env, then restart
            </>,
          ]}
        />

        {/* 2. Google Sheets */}
        <IntegrationItem
          iconLetter="S"
          iconBg="#188038"
          title="Google Sheets"
          statusType="not_setup"
          statusLabel="Not set up"
          steps={[
            "Share your sheet with the service account email (Editor)",
            <>
              Set <code className="font-mono text-[0.76rem] text-[#15202C]">GOOGLE_SHEET_ID</code> in .env, then restart
            </>,
          ]}
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
          statusType="not_setup"
          statusLabel="Not set up"
          description="Set GEMINI_API_KEY in .env (get one at aistudio.google.com)"
        />

        {/* 5. OpenAI */}
        <IntegrationItem
          iconLetter="O"
          iconBg="#10A37F"
          title="OpenAI"
          statusType="not_setup"
          statusLabel="Not set up"
          description="Optional. Set OPENAI_API_KEY in .env"
          isLast={true}
        />
      </div>
    </div>
  );
}

