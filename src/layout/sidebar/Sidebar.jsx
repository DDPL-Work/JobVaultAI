import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { FiSun, FiMoon } from "react-icons/fi";
import { LuPanelLeftClose, LuPanelLeftOpen } from "react-icons/lu";
import { logoutUser } from "../../apis/thunks/authThunks";
import { fetchHealthStatus } from "../../apis/thunks/dashboardThunks";
import { getUser } from "../../apis/apiClient";

/**
 * Reusable NavItem Component with Collapsed Tooltip and Badge Support
 */
function SidebarNavItem({
  to,
  label,
  icon,
  badgeCount,
  badgeVariant = "default",
  end = false,
  isCollapsed = false,
}) {
  const badgeClasses =
    badgeVariant === "info"
      ? "bg-[#235F8C] text-white"
      : "bg-[#9C6B12] text-white";

  return (
    <NavLink
      to={to}
      end={end}
      title={label}
      className={({ isActive }) =>
        `group relative flex items-center ${
          isCollapsed
            ? "justify-center w-full h-[33px] px-0"
            : "gap-2.5 px-2.5 py-1.5"
        } rounded-[6px] text-[0.84rem] font-medium transition-all select-none ${
          isActive
            ? isCollapsed
              ? "bg-[#26333F] text-white shadow-[inset_3px_0_0_#9C6B12]"
              : "bg-[#26333F] text-white shadow-[inset_3px_0_0_#9C6B12] max-[900px]:shadow-[inset_0_-2px_0_#9C6B12]"
            : "text-[#C9D2DD] hover:bg-[#26333F] hover:text-white"
        }`
      }
    >
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          viewBox="0 0 24 24"
          className={`${
            isCollapsed ? "w-[18px] h-[18px]" : "w-4 h-4"
          } shrink-0 stroke-current fill-none transition-all`}
          strokeWidth={isCollapsed ? "1.9" : "1.7"}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {icon}
        </svg>

        {/* Collapsed Badge Pill overlaid on icon */}
        {isCollapsed && badgeCount !== undefined && badgeCount !== null && badgeCount > 0 && (
          <span
            className={`hidden min-[901px]:flex absolute -top-1 -right-2 font-['IBM_Plex_Mono',monospace] text-[0.6rem] min-w-[14px] h-[14px] items-center justify-center rounded-full px-0.5 font-bold leading-none shadow-sm ${badgeClasses}`}
          >
            {badgeCount}
          </span>
        )}
      </div>

      {/* Expanded Label and Badge */}
      {!isCollapsed && (
        <>
          <span className="truncate">{label}</span>
          {badgeCount !== undefined && badgeCount !== null && badgeCount > 0 && (
            <span
              className={`ml-auto font-['IBM_Plex_Mono',monospace] text-[0.7rem] rounded-[10px] px-1.5 py-0.5 leading-none shrink-0 ${badgeClasses}`}
            >
              {badgeCount}
            </span>
          )}
        </>
      )}

      {/* Floating Hover Tooltip on Desktop when Collapsed */}
      {isCollapsed && (
        <span className="hidden min-[901px]:group-hover:flex absolute left-full ml-3 px-2.5 py-1.5 bg-[#15202C] text-white text-[0.8rem] font-medium rounded-[6px] shadow-[0_6px_20px_rgba(0,0,0,0.45)] border border-[#26333F] whitespace-nowrap z-50 items-center gap-2 pointer-events-none animate-in fade-in duration-150">
          <span>{label}</span>
          {badgeCount !== undefined && badgeCount !== null && badgeCount > 0 && (
            <span
              className={`font-['IBM_Plex_Mono',monospace] text-[0.65rem] rounded-full px-1.5 py-0.2 leading-tight ${badgeClasses}`}
            >
              {badgeCount}
            </span>
          )}
        </span>
      )}
    </NavLink>
  );
}

/**
 * Reusable NavGroup Component
 */
function SidebarNavGroup({ label, children, isCollapsed = false }) {
  return (
    <nav className={`flex flex-col ${isCollapsed ? "gap-[2px]" : "gap-[2.5px]"} max-[900px]:flex-row shrink-0`} aria-label={label}>
      {label && !isCollapsed && (
        <div className="text-[#C9D2DD] opacity-70 px-2.5 pb-1 text-[0.68rem] uppercase tracking-[0.08em] font-semibold select-none max-[900px]:hidden">
          {label}
        </div>
      )}
      {label && isCollapsed && (
        <div className="hidden min-[901px]:block my-1 border-t border-[#26333F]/70 mx-1" />
      )}
      {children}
    </nav>
  );
}

/**
 * Brand Logo & App Identity with Arrow Collapse / Expand Button and 1-Click Theme Toggle
 */
function SidebarBrand({
  isCollapsed,
  onToggleCollapse,
  isDark = false,
  onToggleTheme = () => {},
}) {
  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-1.5 px-0 pt-0 pb-1.5 border-b border-[#26333F]/80 shrink-0 select-none">
        {/* Centered Brand Logo */}
        <div
          title="JobVault AI (Click to expand)"
          onClick={onToggleCollapse}
          className="w-[32px] h-[32px] rounded-[7px] bg-[#9C6B12] text-white grid place-items-center font-['Bricolage_Grotesque',sans-serif] font-bold text-[0.95rem] shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
        >
          JV
        </div>

        {/* 1-Click Theme Toggle Button (React Icons) in Collapsed Mode */}
        <button
          type="button"
          onClick={onToggleTheme}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="w-[32px] h-[24px] rounded-[5px] bg-[#1E2936] hover:bg-[#26333F] text-[#C9D2DD] hover:text-white border border-[#26333F] hover:border-[#3b4c5c] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
        >
          {isDark ? (
            <FiSun className="w-3.5 h-3.5 text-[#E0A838]" />
          ) : (
            <FiMoon className="w-3.5 h-3.5 text-[#C9D2DD]" />
          )}
        </button>

        {/* Expand Sidebar Icon Button (React Icon) */}
        <button
          type="button"
          onClick={onToggleCollapse}
          title="Expand sidebar"
          aria-label="Expand sidebar"
          className="w-[32px] h-[24px] rounded-[5px] bg-[#1E2936] hover:bg-[#26333F] text-[#C9D2DD] hover:text-white border border-[#26333F] hover:border-[#3b4c5c] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
        >
          <LuPanelLeftOpen className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2 px-1 pb-2 pt-0.5 border-b border-[#26333F]/80 shrink-0 select-none">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-[32px] h-[32px] rounded-[7px] bg-[#9C6B12] text-white grid place-items-center font-['Bricolage_Grotesque',sans-serif] font-bold text-[0.95rem] shrink-0 shadow-xs">
          JV
        </div>

        <div className="min-w-0">
          <b className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[1rem] max-[620px]:text-[0.92rem] text-white tracking-[-0.01em] leading-tight block whitespace-nowrap truncate">
            JobVault AI
          </b>
          {/* <small className="text-[0.7rem] opacity-80 block text-[#C9D2DD] max-[900px]:hidden leading-tight mt-0.5 truncate">
            Screenshot → Excel
          </small> */}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {/* 1-Click Theme Toggle Button (React Icons) */}
        <button
          type="button"
          onClick={onToggleTheme}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="w-7 h-7 rounded-[6px] text-[#C9D2DD] hover:text-white hover:bg-[#26333F] border border-[#26333F] hover:border-[#3b4c5c] flex items-center justify-center transition-all cursor-pointer"
        >
          {isDark ? (
            <FiSun className="w-3.5 h-3.5 text-[#E0A838]" />
          ) : (
            <FiMoon className="w-3.5 h-3.5 text-[#C9D2DD]" />
          )}
        </button>

        {/* Sidebar Collapse Icon Button (React Icon) */}
        <button
          type="button"
          onClick={onToggleCollapse}
          title="Collapse sidebar"
          aria-label="Collapse sidebar"
          className="hidden min-[901px]:flex items-center justify-center w-7 h-7 rounded-[6px] text-[#C9D2DD] hover:text-white hover:bg-[#26333F] border border-[#26333F] hover:border-[#3b4c5c] transition-all cursor-pointer shrink-0"
        >
          <LuPanelLeftClose className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * Sidebar Footer Component with Profile Section and Interactive Popup (Popover)
 */
function SidebarFooter({
  aiReader = "demo mode",
  processingCount = 0,
  isCollapsed = false,
  isDark = false,
  onToggleTheme = () => {},
}) {
  const dispatch = useDispatch();
  const reduxUser = useSelector((state) => state.auth?.user);
  const health = useSelector((state) => state.dashboard?.health);
  const storedUser = getUser();
  const currentUser = reduxUser || storedUser || {};
  const currentEmail = currentUser.email || "admin@company.com";
  const currentUsername = currentUser.username || currentUser.name || "Admin User";
  const currentRole = currentUser.role || "ADMIN";
  const initialChar = (currentUsername || currentEmail || "A").charAt(0).toUpperCase();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "shortcuts"
  const [popoverPos, setPopoverPos] = useState({ bottom: 20, left: 16, width: 220 });
  const buttonRef = useRef(null);
  const popoverRef = useRef(null);
  const navigate = useNavigate();

  // Toggle popover and compute its fixed coordinates so it never gets clipped
  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      if (isCollapsed) {
        setPopoverPos({
          bottom: Math.max(16, window.innerHeight - rect.bottom),
          left: rect.right + 12,
          width: 260,
        });
      } else {
        setPopoverPos({
          bottom: Math.max(16, window.innerHeight - rect.top + 8),
          left: rect.left,
          width: Math.max(rect.width, 240),
        });
      }
    }
    setIsOpen((prev) => !prev);
  };

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        isOpen &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleCopyEmail = () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(currentEmail).then(() => {
        toast.success("Admin email copied to clipboard!");
      });
    } else {
      toast.info(currentEmail);
    }
  };

  const handleSignOut = async () => {
    try {
      await dispatch(logoutUser());
    } catch {
      // ignore
    }
    try {
      sessionStorage.removeItem("jv_token");
      sessionStorage.removeItem("jobvault_auth");
      localStorage.removeItem("jv_token");
      localStorage.removeItem("jobvault_auth");
      sessionStorage.setItem("jv_signed_out", "true");
    } catch {
      // ignore
    }
    setIsOpen(false);
    toast.info("Signed out successfully");
    navigate("/", { state: { fromSignOut: true }, replace: true });
  };

  return (
    <div className="mt-auto shrink-0 select-none max-[900px]:hidden">
      {/* 1. Global Fixed Popover Menu (White Theme) */}
      {isOpen && (
        <div
          ref={popoverRef}
          style={{
            position: "fixed",
            bottom: `${popoverPos.bottom}px`,
            left: `${popoverPos.left}px`,
            width: `${popoverPos.width}px`,
            zIndex: 9999,
          }}
          className="bg-white border border-[#DCE1E8] rounded-[10px] shadow-[0_12px_36px_rgba(21,32,44,0.18),0_2px_8px_rgba(21,32,44,0.08)] p-3 flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-150 text-[#15202C]"
        >
          {/* Popover Header: Avatar + User Info */}
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#E8ECF2]">
            <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-tr from-[#9C6B12] to-[#E0A838] text-white flex items-center justify-center font-bold text-[0.95rem] shadow-xs shrink-0">
              {initialChar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[#15202C] text-[0.84rem] truncate">
                  {currentUsername}
                </span>
                <span className="text-[0.6rem] font-bold bg-[#F5EAD3] text-[#9C6B12] border border-[#E5D2A8] rounded-full px-1.5 py-0.2 shrink-0">
                  {currentRole}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyEmail}
                title="Click to copy email"
                className="text-[0.72rem] text-[#5A6777] hover:text-[#15202C] truncate block mt-0.5 text-left transition-colors cursor-pointer"
              >
                {currentEmail}
              </button>
            </div>
          </div>

          {/* Interactive Navigation Tabs inside Popup */}
          <div className="flex bg-[#F1F3F6] p-0.5 rounded-[6px] border border-[#DCE1E8] gap-0.5 text-[0.72rem] font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`flex-1 py-1 rounded-[4px] text-center transition-colors cursor-pointer ${
                activeTab === "profile"
                  ? "bg-white text-[#15202C] shadow-xs font-bold"
                  : "text-[#5A6777] hover:text-[#15202C]"
              }`}
            >
              Account
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("shortcuts")}
              className={`flex-1 py-1 rounded-[4px] text-center transition-colors cursor-pointer ${
                activeTab === "shortcuts"
                  ? "bg-white text-[#15202C] shadow-xs font-bold"
                  : "text-[#5A6777] hover:text-[#15202C]"
              }`}
            >
              Quick Links
            </button>
          </div>

          {/* Tab 1: Account & Email Details */}
          {activeTab === "profile" && (
            <div className="flex flex-col gap-1.5 text-[0.73rem] py-0.5">
              <div className="flex items-center justify-between text-[#5A6777]">
                <span>Email:</span>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  title="Click to copy"
                  className="text-[#15202C] font-mono text-[0.7rem] bg-[#F6F7F9] hover:bg-[#EEF1F6] px-1.5 py-0.5 rounded border border-[#DCE1E8] cursor-pointer transition-colors flex items-center gap-1.5 font-medium"
                >
                  <span>{currentEmail}</span>
                  <svg viewBox="0 0 24 24" className="w-3 h-3 text-[#5A6777]" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center justify-between text-[#5A6777]">
                <span>Role:</span>
                <span className="text-[#15202C] font-medium">{currentRole}</span>
              </div>

              <div className="flex items-center justify-between text-[#5A6777]">
                <span>Status:</span>
                <span className="inline-flex items-center gap-1.5 text-[#24734A] font-semibold text-[0.72rem]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#24734A]" />
                  Active · Online
                </span>
              </div>

              <div className="flex items-center justify-between text-[#5A6777]">
                <span>Server Health:</span>
                <button
                  type="button"
                  onClick={() => dispatch(fetchHealthStatus())}
                  title="Click to check server health"
                  className={`inline-flex items-center gap-1.5 font-semibold text-[0.72rem] cursor-pointer ${
                    health?.loading
                      ? "text-[#9A5B00]"
                      : health?.ok === false
                      ? "text-[#A8281F]"
                      : "text-[#24734A]"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      health?.loading
                        ? "bg-[#9A5B00] animate-pulse"
                        : health?.ok === false
                        ? "bg-[#A8281F]"
                        : "bg-[#24734A]"
                    }`}
                  />
                  <span>
                    {health?.loading
                      ? "Checking..."
                      : health?.ok === false
                      ? "Offline"
                      : "Healthy"}
                  </span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[#5A6777]">
                <span>AI Reader:</span>
                <span className="text-[#15202C] font-medium">{aiReader}</span>
              </div>

              <div className="flex items-center justify-between text-[#5A6777]">
                <span>Theme:</span>
                <button
                  type="button"
                  onClick={onToggleTheme}
                  title="Click to toggle theme"
                  className="text-[#15202C] font-medium text-[0.72rem] bg-[#F6F7F9] hover:bg-[#EEF1F6] px-2 py-0.5 rounded border border-[#DCE1E8] cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  {isDark ? (
                    <>
                      <FiMoon className="w-3 h-3 text-[#9C6B12]" />
                      <span>Dark Mode</span>
                    </>
                  ) : (
                    <>
                      <FiSun className="w-3 h-3 text-[#9C6B12]" />
                      <span>Light Mode</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Quick Navigation Links */}
          {activeTab === "shortcuts" && (
            <div className="flex flex-col gap-1 text-[0.74rem] py-0.5">
              <NavLink
                to="/ai_reading"
                onClick={() => setIsOpen(false)}
                className="px-2 py-1.5 rounded-[5px] hover:bg-[#F1F3F6] text-[#15202C] hover:text-[#9C6B12] transition-colors flex items-center justify-between"
              >
                <span>AI Reading Settings</span>
                <span className="text-[0.65rem] text-[#8C9BAE] font-mono">/ai_reading</span>
              </NavLink>
              <NavLink
                to="/rules"
                onClick={() => setIsOpen(false)}
                className="px-2 py-1.5 rounded-[5px] hover:bg-[#F1F3F6] text-[#15202C] hover:text-[#9C6B12] transition-colors flex items-center justify-between"
              >
                <span>Vault Rules</span>
                <span className="text-[0.65rem] text-[#8C9BAE] font-mono">/rules</span>
              </NavLink>
              <NavLink
                to="/activity"
                onClick={() => setIsOpen(false)}
                className="px-2 py-1.5 rounded-[5px] hover:bg-[#F1F3F6] text-[#15202C] hover:text-[#9C6B12] transition-colors flex items-center justify-between"
              >
                <span>Activity Log</span>
                <span className="text-[0.65rem] text-[#8C9BAE] font-mono">/activity</span>
              </NavLink>
            </div>
          )}

          {/* Sign Out Action Button */}
          <div className="pt-2 border-t border-[#E8ECF2]">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-[6px] bg-[#FDF2F2] hover:bg-[#FEE2E2] text-[#DC2626] font-semibold text-[0.78rem] transition-colors border border-[#FCA5A5]/60 hover:border-[#DC2626] cursor-pointer shadow-2xs"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-3.5 h-3.5 stroke-current fill-none text-[#DC2626]"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Trigger UI: Bottom Profile Row or Collapsed Avatar Button */}
      {isCollapsed ? (
        <div className="pt-1.5 pb-0.5 border-t border-[#26333F] flex flex-col items-center gap-1.5">
          {/* Collapsed Profile Avatar Button */}
          <button
            ref={buttonRef}
            type="button"
            onClick={handleToggle}
            title={`${currentUsername} · ${currentEmail} (Click for options)`}
            className={`w-[34px] h-[34px] rounded-full bg-gradient-to-tr from-[#9C6B12] to-[#E0A838] text-white flex items-center justify-center font-bold text-[0.88rem] shadow-xs cursor-pointer transition-all relative ${
              isOpen ? "ring-2 ring-[#E0A838]" : "hover:ring-2 hover:ring-[#9C6B12]"
            }`}
          >
            {initialChar}
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#24734A] border-2 border-[#15202C]" />
          </button>
        </div>
      ) : (
        <div className="pt-2 border-t border-[#26333F] flex flex-col gap-1.5">
          {/* Expanded Profile Card Trigger Button */}
          <button
            ref={buttonRef}
            type="button"
            onClick={handleToggle}
            className={`w-full flex items-center gap-2.5 p-1.5 rounded-[8px] transition-all text-left cursor-pointer border select-none ${
              isOpen
                ? "bg-[#26333F] border-[#3b4c5c] text-white"
                : "border-transparent text-[#C9D2DD] hover:bg-[#26333F] hover:text-white hover:border-[#334454]"
            }`}
          >
            {/* Avatar with Status Dot */}
            <div className="relative shrink-0">
              <div className="w-[32px] h-[32px] rounded-full bg-gradient-to-tr from-[#9C6B12] to-[#E0A838] text-white flex items-center justify-center font-bold text-[0.85rem] shadow-xs">
                {initialChar}
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#24734A] border-2 border-[#15202C]" />
            </div>

            {/* Admin Name and Email */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 leading-tight">
                <span className="text-[0.82rem] font-semibold text-white truncate">
                  {currentUsername}
                </span>
                {/* <span className="text-[0.6rem] bg-[#9C6B12]/25 text-[#E0A838] border border-[#9C6B12]/40 rounded-full px-1.5 py-0.2 font-bold leading-none">
                  ADMIN
                </span> */}
              </div>
              <span className="text-[0.7rem] text-[#8C9BAE] truncate block mt-0.5 leading-tight">
                {currentEmail}
              </span>
            </div>

            {/* Chevron Arrow */}
            <svg
              viewBox="0 0 24 24"
              className={`w-4 h-4 text-[#8C9BAE] shrink-0 transition-transform duration-200 ${
                isOpen ? "rotate-180 text-white" : ""
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Main Sidebar Component with Collapsible State
 */
export default function Sidebar({
  reviewCount: reviewCountProp,
  processingCount: processingCountProp,
  isCollapsed = false,
  onToggleCollapse = () => {},
  isDark = false,
  onToggleTheme = () => {},
}) {
  const stats = useSelector((state) => state.dashboard?.stats);
  const reviewItems = useSelector((state) => state.jobs?.reviewItems);
  const reviewCount =
    reviewCountProp !== undefined
      ? reviewCountProp
      : Number(stats?.review ?? reviewItems?.length ?? 0);
  const processingCount =
    processingCountProp !== undefined
      ? processingCountProp
      : Number(stats?.processing ?? 0) +
        Number(stats?.queue?.running ?? 0) +
        Number(stats?.queue?.queued ?? 0);
  const aiReaderLabel = stats?.provider || "OpenAI";
  const workspaceLinks = [
    {
      to: "/dashboard",
      label: "Dashboard",
      end: true,
      icon: (
        <>
          <rect x="3" y="3" width="7" height="9" />
          <rect x="14" y="3" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" />
          <rect x="3" y="16" width="7" height="5" />
        </>
      ),
    },
    {
      to: "/inbox",
      label: "Screenshots",
      badgeCount: processingCount,
      badgeVariant: "info",
      icon: (
        <>
          <path d="M4 13h4l2 3h4l2-3h4" />
          <path d="M5 5h14l1 8v6H4v-6z" />
        </>
      ),
    },
    {
      to: "/jobs",
      label: "Job sheet",
      icon: (
        <>
          <rect x="3" y="4" width="18" height="16" rx="1" />
          <path d="M3 10h18M9 4v16" />
        </>
      ),
    },
    {
      to: "/vaults",
      label: "Vaults",
      icon: (
        <>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="12" cy="12" r="3.5" />
          <path d="M12 8.5V7M15.5 12H17" />
        </>
      ),
    },
    {
      to: "/review",
      label: "Review queue",
      badgeCount: reviewCount,
      badgeVariant: "default",
      icon: (
        <>
          <path d="M12 3l9 16H3z" />
          <path d="M12 10v4M12 17h.01" />
        </>
      ),
    },
  ];

  const adminLinks = [
    {
      to: "/rules",
      label: "Vault rules",
      icon: (
        <>
          <path d="M4 6h10M4 12h16M4 18h7" />
          <circle cx="17" cy="6" r="2" />
          <circle cx="14" cy="18" r="2" />
        </>
      ),
    },
    {
      to: "/columns",
      label: "Sheet columns",
      icon: (
        <>
          <path d="M4 5h16v14H4zM4 9h16M10 9v10" />
        </>
      ),
    },
    {
      to: "/ai_reading",
      label: "AI reading",
      icon: (
        <>
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
          <rect x="7" y="7" width="10" height="10" rx="2" />
          <path d="M10 12h4" />
        </>
      ),
    },
    {
      to: "/integrations",
      label: "Integrations",
      icon: (
        <>
          <path d="M9 7H6a4 4 0 000 8h3M15 7h3a4 4 0 010 8h-3M8 11h8" />
        </>
      ),
    },
    {
      to: "/activity",
      label: "Activity log",
      icon: (
        <>
          <path d="M3 12h4l3-8 4 16 3-8h4" />
        </>
      ),
    },
  ];

  return (
    <aside
      className={`bg-[#15202C] text-[#C9D2DD] ${
        isCollapsed
          ? "p-[6px_8px] gap-1 overflow-y-auto"
          : "p-[14px_12px] gap-2.5 overflow-y-auto"
      } flex flex-col sticky top-0 h-screen no-scrollbar select-none transition-all duration-300 ease-in-out max-[900px]:h-auto max-[900px]:flex-row max-[900px]:items-center max-[900px]:gap-3 max-[900px]:overflow-x-auto max-[900px]:z-20 max-[900px]:py-2.5 max-[900px]:px-4`}
      aria-label="Application Sidebar"
    >
      <SidebarBrand
        isCollapsed={isCollapsed}
        onToggleCollapse={onToggleCollapse}
        isDark={isDark}
        onToggleTheme={onToggleTheme}
      />

      <SidebarNavGroup label="Workspace" isCollapsed={isCollapsed}>
        {workspaceLinks.map((item) => (
          <SidebarNavItem
            key={item.to}
            to={item.to}
            label={item.label}
            icon={item.icon}
            end={item.end}
            badgeCount={item.badgeCount}
            badgeVariant={item.badgeVariant}
            isCollapsed={isCollapsed}
          />
        ))}
      </SidebarNavGroup>

      <SidebarNavGroup label="Admin" isCollapsed={isCollapsed}>
        {adminLinks.map((item) => (
          <SidebarNavItem
            key={item.to}
            to={item.to}
            label={item.label}
            icon={item.icon}
            badgeCount={item.badgeCount}
            badgeVariant={item.badgeVariant}
            isCollapsed={isCollapsed}
          />
        ))}
      </SidebarNavGroup>

      <SidebarFooter
        aiReader={aiReaderLabel}
        processingCount={processingCount}
        isCollapsed={isCollapsed}
        isDark={isDark}
        onToggleTheme={onToggleTheme}
      />
    </aside>
  );
}

