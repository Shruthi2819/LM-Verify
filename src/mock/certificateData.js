/**
 * Mock certificate data.
 */

export const mockCertificates = [
  {
    id: "CERT-2026-000007",
    instrumentId: "INS-2026-00001",
    instrumentName: "Digital Weighing Scale",
    instrumentType: "Digital Weighing Scale",
    serialNumber: "MT-2024-AB1234",
    capacity: "150 kg",
    businessName: "Acme Weighing Solutions Pvt. Ltd.",
    address: "Unit 4, MIDC Industrial Area, Pune, Maharashtra - 411019",
    issuedDate: "2025-08-15",
    expiryDate: "2026-09-15",
    status: "Valid", // Valid, Expired, Revoked
    issuingOfficer: "Off. Priya Sharma",
    designation: "Legal Metrology Officer, Pune East",
    department: "Department of Legal Metrology, Government of Maharashtra",
    blockchainHash: "0x3a7f9d2e1b4c8a6f0e5d3b2a1c9f7e8d4b6a2c0f",
    txId: "0xabc123def456789abcdef123456789abcdef0000",
    network: "Ethereum Sepolia Testnet",
    verificationStatus: "MATCHED" // MATCHED, MISMATCHED
  },
  {
    id: "CERT-2026-000004",
    instrumentId: "INS-2026-00003",
    instrumentName: "Petrol Pump Meter",
    instrumentType: "Petrol Pump Meter",
    serialNumber: "TT-2025-CD9012",
    capacity: "100 L/min",
    businessName: "Acme Weighing Solutions Pvt. Ltd.",
    address: "Unit 4, MIDC Industrial Area, Pune, Maharashtra - 411019",
    issuedDate: "2026-02-20",
    expiryDate: "2027-02-19",
    status: "Valid",
    issuingOfficer: "Off. Arun Mehta",
    designation: "Legal Metrology Officer, Pune South",
    department: "Department of Legal Metrology, Government of Maharashtra",
    blockchainHash: "0x7c9a5b3f2e1d0c8b6a4f2e0d8c6b4a2f0e8d6c4b",
    txId: "0xdef456abc123789abcdef123456789abcdef1111",
    network: "Ethereum Sepolia Testnet",
    verificationStatus: "MATCHED"
  },
  {
    id: "CERT-2025-000021",
    instrumentId: "INS-2026-00004",
    instrumentName: "Water Flow Meter",
    instrumentType: "Water Flow Meter",
    serialNumber: "SI-2024-EF3456",
    capacity: "50 m³/h",
    businessName: "Acme Weighing Solutions Pvt. Ltd.",
    address: "Unit 4, MIDC Industrial Area, Pune, Maharashtra - 411019",
    issuedDate: "2024-07-15",
    expiryDate: "2025-07-14",
    status: "Expired",
    issuingOfficer: "Off. Priya Sharma",
    designation: "Legal Metrology Officer, Pune East",
    department: "Department of Legal Metrology, Government of Maharashtra",
    blockchainHash: "0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c",
    txId: "0x999999abc123789abcdef123456789abcdef9999",
    network: "Ethereum Sepolia Testnet",
    verificationStatus: "MATCHED"
  }
];
