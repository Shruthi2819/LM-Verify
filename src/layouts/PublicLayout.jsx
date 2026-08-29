import { Outlet, Link } from "react-router-dom";
import { appConfig } from "../config/appConfig";
import { ROUTES } from "../config/routes";

/**
 * PublicLayout — minimal nav bar for public pages (Home, Certificate Verify).
 */
function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Public Navbar */}
      <header className="bg-white border-b border-slate-200 h-14 flex items-center px-6 gap-4">
        <Link to={ROUTES.HOME} className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-700 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-xs">LM</span>
          </div>
          <span className="font-semibold text-slate-800 text-sm">{appConfig.name}</span>
        </Link>

        <div className="flex-1" />

        <nav className="flex items-center gap-4 text-sm">
          <Link to={ROUTES.VERIFY} className="text-slate-600 hover:text-blue-700 transition-colors">
            Verify Certificate
          </Link>
          <Link
            to={ROUTES.LOGIN}
            className="px-4 py-1.5 bg-blue-700 text-white rounded-md text-sm font-medium hover:bg-blue-800 transition-colors"
          >
            Sign In
          </Link>
        </nav>
      </header>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-xs text-slate-500 text-center">
        © 2026 {appConfig.name} — {appConfig.fullName} · Government of India
      </footer>
    </div>
  );
}

export default PublicLayout;
