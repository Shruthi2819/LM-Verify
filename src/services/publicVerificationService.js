/**
 * Public Certificate Verification Service
 * Exposes strictly read-only, public-safe certificate queries, evidence integrity checks,
 * and immutable ledger verification with zero authentication requirements.
 */
import api from "./api.js";
import { mockCertificates } from "../mock/certificateData.js";
import { evidenceChainService } from "./evidenceChainService.js";
import { delay } from "../utils/helpers.js";

const USE_MOCK = (typeof import.meta !== "undefined" && import.meta?.env?.VITE_USE_MOCK_DATA) ? (import.meta.env.VITE_USE_MOCK_DATA === "true") : true;

// Local mutable mock certificates to simulate revocation & demo states
const cachedCerts = typeof localStorage !== "undefined" ? localStorage.getItem("lmv_mock_certificates") : null;
export let localCertificates = cachedCerts ? JSON.parse(cachedCerts) : [...mockCertificates];

if (!cachedCerts && USE_MOCK && typeof localStorage !== "undefined") {
  localStorage.setItem("lmv_mock_certificates", JSON.stringify(localCertificates));
}

export function saveCertificates(certs) {
  localCertificates = certs;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("lmv_mock_certificates", JSON.stringify(certs));
  }
}

/**
 * Filter sensitive private business & user fields to ensure privacy by design
 */
function sanitizePublicCertificate(cert) {
  if (!cert) return null;
  return {
    id: cert.id,
    status: cert.status || "Valid",
    instrumentName: cert.instrumentName || cert.instrumentType || "Weighing Instrument",
    instrumentType: cert.instrumentType || cert.instrumentName || "Weighing Instrument",
    manufacturer: cert.manufacturer || "Certified Manufacturer",
    model: cert.model || "Standard Model",
    serialNumber: cert.serialNumber || "N/A",
    capacity: cert.capacity || "Standard Capacity",
    businessName: cert.businessName || "Registered Commercial Entity",
    issuedDate: cert.issuedDate,
    expiryDate: cert.expiryDate,
    issuingOfficer: cert.issuingOfficer || "Department Officer",
    designation: cert.designation || "Legal Metrology Officer",
    department: cert.department || "Department of Legal Metrology",
    verificationResult: "PASS",
    blockchainHash: cert.blockchainHash || "0x3a7f9d2e1b4c8a6f0e5d3b2a1c9f7e8d4b6a2c0f",
    txId: cert.txId || "0x5849201abc1237890ef99887766554433221100aa",
    evidenceChainId: cert.evidenceChainId || ("CHAIN-" + (cert.id.replace(/[^0-9]/g, "").padStart(6, "0") || "2026-000001"))
  };
}

export const publicVerificationService = {
  /**
   * Public-facing certificate authenticity, integrity, and ledger verification query.
   * Does NOT require any authentication token.
   */
  async verifyCertificate(certificateId) {
    if (!certificateId || !certificateId.trim()) {
      return {
        valid: false,
        status: "NOT_FOUND",
        certificate: null,
        integrity: null,
        blockchain: null,
        verifiedAt: new Date().toISOString()
      };
    }

    if (USE_MOCK) {
      await delay(600);
      const cleanId = certificateId.trim().toUpperCase();
      const rawCert = localCertificates.find(
        (c) => c.id.toUpperCase() === cleanId
      );

      if (!rawCert) {
        return {
          valid: false,
          status: "NOT_FOUND",
          certificate: null,
          integrity: null,
          blockchain: null,
          verifiedAt: new Date().toISOString()
        };
      }

      const publicCert = sanitizePublicCertificate(rawCert);

      // Perform live evidence chain integrity verification
      let integrityResult = {
        status: "VERIFIED",
        isMatch: true,
        chainId: publicCert.evidenceChainId,
        finalHash: publicCert.blockchainHash,
        stageComparisons: []
      };

      try {
        const verifyCheck = await evidenceChainService.verifyIntegrity(publicCert.evidenceChainId || publicCert.id);
        integrityResult = {
          status: verifyCheck.isMatch ? "VERIFIED" : "MISMATCH",
          isMatch: verifyCheck.isMatch,
          chainId: verifyCheck.chainId || publicCert.evidenceChainId,
          finalHash: verifyCheck.currentFinalHash || publicCert.blockchainHash,
          stageComparisons: verifyCheck.stageComparisons || []
        };
      } catch (err) {
        console.warn("Evidence chain check failed gracefully:", err);
        integrityResult = {
          status: "UNAVAILABLE",
          isMatch: true,
          chainId: publicCert.evidenceChainId,
          finalHash: publicCert.blockchainHash,
          stageComparisons: []
        };
      }

      // Blockchain / Immutable Ledger Status
      const blockchainResult = {
        status: publicCert.txId ? "VERIFIED" : "NOT_ANCHORED",
        network: "Ethereum Sepolia Testnet / Immutable Ledger",
        txReference: publicCert.txId || null,
        blockNumber: "5849201",
        anchoredAt: publicCert.issuedDate ? (publicCert.issuedDate + "T11:26:30.000Z") : new Date().toISOString()
      };

      return {
        valid: true,
        status: "VERIFIED",
        certificate: publicCert,
        integrity: integrityResult,
        blockchain: blockchainResult,
        verifiedAt: new Date().toISOString()
      };
    }

    try {
      const response = await api.get("/public/verify/" + encodeURIComponent(certificateId.trim()));
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          valid: false,
          status: "NOT_FOUND",
          certificate: null,
          integrity: null,
          blockchain: null,
          verifiedAt: new Date().toISOString()
        };
      }
      if (error.response?.status === 429) {
        throw new Error("Too many verification requests. Please try again in a few moments.");
      }
      throw new Error(error.response?.data?.message || "Verification gateway is temporarily unreachable.");
    }
  },

  // Helper to trigger revocation in mock mode (Admin function)
  async revokeCertificate(certificateId, reason) {
    if (USE_MOCK) {
      await delay(500);
      const idx = localCertificates.findIndex(
        (c) => c.id.toUpperCase() === certificateId.toUpperCase()
      );
      if (idx !== -1) {
        localCertificates[idx] = {
          ...localCertificates[idx],
          status: "Revoked",
          revocationReason: reason
        };
        saveCertificates(localCertificates);
        return { success: true };
      }
      throw new Error("Certificate not found.");
    }

    try {
      const response = await api.post("/admin/certificates/" + certificateId + "/revoke", { reason });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to revoke certificate.");
    }
  }
};

export default publicVerificationService;
