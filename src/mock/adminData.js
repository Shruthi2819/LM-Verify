/**
 * Mock Admin / Department administration mock datasets.
 */

export const mockAdminStats = [
  { label: "Total Applications", value: 124, change: "+24 this month", trend: "up" },
  { label: "Pending Assignment", value: 12, change: "Requires action", trend: "neutral" },
  { label: "Active LMOs", value: 14, change: "Field operational", trend: "up" },
  { label: "Active GATCs", value: 4, change: "NABL approved", trend: "neutral" },
  { label: "Certificates Stamped", value: 87, change: "Anchored on-chain", trend: "up" },
  { label: "Audit events", value: 1240, change: "Last 30 days", trend: "up" }
];

export const mockAdminProfile = {
  name: "Sunita Patil",
  adminId: "ADM-MH-0012",
  email: "sunita@lmverify.gov.in",
  phone: "+91 22 2202 4432",
  department: "Food, Civil Supplies and Consumer Protection Dept.",
  designation: "Legal Metrology Administrator",
  jurisdiction: "State of Maharashtra, India",
  officeLocation: "Mantralaya, Mumbai"
};

export const mockAdminOfficers = [
  { officerId: "LMO-MH-44012", name: "Priya Sharma", designation: "Legal Metrology Officer", jurisdiction: "Pune East Division", status: "Active", workload: 5 },
  { officerId: "LMO-MH-44015", name: "Arun Mehta", designation: "Legal Metrology Officer", jurisdiction: "Pune South Division", status: "Active", workload: 3 },
  { officerId: "LMO-MH-44019", name: "Karan Johar", designation: "Legal Metrology Officer", jurisdiction: "Pune West Division", status: "On Leave", workload: 0 },
  { officerId: "LMO-MH-44021", name: "Riya Sen", designation: "Legal Metrology Officer", jurisdiction: "Pune North Division", status: "Active", workload: 4 }
];

export const mockAdminGatcs = [
  { gatcId: "GATC-PN-88210", name: "NABL Approved Test Centre, Pune", labManager: "Anand Verma", jurisdiction: "Pune District", status: "Active", workload: 2, accreditationNumber: "NABL-C-1294" },
  { gatcId: "GATC-PN-88215", name: "Pune Metrology Calibration Lab", labManager: "Sanjay Dutta", jurisdiction: "Pune District", status: "Active", workload: 1, accreditationNumber: "NABL-C-3381" },
  { gatcId: "GATC-MB-90112", name: "Mumbai Metrology Lab", labManager: "Vikram Sarabhai", jurisdiction: "Mumbai District", status: "Inactive", workload: 0, accreditationNumber: "NABL-C-0021" }
];

export const mockAdminJurisdictions = [
  { id: "JUR-MH-01", name: "Pune East Division", district: "Pune", activeLMOs: 1, activeGATCs: 1, pendingApps: 3 },
  { id: "JUR-MH-02", name: "Pune South Division", district: "Pune", activeLMOs: 1, activeGATCs: 1, pendingApps: 2 },
  { id: "JUR-MH-03", name: "Pune West Division", district: "Pune", activeLMOs: 1, activeGATCs: 0, pendingApps: 1 },
  { id: "JUR-MH-04", name: "Pune North Division", district: "Pune", activeLMOs: 1, activeGATCs: 0, pendingApps: 4 }
];

export const mockAdminAuditLogs = [
  {
    id: "AUD-0091",
    timestamp: "2026-08-28T15:32:00Z",
    actorName: "Sunita Patil",
    actorRole: "Admin",
    action: "APPLICATION_ASSIGNED",
    entityType: "Application",
    entityId: "APP-2026-00043",
    previousState: "UNASSIGNED",
    newState: "ASSIGNED",
    metadata: "Assigned to LMO Priya Sharma for Hinjewadi district review queue."
  },
  {
    id: "AUD-0090",
    timestamp: "2026-08-28T12:10:00Z",
    actorName: "Anand Verma (GATC)",
    actorRole: "GATC",
    action: "TEST_RESULT_SUBMITTED",
    entityType: "Inspection",
    entityId: "TEST-2026-000109",
    previousState: "IN_PROGRESS",
    newState: "COMPLETED",
    metadata: "Calibration observation recorded: PASS result submitted."
  },
  {
    id: "AUD-0089",
    timestamp: "2026-08-28T09:45:00Z",
    actorName: "Priya Sharma",
    actorRole: "LMO",
    action: "INSPECTION_SCHEDULED",
    entityType: "Application",
    entityId: "APP-2026-00041",
    previousState: "ASSIGNED",
    newState: "SCHEDULED",
    metadata: "Scheduled appointment date: 2026-08-30."
  },
  {
    id: "AUD-0088",
    timestamp: "2026-08-27T16:20:00Z",
    actorName: "System",
    actorRole: "System",
    action: "CERTIFICATE_STAMPED_ON_CHAIN",
    entityType: "Certificate",
    entityId: "CERT-2026-000004",
    previousState: "GENERATED",
    newState: "STAMPED",
    metadata: "Transaction hash 0x7c9a5b3f2e1d0c8b6a4f2e0d8c6b4a2f0e8d6c4b anchored on Sepolia."
  }
];
export const mockAdminUsers = [
  { id: "USR-0001", name: "Sunita Patil", email: "sunita@lmverify.gov.in", phone: "+91 22 2202 4432", role: "admin", organisation: "LM Verify Platform Administration", status: "Active", createdAt: "2024-01-10T12:00:00Z", lastLogin: "2026-08-30T10:00:00Z" },
  { id: "USR-0002", name: "Priya Sharma", email: "priya@lmo-pune.gov.in", phone: "+91 99887 66551", role: "lmo", organisation: "Pune East Division", status: "Active", createdAt: "2024-05-12T11:00:00Z", lastLogin: "2026-08-29T14:20:00Z" },
  { id: "USR-0003", name: "Anand Verma", email: "anand@nablgatc.in", phone: "+91 98765 43210", role: "gatc", organisation: "NABL Approved Test Centre, Pune", status: "Active", createdAt: "2024-06-15T09:00:00Z", lastLogin: "2026-08-30T09:30:00Z" },
  { id: "USR-0004", name: "Rahul Kadam", email: "pune@steelindia.com", phone: "+91 91234 56789", role: "business", organisation: "Steel India Ltd.", status: "Active", createdAt: "2025-02-10T14:00:00Z", lastLogin: "2026-08-28T16:15:00Z" },
  { id: "USR-0005", name: "Sameer Shah", email: "info@sahayadri.in", phone: "+91 99887 76655", role: "business", organisation: "Sahayadri Logistics Ltd.", status: "Suspended", createdAt: "2025-03-05T10:00:00Z", lastLogin: "2026-08-20T11:00:00Z" },
  { id: "USR-0006", name: "Arun Mehta", email: "arun@lmo-pune.gov.in", phone: "+91 99887 66552", role: "lmo", organisation: "Pune South Division", status: "Active", createdAt: "2024-05-20T10:00:00Z", lastLogin: "2026-08-28T15:00:00Z" },
  { id: "USR-0007", name: "Vikram Sarabhai", email: "vikram@mumbaimetrology.in", phone: "+91 22 2568 9012", role: "gatc", organisation: "Mumbai Metrology Lab", status: "Inactive", createdAt: "2024-11-01T08:00:00Z", lastLogin: "2026-08-01T12:00:00Z" }
];

export const mockAdminBusinesses = [
  { id: "BUS-0001", businessName: "Steel India Ltd.", contactPerson: "Rahul Kadam", email: "pune@steelindia.com", phone: "+91 91234 56789", registrationStatus: "Approved", status: "Active", applicationsCount: 12, instrumentsCount: 8, certificatesCount: 6 },
  { id: "BUS-0002", businessName: "Sahayadri Logistics Ltd.", contactPerson: "Sameer Shah", email: "info@sahayadri.in", phone: "+91 99887 76655", registrationStatus: "Under Review", status: "Suspended", applicationsCount: 4, instrumentsCount: 3, certificatesCount: 2 },
  { id: "BUS-0003", businessName: "Reliable Scales Co.", contactPerson: "Mahesh Bhatt", email: "mahesh@reliablescales.com", phone: "+91 92223 34455", registrationStatus: "Approved", status: "Active", applicationsCount: 18, instrumentsCount: 12, certificatesCount: 10 }
];

export const mockAdminSecurityLogs = [
  { id: "SEC-009", timestamp: "2026-08-30T10:15:00Z", actorId: "USR-0005", actorRole: "business", action: "FAILED_LOGIN_ATTEMPT", detail: "Suspended user tried to authenticate. Origin IP: 192.168.1.45" },
  { id: "SEC-008", timestamp: "2026-08-29T18:40:00Z", actorId: "USR-0004", actorRole: "business", action: "UNAUTHORIZED_API_ACCESS", detail: "Attempted to access LMO-specific endpoints: GET /api/lmo/inspections" },
  { id: "SEC-007", timestamp: "2026-08-29T16:22:00Z", actorId: "LMO-MH-44012", actorRole: "lmo", action: "PASSWORD_CHANGED", detail: "Officer Priya Sharma updated credentials successfully." }
];

export const mockAdminSystemSettings = {
  general: {
    systemName: "LM Verify Platform",
    environment: "Production",
    sessionTimeout: "30 minutes"
  },
  workflow: {
    autoAssignEnabled: false,
    nablComplianceRequired: true,
    verificationWindowDays: 30
  },
  notifications: {
    emailAlerts: true,
    smsAlerts: false,
    securityAlertsEnabled: true
  },
  security: {
    maxLoginAttempts: 5,
    minPasswordLength: 8,
    mfaRequired: true
  }
};

export const mockAdminSyncOperations = [
  { id: "OP-9901", inspectionId: "INS-2026-000321", actorName: "Priya Sharma", actorRole: "LMO", createdTime: "2026-08-30T09:45:00Z", syncTime: "2026-08-30T10:00:00Z", syncStatus: "SYNCED", version: 2, integrityStatus: "PASSED" },
  { id: "OP-9902", inspectionId: "TEST-2026-000109", actorName: "Anand Verma", actorRole: "GATC", createdTime: "2026-08-30T09:50:00Z", syncTime: "2026-08-30T10:05:00Z", syncStatus: "CONFLICT", version: 3, integrityStatus: "PASSED", conflictDetails: { localVersion: 7, serverVersion: 8, status: "REQUIRES_REVIEW", fields: [{ field: "observedValue", localValue: "1000.8", serverValue: "1000.0" }] } },
  { id: "OP-9903", inspectionId: "INS-2026-000322", actorName: "Priya Sharma", actorRole: "LMO", createdTime: "2026-08-30T09:55:00Z", syncTime: "2026-08-30T10:10:00Z", syncStatus: "INTEGRITY_WARNING", version: 1, integrityStatus: "FAILED", integrityWarningDetails: { reason: "Evidence image payload cryptographic signature mismatch (tampering suspected).", timestamp: "2026-08-30T10:10:00Z" } },
  { id: "OP-9904", inspectionId: "INS-2026-000323", actorName: "Arun Mehta", actorRole: "LMO", createdTime: "2026-08-30T10:00:00Z", syncTime: "—", syncStatus: "PENDING_SYNC", version: 1, integrityStatus: "PENDING" },
  { id: "OP-9905", inspectionId: "INS-2026-000324", actorName: "Priya Sharma", actorRole: "LMO", createdTime: "2026-08-30T10:05:00Z", syncTime: "—", syncStatus: "SYNC_FAILED", version: 2, integrityStatus: "PASSED", failureReason: "Network timeout during large evidence binary upload payload handshake." }
];

export default {
  mockAdminStats,
  mockAdminProfile,
  mockAdminOfficers,
  mockAdminGatcs,
  mockAdminJurisdictions,
  mockAdminAuditLogs,
  mockAdminUsers,
  mockAdminBusinesses,
  mockAdminSecurityLogs,
  mockAdminSystemSettings,
  mockAdminSyncOperations
};
