import { NavLink } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import navigationData from "../../mock/navigationData";
import { appConfig } from "../../config/appConfig";

/**
 * Sidebar — role-aware, collapsible desktop sidebar.
 *
 * @param {boolean} collapsed - collapsed state
 * @param {function} onToggle - toggle collapsed state
 */
function Sidebar({ collapsed, onToggle }) {
  const { role } = useAuth();
  const navItems = navigationData[role] || [];

  return (
    <aside
      className={[
        "fixed top-14 left-0 bottom-0 z-20 flex flex-col",
        "bg-slate-900 text-slate-300",
        "transition-[width] duration-250 ease-in-out",
        "hidden lg:flex",
        collapsed ? "w-[60px]" : "w-[220px]",
      ].join(" ")}
    >
      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3">
        {navItems.map((item) => (
          <SidebarItem key={item.path} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center h-10 border-t border-slate-700/50 text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}

function SidebarItem({ item, collapsed }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 px-4 py-2.5 mx-1.5 my-0.5 rounded-md text-sm",
          "transition-colors duration-100",
          isActive
            ? "bg-blue-600 text-white"
            : "text-slate-400 hover:bg-slate-800 hover:text-slate-100",
        ].join(" ")
      }
    >
      {Icon && (
        <Icon
          size={18}
          className="flex-shrink-0"
          aria-hidden="true"
        />
      )}
      {!collapsed && (
        <span className="truncate font-medium text-sm leading-tight">{item.label}</span>
      )}
    </NavLink>
  );
}

export default Sidebar;
