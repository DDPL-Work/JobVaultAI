import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Sidebar from "./sidebar/Sidebar";
import {
  fetchDashboardStats,
  fetchHealthStatus,
} from "../apis/thunks/dashboardThunks";

/**
 * Main application Layout wrapping the Sidebar and page outlet
 */
export default function Layout() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchHealthStatus());
  }, [dispatch]);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("jobvault_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("jobvault_theme") || "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    const isDark = theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("jobvault_theme", theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("jobvault_sidebar_collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    toast.dismiss("theme-toggle");
    toast.info(
      nextTheme === "dark" ? "Switched to Dark Mode 🌙" : "Switched to Light Mode ☀️",
      { toastId: "theme-toggle" }
    );
  };

  return (
    <div
      className={`min-h-screen bg-[#F1F3F6] text-[#15202C] font-['Instrument_Sans',sans-serif] grid grid-cols-1 transition-[grid-template-columns] duration-300 ease-in-out ${
        collapsed
          ? "min-[901px]:grid-cols-[72px_minmax(0,1fr)]"
          : "min-[901px]:grid-cols-[236px_minmax(0,1fr)]"
      }`}
    >
      <Sidebar
        isCollapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        isDark={theme === "dark"}
        onToggleTheme={toggleTheme}
      />
      <main className="min-w-0 pt-4 pb-5 px-4 sm:px-3 transition-all duration-300">
        <div className="max-w-[1240px] mx-auto flex flex-col gap-5">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
