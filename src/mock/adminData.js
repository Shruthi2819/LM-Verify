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
export default {
  mockAdminStats,
  mockAdminProfile,
  mockAdminOfficers,
  mockAdminGatcs,
  mockAdminJurisdictions,
  mockAdminAuditLogs
};
