/**
 * Mock dashboard data for Part 1 UI development.
 * Replace each dataset with API responses in Part 2.
 */

export const businessStats = [
  { label: "Total Instruments", value: 14, change: "+2 this month", trend: "up" },
  { label: "Pending Applications", value: 3, change: "Awaiting review", trend: "neutral" },
  { label: "Verified Instruments", value: 9, change: "Up to date", trend: "up" },
  { label: "Expiring Soon", value: 2, change: "Within 30 days", trend: "down" },
];

export const businessApplications = [
  {
    id: "APP-2026-00043",
    instrument: "Digital Weighing Scale (50 kg)",
    type: "Verification",
    submitted: "2026-08-20",
    status: "Under Review",
  },
  {
    id: "APP-2026-00041",
    instrument: "Platform Scale (500 kg)",
    type: "Re-verification",
    submitted: "2026-08-15",
    status: "Scheduled",
  },
  {
    id: "APP-2026-00038",
    instrument: "Petrol Pump Meter",
    type: "Verification",
    submitted: "2026-08-10",
    status: "Verified",
  },
  {
    id: "APP-2026-00030",
    instrument: "Water Flow Meter",
    type: "Verification",
    submitted: "2026-07-28",
    status: "Rejected",
  },
];

export const businessExpiry = [
  {
    id: "CERT-2026-000007",
    instrument: "Digital Weighing Scale (20 kg)",
    expires: "2026-09-15",
    daysLeft: 18,
  },
  {
    id: "CERT-2026-000004",
    instrument: "Gas Meter (Industrial)",
    expires: "2026-09-28",
    daysLeft: 31,
  },
];

// ─── LMO ────────────────────────────────────────────────────────────────────

export const lmoStats = [
  { label: "Assigned Applications", value: 18, change: "Pending action", trend: "neutral" },
  { label: "Pending Inspections", value: 7, change: "This week", trend: "neutral" },
  { label: "Today's Inspections", value: 3, change: "Scheduled", trend: "neutral" },
  { label: "Completed Verifications", value: 142, change: "All time", trend: "up" },
];

export const lmoSchedule = [
  {
    id: "INS-2026-00021",
    business: "Acme Weighing Solutions",
    instrument: "Weighbridge (40T)",
    time: "09:30 AM",
    location: "Pune Industrial Estate",
    status: "Scheduled",
  },
  {
    id: "INS-2026-00022",
    business: "Fresh Dairy Products",
    instrument: "Milk Meter",
    time: "11:00 AM",
    location: "Nashik Road",
    status: "Scheduled",
  },
  {
    id: "INS-2026-00023",
    business: "Maharashtra Fuel Station",
    instrument: "Petrol Pump Meter",
    time: "02:30 PM",
    location: "Aurangabad Highway",
    status: "Scheduled",
  },
];

export const lmoPendingApplications = [
  { id: "APP-2026-00043", business: "Rajesh Enterprises", instrument: "Digital Scale (50kg)", submitted: "2026-08-20", priority: "Normal" },
  { id: "APP-2026-00040", business: "MH Gas Distributors", instrument: "Gas Meter", submitted: "2026-08-18", priority: "High" },
  { id: "APP-2026-00039", business: "City Water Works", instrument: "Water Flow Meter", submitted: "2026-08-17", priority: "Normal" },
];

// ─── GATC ────────────────────────────────────────────────────────────────────

export const gatcStats = [
  { label: "Assigned Tasks", value: 11, change: "Active", trend: "neutral" },
  { label: "Pending Tests", value: 4, change: "Awaiting results", trend: "neutral" },
  { label: "Completed Tests", value: 87, change: "All time", trend: "up" },
  { label: "Reports Submitted", value: 83, change: "All time", trend: "up" },
];

export const gatcTasks = [
  { id: "TASK-2026-0034", instrument: "Weighbridge (60T)", business: "Sahayadri Logistics", assignedDate: "2026-08-22", status: "Pending" },
  { id: "TASK-2026-0033", instrument: "Platform Scale (1000kg)", business: "Steel India Ltd.", assignedDate: "2026-08-20", status: "In Progress" },
  { id: "TASK-2026-0031", instrument: "Electricity Meter (3-phase)", business: "Indus Power Corp.", assignedDate: "2026-08-18", status: "Completed" },
];

// ─── Admin ───────────────────────────────────────────────────────────────────

export const adminStats = [
  { label: "Total Users", value: 1284, change: "+48 this month", trend: "up" },
  { label: "Total Instruments", value: 8632, change: "+312 this month", trend: "up" },
  { label: "Pending Applications", value: 147, change: "Needs attention", trend: "neutral" },
  { label: "Verified Instruments", value: 7410, change: "85.8% verified", trend: "up" },
  { label: "Expired Certificates", value: 203, change: "Renewal needed", trend: "down" },
  { label: "Active Officers", value: 94, change: "Field operational", trend: "up" },
  { label: "Active GATCs", value: 12, change: "Across 8 districts", trend: "up" },
  { label: "Audit Events", value: 25641, change: "Last 30 days", trend: "neutral" },
];

export const adminRecentActivity = [
  { type: "Certificate Issued", user: "Rajesh Kumar", target: "CERT-2026-000051", time: "2 min ago" },
  { type: "Application Submitted", user: "MH Gas Distributors", target: "APP-2026-00048", time: "15 min ago" },
  { type: "Inspection Completed", user: "Off. Priya Sharma", target: "INS-2026-00026", time: "1 hr ago" },
  { type: "User Registered", user: "Anand Steel Works", target: "usr-1284", time: "3 hrs ago" },
  { type: "Certificate Expired", user: "System", target: "CERT-2025-000412", time: "5 hrs ago" },
];
