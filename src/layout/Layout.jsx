import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar/Sidebar";

/**
 * Main application Layout wrapping the Sidebar and page outlet
 */
export default function Layout() {
  return (
    <div className="min-h-screen bg-[#F1F3F6] text-[#15202C] font-['Instrument_Sans',sans-serif] grid grid-cols-1 min-[901px]:grid-cols-[236px_minmax(0,1fr)]">
      <Sidebar />
      <main className="min-w-0 pt-6 pb-5 px-4 sm:px-3">
        <div className="max-w-[1240px] mx-auto flex flex-col gap-5">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
