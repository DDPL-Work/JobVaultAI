import { NavLink } from "react-router-dom";

/**
 * Reusable NavItem Component
 */
function SidebarNavItem({ to, label, icon, badgeCount, badgeVariant = "default", end = false }) {
  const badgeClasses =
    badgeVariant === "info"
      ? "bg-[#235F8C] text-white"
      : "bg-[#9C6B12] text-white";

  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-2.5 py-1.5 max-[900px]:px-2.5 max-[900px]:py-1.5 rounded-[6px] text-[0.84rem] font-medium transition-colors whitespace-nowrap select-none ${
          isActive
            ? "bg-[#26333F] text-white shadow-[inset_3px_0_0_#9C6B12] max-[900px]:shadow-[inset_0_-2px_0_#9C6B12]"
            : "text-[#C9D2DD] hover:bg-[#26333F] hover:text-white"
        }`
      }
    >
      <svg
        viewBox="0 0 24 24"
        className="w-4 h-4 shrink-0 stroke-current fill-none"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icon}
      </svg>
      <span>{label}</span>
      {badgeCount !== undefined && badgeCount !== null && badgeCount > 0 && (
        <span
          className={`ml-auto font-['IBM_Plex_Mono',monospace] text-[0.7rem] rounded-[10px] px-1.5 py-0.5 leading-none ${badgeClasses}`}
        >
          {badgeCount}
        </span>
      )}
    </NavLink>
  );
}

/**
 * Reusable NavGroup Component
 */
function SidebarNavGroup({ label, children }) {
  return (
    <nav className="flex flex-col gap-[2.5px] max-[900px]:flex-row shrink-0" aria-label={label}>
      {label && (
        <div className="text-[#C9D2DD] opacity-70 px-2.5 pb-1 text-[0.68rem] uppercase tracking-[0.08em] font-semibold select-none max-[900px]:hidden">
          {label}
        </div>
      )}
      {children}
    </nav>
  );
}

/**
 * Brand Logo & App Identity Component
 */
function SidebarBrand() {
  return (
    <div className="flex items-center gap-2.5 px-1 shrink-0 select-none">
      <div className="w-[32px] h-[32px] rounded-[7px] bg-[#9C6B12] text-white grid place-items-center font-['Bricolage_Grotesque',sans-serif] font-bold text-[0.95rem] shrink-0">
        JV
      </div>
      <div>
        <b className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[1rem] max-[620px]:text-[0.92rem] text-white tracking-[-0.01em] leading-tight block whitespace-nowrap">
          JobVault AI
        </b>
        <small className="text-[0.7rem] opacity-80 block text-[#C9D2DD] max-[900px]:hidden leading-tight mt-0.5">
          Screenshot → Excel
        </small>
      </div>
    </div>
  );
}

/**
 * Sidebar Footer Component
 */
function SidebarFooter({ aiReader = "demo mode", processingCount = 0 }) {
  return (
    <div className="mt-auto shrink-0 text-[0.7rem] border-t border-[#26333F] pt-2 px-1.5 leading-[1.5] text-[#C9D2DD] max-[900px]:hidden">
      <div className="flex items-center">
        <span className="inline-block w-[6px] h-[6px] rounded-full mr-1.5 bg-[#9A5B00]"></span>
        <span>AI reader: {aiReader}</span>
      </div>
      <div className="flex items-center">
        {processingCount > 0 ? (
          <>
            <span className="inline-block w-[6px] h-[6px] rounded-full mr-1.5 bg-[#9A5B00] animate-pulse"></span>
            <span>{processingCount} processing</span>
          </>
        ) : (
          <>
            <span className="inline-block w-[6px] h-[6px] rounded-full mr-1.5 bg-[#5A6777]"></span>
            <span>Queue empty</span>
          </>
        )}
      </div>
      <div className="mt-1 flex items-center justify-between text-[0.68rem]">
        <span className="opacity-70">Built by Dr. Design</span>
        <NavLink to="/login" className="text-[#9C6B12] hover:underline font-semibold">
          Sign out
        </NavLink>
      </div>
    </div>
  );
}

/**
 * Main Sidebar Component
 */
export default function Sidebar({ reviewCount = 2, processingCount = 0 }) {
  const workspaceLinks = [
    {
      to: "/",
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
      to: "/ai",
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
      className="bg-[#15202C] text-[#C9D2DD] p-[14px_12px] flex flex-col gap-2.5 sticky top-0 h-screen overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden max-[900px]:h-auto max-[900px]:flex-row max-[900px]:items-center max-[900px]:gap-3 max-[900px]:overflow-x-auto max-[900px]:z-20 max-[900px]:py-2.5 max-[900px]:px-4 select-none"
      aria-label="Application Sidebar"
    >
      <SidebarBrand />

      <SidebarNavGroup label="Workspace">
        {workspaceLinks.map((item) => (
          <SidebarNavItem
            key={item.to}
            to={item.to}
            label={item.label}
            icon={item.icon}
            end={item.end}
            badgeCount={item.badgeCount}
            badgeVariant={item.badgeVariant}
          />
        ))}
      </SidebarNavGroup>

      <SidebarNavGroup label="Admin">
        {adminLinks.map((item) => (
          <SidebarNavItem
            key={item.to}
            to={item.to}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </SidebarNavGroup>

      <SidebarFooter aiReader="demo mode" processingCount={processingCount} />
    </aside>
  );
}
