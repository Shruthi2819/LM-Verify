import { useState, useRef, useEffect } from "react";
import { Bell, LogOut, User, Settings, ChevronDown, Menu } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../hooks/useNotifications";
import { appConfig } from "../../config/appConfig";
import { ROUTES } from "../../config/routes";
import { getInitials, titleCase } from "../../utils/helpers";

/**
 * Navbar — top navigation bar for authenticated application layouts.
 * Displays branding, notification bell, user avatar, and dropdown menu.
 *
 * @param {function} onMenuToggle - called when mobile hamburger is pressed
 */
function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handle = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const handleProfileClick = () => {
    setDropdownOpen(false);
    if (user?.role === "business") {
      navigate(ROUTES.BUSINESS_PROFILE);
    }
  };

  const handleBellClick = () => {
    if (user?.role === "business") {
      navigate(ROUTES.BUSINESS_NOTIFICATIONS);
    }
  };

  const roleLabel = {
    business: "Business User",
    lmo: "Legal Metrology Officer",
    gatc: "GATC",
    admin: "Administrator",
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-3">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-1.5 rounded text-slate-600 hover:bg-slate-100 transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Logo */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-7 h-7 bg-blue-700 rounded-md flex items-center justify-center">
          <span className="text-white font-bold text-xs">LM</span>
        </div>
        <span className="hidden sm:block font-semibold text-slate-800 text-sm">
          {appConfig.name}
        </span>
      </div>

      <div className="flex-1" />

      {/* Notification bell — real state-connected */}
      <button
        onClick={handleBellClick}
        className="relative p-2 rounded-md text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {/* Unread indicator */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[14px] h-[14px] px-0.5 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* User dropdown */}
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center gap-2 pl-2 pr-2 py-1 rounded-md hover:bg-slate-100 transition-colors"
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
          aria-label="User menu"
        >
          {/* Avatar */}
          <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-semibold">
              {getInitials(user?.name || "")}
            </span>
          </div>
          <div className="hidden sm:flex flex-col items-start leading-none">
            <span className="text-xs font-medium text-slate-800 max-w-[120px] truncate">
              {user?.name || "User"}
            </span>
            <span className="text-[10px] text-slate-400">
              {roleLabel[user?.role] || user?.role}
            </span>
          </div>
          <ChevronDown
            size={14}
            className={["text-slate-400 transition-transform", dropdownOpen ? "rotate-180" : ""].join(" ")}
          />
        </button>

        {/* Dropdown menu */}
        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-lg border border-slate-200 shadow-lg py-1 z-50">
            <div className="px-3 py-2 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-800 truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
            </div>

            <DropdownItem icon={<User size={14} />} label="Profile" onClick={handleProfileClick} />
            <DropdownItem icon={<Settings size={14} />} label="Settings" onClick={() => setDropdownOpen(false)} />

            <div className="border-t border-slate-100 mt-1 pt-1">
              <DropdownItem
                icon={<LogOut size={14} />}
                label="Sign Out"
                onClick={handleLogout}
                danger
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function DropdownItem({ icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors",
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-slate-700 hover:bg-slate-50",
      ].join(" ")}
    >
      {icon}
      {label}
    </button>
  );
}

export default Navbar;
