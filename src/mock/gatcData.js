/**
 * Mock GATC data for GATC / Approved Test Centre workflow.
 */

export const mockGatcStats = [
  { label: "Assigned Applications", value: 8, change: "+1 today", trend: "up" },
  { label: "Pending Tests", value: 3, change: "Awaiting schedule", trend: "neutral" },
  { label: "Tests In Progress", value: 2, change: "Active lab test", trend: "up" },
  { label: "Completed Tests", value: 54, change: "All time", trend: "up" }
];

export const mockGatcProfile = {
  name: "NABL Approved Test Centre, Pune",
  centreId: "GATC-PN-88210",
  email: "contact@nablgatc.in",
  phone: "+91 20 2568 9012",
  department: "National Accreditation Board for Testing and Calibration Laboratories (NABL)",
  designation: "Approved Calibration Centre",
  jurisdiction: "Pune District, Zone A, Maharashtra",
  accreditationNumber: "NABL-C-1294",
  accreditationExpiry: "2029-05-31",
  labManager: "Anand Verma"
};

export const mockGatcApplications = [
  {
    id: "APP-2026-00051",
    businessName: "Sahayadri Logistics Ltd.",
    businessEmail: "info@sahayadri.in",
    businessPhone: "+91 99887 76655",
    businessAddress: "Sector 18, Hinjewadi Phase III, Pune, Maharashtra - 411057",
    instrumentId: "INS-2026-00005",
    instrumentName: "Weighbridge",
    instrumentSerial: "WB-2024-XY990",
    instrumentModel: "WB-50T",
    instrumentManufacturer: "Avery India",
    capacity: "50 t",
    unit: "t",
    accuracyClass: "Class IIII",
    category: "Weighing Instrument",
    purchaseDate: "2024-05-15",
    installationAddress: "Hinjewadi Weighbridge Terminal, Pune",
    previousCertificate: "CERT-2025-000099",
    type: "Re-verification",
    submittedDate: "2026-08-22",
    status: "UNDER_REVIEW",
    assignedOfficer: "Anand Verma (GATC)",
    scheduledDate: null,
    documents: [
      { id: "doc-101", name: "OIML Type Approval.pdf", size: "410 KB", uploadedAt: "2026-08-22" }
    ],
    timeline: [
      { status: "SUBMITTED", label: "Application Submitted", date: "2026-08-22", done: true },
      { status: "UNDER_REVIEW", label: "Documents Under Review", date: "2026-08-23", done: true },
      { status: "ASSIGNED", label: "Centre Assigned", date: "2026-08-24", done: true },
      { status: "SCHEDULED", label: "Testing Scheduled", date: null, done: false },
      { status: "INSPECTION_COMPLETED", label: "Testing Completed", date: null, done: false },
      { status: "CERTIFICATE_GENERATED", label: "Certificate Issued", date: null, done: false }
    ]
  },
  {
    id: "APP-2026-00052",
    businessName: "Steel India Ltd.",
    businessEmail: "pune@steelindia.com",
    businessPhone: "+91 91234 56789",
    businessAddress: "Plot 42, Bhosari Industrial Estate, Pune, Maharashtra - 411026",
    instrumentId: "INS-2026-00006",
    instrumentName: "Platform Scale",
    instrumentSerial: "PS-2023-WB001",
    instrumentModel: "ZM305",
    instrumentManufacturer: "Avery Weigh-Tronix",
    capacity: "1000 kg",
    unit: "kg",
    accuracyClass: "Class III",
    category: "Weighing Instrument",
    purchaseDate: "2023-02-10",
    installationAddress: "Raw Material Warehouse, Bhosari",
    previousCertificate: null,
    type: "Verification",
    submittedDate: "2026-08-20",
    status: "SCHEDULED",
    assignedOfficer: "Anand Verma (GATC)",
    scheduledDate: "2026-09-02",
    documents: [
      { id: "doc-102", name: "Purchase Invoice.pdf", size: "145 KB", uploadedAt: "2026-08-20" }
    ],
    timeline: [
      { status: "SUBMITTED", label: "Application Submitted", date: "2026-08-20", done: true },
      { status: "UNDER_REVIEW", label: "Documents Under Review", date: "2026-08-21", done: true },
      { status: "ASSIGNED", label: "Centre Assigned", date: "2026-08-23", done: true },
      { status: "SCHEDULED", label: "Testing Scheduled", date: "2026-08-25", done: true },
      { status: "INSPECTION_COMPLETED", label: "Testing Completed", date: null, done: false },
      { status: "CERTIFICATE_GENERATED", label: "Certificate Issued", date: null, done: false }
    ]
  }
];

export const mockGatcInspections = [
  {
    id: "TEST-2026-000109",
    applicationId: "APP-2026-00052",
    businessName: "Steel India Ltd.",
    instrumentName: "Platform Scale",
    instrumentSerial: "PS-2023-WB001",
    instrumentId: "INS-2026-00006",
    scheduledDate: "2026-09-02",
    scheduledTime: "11:00 AM",
    status: "SCHEDULED",
    location: "Raw Material Warehouse, Bhosari",
    checklist: [
      { id: "gcl-1", label: "NABL standard reference calibration check", value: "" },
      { id: "gcl-2", label: "Platform levelling and balance verified", value: "" },
      { id: "gcl-3", label: "Physical stamping location verification", value: "" },
      { id: "gcl-4", label: "Environmental test conditions met", value: "" }
    ],
    measurements: [
      { id: "gm-1", testName: "Zero Balance calibration", standardValue: 0, observedValue: null, error: null, result: "" },
      { id: "gm-2", testName: "Half Capacity standard weights test", standardValue: 500, observedValue: null, error: null, result: "" },
      { id: "gm-3", testName: "Full Capacity standard weights test", standardValue: 1000, observedValue: null, error: null, result: "" }
    ],
    photos: [],
    remarks: "",
    result: "" // PASS, FAIL
  }
];

export const mockGatcReports = [
  {
    id: "REP-2026-000087",
    applicationId: "APP-2026-00052",
    businessName: "Steel India Ltd.",
    instrumentName: "Platform Scale",
    instrumentSerial: "PS-2023-WB001",
    testDate: "2026-08-25",
    result: "PASS",
    risk: "LOW",
    status: "APPROVED",
    submittedDate: "2026-08-25",
    remarks: "NABL parameters verified successfully. Sealing wire intact.",
    checklist: [
      { id: "gcl-1", label: "NABL standard reference calibration check", value: "PASS" },
      { id: "gcl-2", label: "Platform levelling and balance verified", value: "PASS" }
    ],
    measurements: [
      { id: "gm-1", testName: "Zero Balance calibration", standardValue: 0, observedValue: 0, error: 0, result: "PASS" }
    ],
    photos: [{ id: "img-prev-1", name: "device_scale.jpg" }],
    gps: { lat: "18.6254", lng: "73.8052", timestamp: "2026-08-25T11:00:00Z" },
    signatureStatus: "Signed",
    blockchainStatus: "ANCHORED",
    blockchainTx: "0x3a7f9d2e1b4c8a6f0e5d3b2a1c9f7e8d4b6a2c0f",
    blockchainHash: "0x3a7f9d2e1b4c8a6f0e5d3b2a1c9f7e8d4b6a2c0f"
  }
];

export const mockGatcAiInsights = {
  stats: {
    totalAlerts: 4,
    highRisk: 1,
    mediumRisk: 2,
    lowRisk: 1,
    resolvedAlerts: 15
  },
  alerts: [
    {
      id: "alert-001",
      task: "APP-2026-00052",
      type: "Measurement Anomaly",
      risk: "HIGH",
      confidence: 89,
      reason: "Calibration observed value at full capacity deviates beyond Class III maximum permissible error limits.",
      todo: "Inspect structural load-cell points for physical contact, and re-record numerical readings.",
      status: "OPEN"
    },
    {
      id: "alert-002",
      task: "APP-2026-00051",
      type: "Tamper Evidence Warning",
      risk: "MEDIUM",
      confidence: 76,
      reason: "No lead wire seal photos attached to the evidence upload slots.",
      todo: "Capture a close-up photograph of the stamping lead wire seal node.",
      status: "OPEN"
    }
  ]
};
