import { createBrowserRouter } from "react-router-dom";
import Layout from "../layout/Layout";
import Dashboard from "../pages/Dashboard";

const renderPlaceholder = (title, description) => (
  <div className="flex flex-col gap-5">
    <div>
      <h1 className="font-['Bricolage_Grotesque',sans-serif] text-[1.65rem] font-bold text-[#15202C] tracking-[-0.01em] leading-tight m-0">
        {title}
      </h1>
      <p className="mt-1 text-[#5A6777] max-w-[70ch] text-[0.875rem] leading-normal m-0">
        {description}
      </p>
    </div>
    <div className="bg-white border border-[#DCE1E8] rounded-[8px] p-8 text-center flex flex-col items-center justify-center gap-2 min-h-[300px]">
      <span className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[1.1rem] text-[#15202C]">
        {title} Module
      </span>
      <span className="text-[#5A6777] text-[0.85rem] max-w-md">
        This section is connected to the sidebar navigation and layout shell.
      </span>
    </div>
  </div>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "inbox",
        element: renderPlaceholder(
          "Screenshots",
          "Add as many screenshots as you like. Each one is read on its own, so there is no 10–20 image limit."
        ),
      },
      {
        path: "jobs",
        element: renderPlaceholder(
          "Job sheet",
          "Every job that was read from your screenshots. Filter, search, and export to Excel."
        ),
      },
      {
        path: "vaults",
        element: renderPlaceholder(
          "Vaults",
          "Each vault is a tab in the Excel file and in Google Sheets. Change how jobs are sorted in Vault rules."
        ),
      },
      {
        path: "review",
        element: renderPlaceholder(
          "Review queue",
          "The AI could not read these clearly, so it left the unclear fields empty instead of guessing."
        ),
      },
      {
        path: "rules",
        element: renderPlaceholder(
          "Vault rules",
          "Rules are checked from top to bottom and the first match wins. Saving re-sorts every existing job too."
        ),
      },
      {
        path: "columns",
        element: renderPlaceholder(
          "Sheet columns",
          "The columns in your Excel file and Google Sheet, in this order. A job missing a required field goes to review."
        ),
      },
      {
        path: "ai",
        element: renderPlaceholder(
          "AI reading",
          "How screenshots are read. These checks are what stop the wrong or made-up values."
        ),
      },
      {
        path: "integrations",
        element: renderPlaceholder(
          "Integrations",
          "Where screenshots come from and where finished rows go. Connections are set in the server's .env file."
        ),
      },
      {
        path: "activity",
        element: renderPlaceholder(
          "Activity log",
          "Everything the system did, newest first."
        ),
      },
      {
        path: "*",
        element: <Dashboard />,
      },
    ],
  },
]);
