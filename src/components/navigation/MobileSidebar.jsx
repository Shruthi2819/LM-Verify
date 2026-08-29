import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import navigationData from "../../mock/navigationData";
import { appConfig } from "../../config/appConfig";

/**
 * MobileSidebar — full-height drawer overlay for mobile navigation.
 *
 * @param {boolean} open
 * @param {function} onClose
 */
function MobileSidebar({ open, onClose }) {
  const { role } = useAuth();
  const navItems = navigationData[role] || [];

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handle = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={[
          "fixed top-0 left-0 bottom-0 z-50 w-72 bg-slate-900 text-slate-300",
          "transform transition-transform duration-250 ease-in-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        role="navigation"
        aria-label="Mobile navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">LM</span>
            </div>
            <span className="font-semibold text-slate-100 text-sm">{appConfig.name}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 px-4 py-3 mx-2 my-0.5 rounded-md text-sm",
                    "transition-colors duration-100",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-100",
                  ].join(" ")
                }
              >
                {Icon && <Icon size={18} className="flex-shrink-0" />}
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </>
  );
}

export default MobileSidebar;
