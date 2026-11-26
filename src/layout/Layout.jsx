import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { FiMenu, FiSun, FiMoon } from "react-icons/fi";
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
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= 900 : false
  );

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchHealthStatus());
  }, [dispatch]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 900px)");
    const handleChange = (e) => {
      setIsMobile(e.matches);
      if (!e.matches) setMobileOpen(false);
    };
    setIsMobile(media.matches);
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    const prevOverflow = document.body.style.overflow;
    if (isMobile) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileOpen, isMobile]);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return sessionStorage.getItem("jobvault_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const [theme, setTheme] = useState(() => {
    try {
      return sessionStorage.getItem("jobvault_theme") || "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    const isDark = theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.setAttribute("data-theme", theme);
    try {
      sessionStorage.setItem("jobvault_theme", theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        sessionStorage.setItem("jobvault_sidebar_collapsed", String(next));
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
      nextTheme === "dark" ? "Switched to Dark Mode" : "Switched to Light Mode",
      { toastId: "theme-toggle" }
    );
  };

  return (
    <div
      className={`min-h-screen w-full overflow-x-clip bg-[#F1F3F6] text-[#15202C] font-['Instrument_Sans',sans-serif] grid grid-cols-1 transition-[grid-template-columns] duration-300 ease-in-out ${
        collapsed
          ? "min-[901px]:grid-cols-[72px_minmax(0,1fr)]"
          : "min-[901px]:grid-cols-[236px_minmax(0,1fr)]"
      }`}
    >
      <Sidebar
        isCollapsed={isMobile ? false : collapsed}
        onToggleCollapse={toggleCollapse}
        isDark={theme === "dark"}
        onToggleTheme={toggleTheme}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="min-[901px]:hidden fixed inset-0 z-40 bg-[#0A0F14]/55 backdrop-blur-[2px] transition-opacity duration-200"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Top Header Bar (hidden on Desktop) */}
      <div className="min-w-0 flex flex-col">
        <header className="min-[901px]:hidden sticky top-0 z-30 bg-[#15202C] text-white border-b border-[#26333F] px-3.5 py-2.5 flex items-center justify-between gap-3 select-none shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              className="w-9 h-9 rounded-[7px] bg-[#1E2936] hover:bg-[#26333F] border border-[#26333F] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <FiMenu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-[30px] h-[30px] rounded-[7px] bg-[#9C6B12] text-white grid place-items-center font-['Bricolage_Grotesque',sans-serif] font-bold text-[0.88rem] shrink-0">
                JV
              </div>
              <div className="min-w-0">
                <b className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[0.98rem] text-white tracking-[-0.01em] leading-tight block truncate">
                  JobVault AI
                </b>
                <small className="text-[0.65rem] text-[#C9D2DD]/80 block leading-none truncate">
                  Screenshot → Excel
                </small>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="w-9 h-9 rounded-[7px] bg-[#1E2936] hover:bg-[#26333F] border border-[#26333F] text-[#C9D2DD] hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            {theme === "dark" ? (
              <FiSun className="w-4 h-4 text-[#E0A838]" />
            ) : (
              <FiMoon className="w-4 h-4 text-[#C9D2DD]" />
            )}
          </button>
        </header>

        <main className="min-w-0 w-full flex-1 pt-4 pb-5 px-3 sm:px-6 transition-all duration-300">
          <div className="w-full min-w-0 flex flex-col gap-5">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
