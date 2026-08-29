/**
 * Mock LMO data for Legal Metrology Officer (LMO) module.
 */

export const mockLmoStats = [
  { label: "Assigned Applications", value: 12, change: "+2 this week", trend: "up" },
  { label: "Pending Reviews", value: 5, change: "Awaiting schedule", trend: "neutral" },
  { label: "Today's Inspections", value: 3, change: "Scheduled", trend: "up" },
  { label: "Completed Inspections", value: 89, change: "All time", trend: "up" }
];

export const mockLmoProfile = {
  name: "Priya Sharma",
  officerId: "LMO-MH-44012",
  email: "priya.sharma@lmo.gov.in",
  phone: "+91 90123 45678",
  department: "Legal Metrology Department",
  designation: "Legal Metrology Officer",
  jurisdiction: "Pune East Division, Maharashtra",
  joiningDate: "2022-04-15"
};

export const mockLmoApplications = [
  {
    id: "APP-2026-00043",
    businessName: "Acme Weighing Solutions Pvt. Ltd.",
    businessEmail: "rajesh@acmescales.in",
    businessPhone: "+91 98765 43210",
    businessAddress: "Unit 4, MIDC Industrial Area, Pune, Maharashtra - 411019",
    instrumentId: "INS-2026-00001",
    instrumentName: "Digital Weighing Scale",
    instrumentSerial: "MT-2024-AB1234",
    instrumentModel: "ICS465",
    instrumentManufacturer: "Mettler Toledo",
    capacity: "150 kg",
    unit: "kg",
    accuracyClass: "Class III",
    category: "Weighing Instrument",
    purchaseDate: "2024-03-10",
    installationAddress: "Unit 4, MIDC Industrial Area, Pune",
    previousCertificate: "CERT-2026-000007",
    type: "Re-verification",
    submittedDate: "2026-08-20",
    status: "UNDER_REVIEW",
    assignedOfficer: "Priya Sharma",
    scheduledDate: null,
    documents: [
      { id: "doc-001", name: "Previous Certificate.pdf", size: "245 KB", uploadedAt: "2026-08-20" },
      { id: "doc-002", name: "Instrument Photos.jpg", size: "1.2 MB", uploadedAt: "2026-08-20" }
    ],
    timeline: [
      { status: "SUBMITTED", label: "Application Submitted", date: "2026-08-20", done: true },
      { status: "UNDER_REVIEW", label: "Documents Under Review", date: "2026-08-21", done: true },
      { status: "ASSIGNED", label: "Officer Assigned", date: "2026-08-22", done: true },
      { status: "SCHEDULED", label: "Inspection Scheduled", date: null, done: false },
      { status: "INSPECTION_COMPLETED", label: "Inspection Completed", date: null, done: false },
      { status: "CERTIFICATE_GENERATED", label: "Certificate Issued", date: null, done: false }
    ]
  },
  {
    id: "APP-2026-00041",
    businessName: "Acme Weighing Solutions Pvt. Ltd.",
    businessEmail: "rajesh@acmescales.in",
    businessPhone: "+91 98765 43210",
    businessAddress: "Unit 4, MIDC Industrial Area, Pune, Maharashtra - 411019",
    instrumentId: "INS-2026-00002",
    instrumentName: "Platform Scale",
    instrumentSerial: "AWT-2023-XY5678",
    instrumentModel: "ZM305",
    instrumentManufacturer: "Avery Weigh-Tronix",
    capacity: "500 kg",
    unit: "kg",
    accuracyClass: "Class III",
    category: "Weighing Instrument",
    purchaseDate: "2023-11-22",
    installationAddress: "Plot 12, Bhosari Industrial Estate, Pune",
    previousCertificate: null,
    type: "Verification",
    submittedDate: "2026-08-15",
    status: "SCHEDULED",
    assignedOfficer: "Priya Sharma",
    scheduledDate: "2026-08-30",
    documents: [
      { id: "doc-003", name: "Purchase Invoice.pdf", size: "180 KB", uploadedAt: "2026-08-15" }
    ],
    timeline: [
      { status: "SUBMITTED", label: "Application Submitted", date: "2026-08-15", done: true },
      { status: "UNDER_REVIEW", label: "Documents Under Review", date: "2026-08-16", done: true },
      { status: "ASSIGNED", label: "Officer Assigned", date: "2026-08-18", done: true },
      { status: "SCHEDULED", label: "Inspection Scheduled", date: "2026-08-22", done: true },
      { status: "INSPECTION_COMPLETED", label: "Inspection Completed", date: null, done: false },
      { status: "CERTIFICATE_GENERATED", label: "Certificate Issued", date: null, done: false }
    ]
  },
  {
    id: "APP-2026-00030",
    businessName: "Acme Weighing Solutions Pvt. Ltd.",
    businessEmail: "rajesh@acmescales.in",
    businessPhone: "+91 98765 43210",
    businessAddress: "Unit 4, MIDC Industrial Area, Pune, Maharashtra - 411019",
    instrumentId: "INS-2026-00004",
    instrumentName: "Water Flow Meter",
    instrumentSerial: "SI-2024-EF3456",
    instrumentModel: "SITRANS FM MAG 5100W",
    instrumentManufacturer: "Siemens",
    capacity: "50 m³/h",
    unit: "m³",
    accuracyClass: "Class M2",
    category: "Flow Meter",
    purchaseDate: "2024-06-30",
    installationAddress: "Processing Unit A, Bhosari, Pune",
    previousCertificate: "CERT-2025-000021",
    type: "Verification",
    submittedDate: "2026-07-28",
    status: "REJECTED",
    assignedOfficer: "Priya Sharma",
    scheduledDate: "2026-08-05",
    rejectionReason: "Sealing condition is broken and has failed performance testing.",
    documents: [
      { id: "doc-004", name: "Type Approval Certificate.pdf", size: "320 KB", uploadedAt: "2026-07-28" }
    ],
    timeline: [
      { status: "SUBMITTED", label: "Application Submitted", date: "2026-07-28", done: true },
      { status: "UNDER_REVIEW", label: "Documents Under Review", date: "2026-07-29", done: true },
      { status: "ASSIGNED", label: "Officer Assigned", date: "2026-07-30", done: true },
      { status: "SCHEDULED", label: "Inspection Scheduled", date: "2026-08-01", done: true },
      { status: "INSPECTION_COMPLETED", label: "Inspection Completed", date: "2026-08-05", done: true },
      { status: "REJECTED", label: "Application Rejected", date: "2026-08-06", done: true }
    ]
  }
];

export const mockLmoInspections = [
  {
    id: "INS-2026-000321",
    applicationId: "APP-2026-00041",
    businessName: "Acme Weighing Solutions Pvt. Ltd.",
    instrumentName: "Platform Scale",
    instrumentSerial: "AWT-2023-XY5678",
    instrumentId: "INS-2026-00002",
    scheduledDate: "2026-08-30",
    scheduledTime: "10:30 AM",
    status: "SCHEDULED", // SCHEDULED, IN_PROGRESS, COMPLETED
    location: "Plot 12, Bhosari Industrial Estate, Pune",
    checklist: [
      { id: "cl-1", label: "Physical Condition check", value: "" },
      { id: "cl-2", label: "Identification Markings legible", value: "" },
      { id: "cl-3", label: "Manufacturer plate matches master details", value: "" },
      { id: "cl-4", label: "Sealing integrity intact", value: "" },
      { id: "cl-5", label: "Required specifications sheet present", value: "" }
    ],
    measurements: [
      { id: "m-1", testName: "Zero Load Calibration", standardValue: 0, observedValue: null, error: null, result: "" },
      { id: "m-2", testName: "Half Capacity Verification", standardValue: 250, observedValue: null, error: null, result: "" },
      { id: "m-3", testName: "Full Capacity Load", standardValue: 500, observedValue: null, error: null, result: "" }
    ],
    photos: [],
    remarks: "",
    result: "" // PASS, FAIL
  },
  {
    id: "INS-2026-000298",
    applicationId: "APP-2026-00030",
    businessName: "Acme Weighing Solutions Pvt. Ltd.",
    instrumentName: "Water Flow Meter",
    instrumentSerial: "SI-2024-EF3456",
    instrumentId: "INS-2026-00004",
    scheduledDate: "2026-08-05",
    scheduledTime: "11:00 AM",
    status: "COMPLETED",
    location: "Processing Unit A, Bhosari, Pune",
    checklist: [
      { id: "cl-1", label: "Physical Condition check", value: "PASS" },
      { id: "cl-2", label: "Identification Markings legible", value: "PASS" },
      { id: "cl-3", label: "Manufacturer plate matches master details", value: "PASS" },
      { id: "cl-4", label: "Sealing integrity intact", value: "FAIL" },
      { id: "cl-5", label: "Required specifications sheet present", value: "PASS" }
    ],
    measurements: [
      { id: "m-1", testName: "Zero Load Calibration", standardValue: 0, observedValue: 0.1, error: 0.1, result: "PASS" },
      { id: "m-2", testName: "Half Capacity Verification", standardValue: 25, observedValue: 25.4, error: 0.4, result: "PASS" },
      { id: "m-3", testName: "Full Capacity Load", standardValue: 50, observedValue: 50.8, error: 0.8, result: "FAIL" }
    ],
    photos: [],
    remarks: "Sealing conditions failed. Tolerances exceeded permissible limits under high loads.",
    result: "FAIL"
  }
];
