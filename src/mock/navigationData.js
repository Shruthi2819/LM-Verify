import {
  LayoutDashboard,
  Building2,
  Scale,
  ClipboardList,
  BadgeCheck,
  RefreshCw,
  Bell,
  Calendar,
  Search,
  FileText,
  Users,
  ShieldCheck,
  ShieldAlert,
  Briefcase,
  BarChart2,
  ScrollText,
  Settings,
  User,
  MapPin
} from "lucide-react";
import { ROUTES, ROLES } from "../config/routes";

/**
 * Role-based sidebar navigation configuration.
 */
const navigationData = {
  [ROLES.BUSINESS]: [
    { label: "Dashboard", path: ROUTES.BUSINESS_DASHBOARD, icon: LayoutDashboard },
    { label: "My Business", path: ROUTES.BUSINESS_PROFILE, icon: Building2 },
    { label: "Instruments", path: ROUTES.BUSINESS_INSTRUMENTS, icon: Scale },
    { label: "Applications", path: ROUTES.BUSINESS_APPLICATIONS, icon: ClipboardList },
    { label: "Certificates", path: ROUTES.BUSINESS_CERTIFICATES, icon: BadgeCheck },
    { label: "Renewals", path: ROUTES.BUSINESS_RENEWALS, icon: RefreshCw },
    { label: "Notifications", path: ROUTES.BUSINESS_NOTIFICATIONS, icon: Bell },
  ],

  [ROLES.LMO]: [
    { label: "Dashboard", path: ROUTES.LMO_DASHBOARD, icon: LayoutDashboard },
    { label: "Applications", path: ROUTES.LMO_APPLICATIONS, icon: ClipboardList },
    { label: "Schedule", path: ROUTES.LMO_SCHEDULE, icon: Calendar },
    { label: "Inspections", path: ROUTES.LMO_INSPECTIONS, icon: Search },
    { label: "Certificates", path: ROUTES.LMO_CERTIFICATES, icon: BadgeCheck },
    { label: "Notifications", path: ROUTES.LMO_NOTIFICATIONS, icon: Bell },
    { label: "Profile", path: ROUTES.LMO_PROFILE, icon: User },
    { label: "Sync Center", path: ROUTES.LMO_SYNC, icon: RefreshCw },
  ],

  [ROLES.GATC]: [
    { label: "Dashboard", path: ROUTES.GATC_DASHBOARD, icon: LayoutDashboard },
    { label: "Assigned Tasks", path: ROUTES.GATC_APPLICATIONS, icon: ClipboardList },
    { label: "Testing Workspace", path: ROUTES.GATC_INSPECTIONS, icon: Briefcase },
    { label: "Test Reports", path: ROUTES.GATC_REPORTS, icon: ScrollText },
    { label: "Profile", path: ROUTES.GATC_PROFILE, icon: User },
    { label: "Sync Center", path: ROUTES.GATC_SYNC, icon: RefreshCw },
  ],

  [ROLES.ADMIN]: [
    { label: "Admin Dashboard", path: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard },
    { label: "User Management", path: ROUTES.ADMIN_USERS, icon: Users },
    { label: "Applications", path: ROUTES.ADMIN_APPLICATIONS, icon: ClipboardList },
    { label: "Inspections", path: ROUTES.ADMIN_INSPECTIONS, icon: Search },
    { label: "Certificates", path: ROUTES.ADMIN_CERTIFICATES, icon: BadgeCheck },
    { label: "Predictive Compliance", path: ROUTES.ADMIN_COMPLIANCE, icon: ShieldAlert },
    { label: "Evidence Integrity", path: ROUTES.ADMIN_EVIDENCE_CHAINS, icon: ShieldCheck },
    { label: "Audit Logs", path: ROUTES.ADMIN_AUDIT_LOGS, icon: ScrollText },
    { label: "Offline & Sync Monitor", path: ROUTES.ADMIN_OFFLINE_SYNC, icon: RefreshCw },
    { label: "Settings", path: ROUTES.ADMIN_SETTINGS, icon: Settings },
    { label: "Profile", path: ROUTES.ADMIN_PROFILE, icon: User },
  ],
};

export default navigationData;
