// Centralised route path constants
// Import these instead of hard-coding strings across the app

export const ROUTES = {
  // Public
  HOME: "/",
  VERIFY: "/verify",
  VERIFY_CERT: "/verify/:certificateId",

  // Auth
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  // Business
  BUSINESS_DASHBOARD: "/business/dashboard",
  BUSINESS_PROFILE: "/business/profile",

  // Instruments
  BUSINESS_INSTRUMENTS: "/business/instruments",
  BUSINESS_INSTRUMENTS_REGISTER: "/business/instruments/register",
  BUSINESS_INSTRUMENT_DETAIL: "/business/instruments/:instrumentId",
  BUSINESS_INSTRUMENT_EDIT: "/business/instruments/:instrumentId/edit",

  // Applications
  BUSINESS_APPLICATIONS: "/business/applications",
  BUSINESS_APPLICATIONS_NEW: "/business/applications/new",
  BUSINESS_APPLICATION_DETAIL: "/business/applications/:applicationId",

  // Certificates
  BUSINESS_CERTIFICATES: "/business/certificates",
  BUSINESS_CERTIFICATE_DETAIL: "/business/certificates/:certificateId",

  // Other business
  BUSINESS_RENEWALS: "/business/renewals",
  BUSINESS_NOTIFICATIONS: "/business/notifications",

  // LMO
  LMO_DASHBOARD: "/lmo/dashboard",
  LMO_APPLICATIONS: "/lmo/applications",
  LMO_APPLICATION_DETAIL: "/lmo/applications/:applicationId",
  LMO_SCHEDULE: "/lmo/schedule",
  LMO_INSPECTIONS: "/lmo/inspections",
  LMO_INSPECTION_DETAIL: "/lmo/inspections/:inspectionId",
  LMO_INSTRUMENT_DETAIL: "/lmo/instruments/:instrumentId",
  LMO_HISTORY: "/lmo/history",
  LMO_CERTIFICATES: "/lmo/certificates",
  LMO_CERTIFICATE_DETAIL: "/lmo/certificates/:certificateId",
  LMO_NOTIFICATIONS: "/lmo/notifications",
  LMO_PROFILE: "/lmo/profile",

  // GATC
  GATC_DASHBOARD: "/gatc/dashboard",
  GATC_APPLICATIONS: "/gatc/applications",
  GATC_APPLICATION_DETAIL: "/gatc/applications/:applicationId",
  GATC_SCHEDULE: "/gatc/schedule",
  GATC_INSPECTIONS: "/gatc/inspections",
  GATC_INSPECTION_DETAIL: "/gatc/inspections/:inspectionId",
  GATC_CERTIFICATES: "/gatc/certificates",
  GATC_CERTIFICATE_DETAIL: "/gatc/certificates/:certificateId",
  GATC_NOTIFICATIONS: "/gatc/notifications",
  GATC_PROFILE: "/gatc/profile",

  // Admin
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_APPLICATIONS: "/admin/applications",
  ADMIN_APPLICATION_DETAIL: "/admin/applications/:applicationId",
  ADMIN_ASSIGNMENTS: "/admin/assignments",
  ADMIN_OFFICERS: "/admin/officers",
  ADMIN_OFFICER_DETAIL: "/admin/officers/:officerId",
  ADMIN_GATCS: "/admin/gatcs",
  ADMIN_GATC_DETAIL: "/admin/gatcs/:gatcId",
  ADMIN_JURISDICTIONS: "/admin/jurisdictions",
  ADMIN_INSPECTIONS: "/admin/inspections",
  ADMIN_CERTIFICATES: "/admin/certificates",
  ADMIN_CERTIFICATE_DETAIL: "/admin/certificates/:certificateId",
  ADMIN_AUDIT_LOGS: "/admin/audit-logs",
  ADMIN_NOTIFICATIONS: "/admin/notifications",
  ADMIN_PROFILE: "/admin/profile",
  ADMIN_USERS: "/admin/users",
  ADMIN_BUSINESSES: "/admin/businesses",
  ADMIN_REPORTS: "/admin/reports",
  ADMIN_SETTINGS: "/admin/settings",

  // Error
  UNAUTHORIZED: "/unauthorized",
  NOT_FOUND: "*",
};

// Role names — single source of truth
export const ROLES = {
  BUSINESS: "business",
  LMO: "lmo",
  GATC: "gatc",
  ADMIN: "admin",
};

// Default redirect per role after login
export const ROLE_HOME = {
  [ROLES.BUSINESS]: ROUTES.BUSINESS_DASHBOARD,
  [ROLES.LMO]: ROUTES.LMO_DASHBOARD,
  [ROLES.GATC]: ROUTES.GATC_DASHBOARD,
  [ROLES.ADMIN]: ROUTES.ADMIN_DASHBOARD,
};

// Helper to build concrete paths from parameterised route constants
export function buildPath(route, params = {}) {
  return Object.entries(params).reduce(
    (path, [key, val]) => path.replace(`:${key}`, val),
    route
  );
}
