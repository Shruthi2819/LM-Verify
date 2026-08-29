import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/navigation/Navbar";
import Sidebar from "../components/navigation/Sidebar";
import MobileSidebar from "../components/navigation/MobileSidebar";

/**
 * AppLayout — shared base layout for all authenticated role dashboards.
 * Composes Navbar + Sidebar + MobileSidebar + content area.
 * Each role layout simply imports and renders this.
 */
function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar onMenuToggle={() => setMobileOpen(true)} />

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
      />

      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main content — shifts right to accommodate desktop sidebar */}
      <main
        className={[
          "pt-14 min-h-screen transition-[padding-left] duration-250 ease-in-out",
          "hidden lg:block",
          sidebarCollapsed ? "pl-[60px]" : "pl-[220px]",
        ].join(" ")}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile main — no padding-left, sidebar is overlay */}
      <main className="pt-14 lg:hidden">
        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AppLayout;
