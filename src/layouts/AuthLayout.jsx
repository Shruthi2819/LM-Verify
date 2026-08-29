import { Outlet } from "react-router-dom";
import { appConfig } from "../config/appConfig";

/**
 * AuthLayout — centered card layout for login, register, and password pages.
 * Split-screen: branding panel on left, form on right (desktop).
 */
function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left — Branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] bg-slate-900 p-10 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full border-[40px] border-blue-400" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full border-[30px] border-blue-300" />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-base">LM</span>
          </div>
          <span className="text-white font-semibold text-lg">{appConfig.name}</span>
        </div>

        {/* Tagline */}
        <div className="relative space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white leading-tight mb-3">
              Digital Legal Metrology Verification
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              A secure, transparent, and government-grade platform for digitizing weighing and measuring instrument certification across India.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {["Secure", "Transparent", "Compliant", "Blockchain-backed"].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs border border-slate-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative text-xs text-slate-600">
          © 2026 {appConfig.name} · Government of India Initiative
        </div>
      </div>

      {/* Right — Form area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 bg-slate-50">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-blue-700 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-sm">LM</span>
          </div>
          <span className="text-slate-800 font-semibold">{appConfig.name}</span>
        </div>

        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
