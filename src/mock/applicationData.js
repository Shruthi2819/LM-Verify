/**
 * Mock application data — mirrors expected API response shape from FastAPI.
 */

export const mockApplications = [
  {
    id: "APP-2026-00043",
    instrumentId: "INS-2026-00001",
    instrumentName: "Digital Weighing Scale (150 kg)",
    instrumentSerial: "MT-2024-AB1234",
    type: "Re-verification",
    submittedDate: "2026-08-20",
    status: "UNDER_REVIEW",
    assignedOfficer: null,
    scheduledDate: null,
    completedDate: null,
    notes: "Annual re-verification required",
    documents: [
      { id: "doc-001", name: "Previous Certificate.pdf", size: "245 KB", uploadedAt: "2026-08-20", status: "Uploaded" },
      { id: "doc-002", name: "Instrument Photos.jpg", size: "1.2 MB", uploadedAt: "2026-08-20", status: "Uploaded" },
    ],
    timeline: [
      { status: "SUBMITTED", label: "Application Submitted", date: "2026-08-20", done: true },
      { status: "UNDER_REVIEW", label: "Documents Under Review", date: "2026-08-21", done: true },
      { status: "ASSIGNED", label: "Officer Assigned", date: null, done: false },
      { status: "SCHEDULED", label: "Inspection Scheduled", date: null, done: false },
      { status: "INSPECTION_COMPLETED", label: "Inspection Completed", date: null, done: false },
      { status: "CERTIFICATE_GENERATED", label: "Certificate Issued", date: null, done: false },
    ],
  },
  {
    id: "APP-2026-00041",
    instrumentId: "INS-2026-00002",
    instrumentName: "Platform Scale (500 kg)",
    instrumentSerial: "AWT-2023-XY5678",
    type: "Verification",
    submittedDate: "2026-08-15",
    status: "SCHEDULED",
    assignedOfficer: "Off. Priya Sharma",
    scheduledDate: "2026-08-30",
    completedDate: null,
    notes: "",
    documents: [
      { id: "doc-003", name: "Purchase Invoice.pdf", size: "180 KB", uploadedAt: "2026-08-15", status: "Uploaded" },
    ],
    timeline: [
      { status: "SUBMITTED", label: "Application Submitted", date: "2026-08-15", done: true },
      { status: "UNDER_REVIEW", label: "Documents Under Review", date: "2026-08-16", done: true },
      { status: "ASSIGNED", label: "Officer Assigned", date: "2026-08-18", done: true },
      { status: "SCHEDULED", label: "Inspection Scheduled", date: "2026-08-22", done: true },
      { status: "INSPECTION_COMPLETED", label: "Inspection Completed", date: null, done: false },
      { status: "CERTIFICATE_GENERATED", label: "Certificate Issued", date: null, done: false },
    ],
  },
  {
    id: "APP-2026-00038",
    instrumentId: "INS-2026-00003",
    instrumentName: "Petrol Pump Meter",
    instrumentSerial: "TT-2025-CD9012",
    type: "Verification",
    submittedDate: "2026-02-10",
    status: "CERTIFICATE_GENERATED",
    assignedOfficer: "Off. Arun Mehta",
    scheduledDate: "2026-02-18",
    completedDate: "2026-02-20",
    notes: "",
    certificateId: "CERT-2026-000007",
    certificateExpiry: "2026-09-15",
    documents: [
      { id: "doc-004", name: "Type Approval Certificate.pdf", size: "320 KB", uploadedAt: "2026-02-10", status: "Uploaded" },
    ],
    timeline: [
      { status: "SUBMITTED", label: "Application Submitted", date: "2026-02-10", done: true },
      { status: "UNDER_REVIEW", label: "Documents Under Review", date: "2026-02-11", done: true },
      { status: "ASSIGNED", label: "Officer Assigned", date: "2026-02-13", done: true },
      { status: "SCHEDULED", label: "Inspection Scheduled", date: "2026-02-15", done: true },
      { status: "INSPECTION_COMPLETED", label: "Inspection Completed", date: "2026-02-20", done: true },
      { status: "CERTIFICATE_GENERATED", label: "Certificate Issued", date: "2026-02-22", done: true },
    ],
  },
  {
    id: "APP-2026-00029",
    instrumentId: "INS-2026-00004",
    instrumentName: "Water Flow Meter",
    instrumentSerial: "SI-2024-EF3456",
    type: "Verification",
    submittedDate: "2026-08-10",
    status: "REJECTED",
    assignedOfficer: "Off. Priya Sharma",
    scheduledDate: "2026-08-22",
    completedDate: "2026-08-25",
    notes: "New industrial feedline installation testing",
    rejectionReason: "Calibration tolerances exceeded standard permissible thresholds.",
    rejectionRemarks: "Visual checking showed calibration seal wire is broken, and observed flow output showed drift of +1.85% under standard load test checks.",
    rejectedDate: "2026-08-25",
    documents: [
      { id: "doc-005", name: "Flow calibration data.pdf", size: "112 KB", uploadedAt: "2026-08-10", status: "Uploaded" }
    ],
    timeline: [
      { status: "SUBMITTED", label: "Application Submitted", date: "2026-08-10", done: true },
      { status: "UNDER_REVIEW", label: "Documents Under Review", date: "2026-08-12", done: true },
      { status: "ASSIGNED", label: "Officer Assigned", date: "2026-08-15", done: true },
      { status: "SCHEDULED", label: "Inspection Scheduled", date: "2026-08-22", done: true },
      { status: "REJECTED", label: "Application Rejected", date: "2026-08-25", done: true }
    ]
  }
];

export const mockApplicationStats = {
  total: 12,
  submitted: 2,
  underReview: 1,
  scheduled: 1,
  completed: 7,
  rejected: 1,
};
