/**
 * Mock Evidence Chain Dataset for Tamper-Evident Verification
 */
import { computeChainedEvidenceHashes } from "../utils/crypto.js";

// Base stage payloads for sample records
const chain1Stages = {
  application: {
    applicationId: "APP-2026-00041",
    businessName: "Acme Weighing Solutions Pvt. Ltd.",
    businessEmail: "rajesh@acmescales.in",
    instrumentId: "INS-2026-00002",
    instrumentName: "Platform Scale",
    instrumentSerial: "AWT-2023-XY5678",
    capacity: "500 kg",
    submittedDate: "2026-08-15"
  },
  assignment: {
    applicationId: "APP-2026-00041",
    assignedOfficer: "Priya Sharma",
    officerRole: "LMO",
    jurisdiction: "Pune East Division",
    assignedDate: "2026-08-18"
  },
  inspection: {
    inspectionId: "INS-2026-000321",
    applicationId: "APP-2026-00041",
    scheduledDate: "2026-08-30",
    scheduledTime: "10:30 AM",
    location: "Plot 12, Bhosari Industrial Estate, Pune",
    checklist: [
      { id: "cl-1", label: "Physical Condition check", value: "PASS" },
      { id: "cl-2", label: "Identification Markings legible", value: "PASS" },
      { id: "cl-3", label: "Manufacturer plate matches master details", value: "PASS" },
      { id: "cl-4", label: "Sealing integrity intact", value: "PASS" },
      { id: "cl-5", label: "Required specifications sheet present", value: "PASS" }
    ]
  },
  measurements: {
    inspectionId: "INS-2026-000321",
    readings: [
      { id: "m-1", testName: "Zero Load Calibration", standardValue: 0, observedValue: 0.0, error: 0.0, result: "PASS" },
      { id: "m-2", testName: "Half Capacity Verification", standardValue: 250, observedValue: 250.0, error: 0.0, result: "PASS" },
      { id: "m-3", testName: "Full Capacity Load", standardValue: 500, observedValue: 499.9, error: -0.1, result: "PASS" }
    ]
  },
  evidence: {
    inspectionId: "INS-2026-000321",
    photos: [
      { id: "photo-01", label: "Instrument Nameplate", hash: "a3f89e21d5c7b41098ef01bc", timestamp: "2026-08-30T10:45:00Z" },
      { id: "photo-02", label: "Zero Calibration Reading", hash: "7c12b9a4d8ef309812ac56fe", timestamp: "2026-08-30T10:52:00Z" },
      { id: "photo-03", label: "Full Capacity Weight Display", hash: "e90812ab34cd56ef78901234", timestamp: "2026-08-30T11:05:00Z" },
      { id: "photo-04", label: "Official Verification Seal", hash: "543210fe98dc76ba543210fe", timestamp: "2026-08-30T11:15:00Z" }
    ],
    aiConfirmations: [
      { type: "OCR_SERIAL_MATCH", extractedSerial: "AWT-2023-XY5678", confidence: 0.99, confirmedByLMO: true }
    ]
  },
  locationTime: {
    inspectionId: "INS-2026-000321",
    startedAt: "2026-08-30T10:30:00Z",
    completedAt: "2026-08-30T11:20:00Z",
    locationContext: "Plot 12, Bhosari Industrial Estate, Pune"
  },
  decision: {
    inspectionId: "INS-2026-000321",
    result: "PASS",
    remarks: "Instrument meets all maximum permissible error (MPE) thresholds for Class III commercial scale.",
    decidedBy: "Priya Sharma (LMO)",
    decidedAt: "2026-08-30T11:22:00Z"
  },
  approval: {
    applicationId: "APP-2026-00041",
    approvedBy: "Priya Sharma",
    approvedRole: "Legal Metrology Officer",
    approvalRemarks: "Approved for annual calibration stamping certificate generation.",
    approvedAt: "2026-08-30T11:25:00Z"
  },
  certificate: {
    certificateId: "CERT-2026-000007",
    applicationId: "APP-2026-00041",
    issuedDate: "2025-08-15",
    expiryDate: "2026-09-15",
    status: "Valid"
  }
};

const chain1Calculated = computeChainedEvidenceHashes(chain1Stages);

export const mockEvidenceChains = [
  {
    chainId: "CHAIN-2026-000001",
    applicationId: "APP-2026-00041",
    inspectionId: "INS-2026-000321",
    certificateId: "CERT-2026-000007",
    instrumentId: "INS-2026-00002",
    businessName: "Acme Weighing Solutions Pvt. Ltd.",
    status: "VERIFIED", // VERIFIED, MISMATCH, PENDING
    finalHash: chain1Calculated.finalHash,
    stages: chain1Calculated.stageHashes,
    stageData: chain1Stages,
    blockchainRecord: {
      network: "Ethereum Sepolia Testnet / Immutable Internal Ledger",
      txReference: "0x3a7f9d2e1b4c8a6f0e5d3b2a1c9f7e8d4b6a2c0f",
      blockNumber: "5849201",
      anchoredAt: "2026-08-30T11:26:30Z",
      status: "ANCHORED"
    },
    lastVerifiedAt: "2026-08-31T10:30:00Z",
    verifiedBy: "System Automated Integrity Engine"
  },
  {
    chainId: "CHAIN-2026-000002",
    applicationId: "APP-2026-00003",
    inspectionId: "INS-2026-000109",
    certificateId: "CERT-2026-000004",
    instrumentId: "INS-2026-00003",
    businessName: "Acme Weighing Solutions Pvt. Ltd.",
    status: "VERIFIED",
    finalHash: "7c9a5b3f2e1d0c8b6a4f2e0d8c6b4a2f0e8d6c4b9182736450abcdef12345678",
    stages: chain1Calculated.stageHashes.map(s => ({
      ...s,
      stageHash: s.stageHash.split('').reverse().join('')
    })),
    stageData: {
      ...chain1Stages,
      application: { ...chain1Stages.application, applicationId: "APP-2026-00003", instrumentName: "Petrol Pump Meter" },
      certificate: { ...chain1Stages.certificate, certificateId: "CERT-2026-000004" }
    },
    blockchainRecord: {
      network: "Ethereum Sepolia Testnet",
      txReference: "0xdef456abc123789abcdef123456789abcdef1111",
      blockNumber: "5851420",
      anchoredAt: "2026-08-20T14:10:00Z",
      status: "ANCHORED"
    },
    lastVerifiedAt: "2026-08-31T09:15:00Z",
    verifiedBy: "Sunita Patil (Admin)"
  }
];
