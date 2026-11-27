import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "../layout/Layout";
import Dashboard from "../pages/Dashboard";
import Screenshots from "../pages/Screenshots";
import JobSheet from "../pages/JobSheet";
import Vaults from "../pages/Vaults";
import ReviewQueue from "../pages/ReviewQueue";
import VaultRules from "../pages/VaultRules";
import SheetColumns from "../pages/SheetColumns";
import AiReading from "../pages/AiReading";
import Integrations from "../pages/Integrations";
import ActivityLog from "../pages/ActivityLog";
import Login from "../pages/Login";

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
  // Home route: Login page
  {
    path: "/",
    element: <Login />,
  },

  // Login route directly renders Login
  {
    path: "/login",
    element: <Login />,
  },

  // Production Auth Suite: 3-Step Password Reset
  {
    path: "/forgot-password",
    element: <Login initialMode="forgot" />,
  },
  {
    path: "/verify-otp",
    element: <Login initialMode="otp" />,
  },
  {
    path: "/reset-password",
    element: <Login initialMode="reset" />,
  },

  // Application Layout
  {
    element: <Layout />,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "inbox",
        element: <Screenshots />,
      },
      {
        path: "screenshots",
        element: <Navigate to="/inbox" replace />,
      },
      {
        path: "jobs",
        element: <JobSheet />,
      },
      {
        path: "vaults",
        element: <Vaults />,
      },
      {
        path: "review",
        element: <ReviewQueue />,
      },
      {
        path: "rules",
        element: <VaultRules />,
      },
      {
        path: "columns",
        element: <SheetColumns />,
      },
      // {
      //   path: "ai_reading",
      //   element: <AiReading />,
      // },
      {
        path: "ai",
        element: <Navigate to="/ai_reading" replace />,
      },
      // {
      //   path: "integrations",
      //   element: <Integrations />,
      // },
      {
        path: "activity",
        element: <ActivityLog />,
      },
    ],
  },

  // Invalid routes redirect to Home
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
