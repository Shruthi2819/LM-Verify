import api from "./api";
import { mockCertificates } from "../mock/certificateData";
import { delay } from "../utils/helpers";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === "true";

// Local mutable mock certificates to simulate revocation, etc.
let localCertificates = [...mockCertificates];

export const publicVerificationService = {
  async verifyCertificate(certificateId) {
    if (USE_MOCK) {
      await delay(800);
      const cert = localCertificates.find(
        (c) => c.id.toUpperCase() === certificateId.toUpperCase()
      );
      if (!cert) {
        return {
          valid: false,
          status: "NOT_FOUND",
          certificate: null
        };
      }
      return {
        valid: true,
        status: "VERIFIED",
        certificate: cert
      };
    }

    try {
      // Endpoint is public, so it does not require authentication token header.
      // The global Axios instance is in src/services/api.js.
      const response = await api.get(`/public/verify/${certificateId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          valid: false,
          status: "NOT_FOUND",
          certificate: null
        };
      }
      throw new Error(error.response?.data?.message || "Failed to query verification database.");
    }
  },

  // Helper to trigger revocation in mock mode
  async revokeCertificate(certificateId, reason) {
    if (USE_MOCK) {
      await delay(600);
      const idx = localCertificates.findIndex(
        (c) => c.id.toUpperCase() === certificateId.toUpperCase()
      );
      if (idx !== -1) {
        localCertificates[idx] = {
          ...localCertificates[idx],
          status: "Revoked",
          revocationReason: reason
        };
        return { success: true };
      }
      throw new Error("Certificate not found.");
    }
    // Authenticated admin endpoint
    try {
      const response = await api.post(`/admin/certificates/${certificateId}/revoke`, { reason });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to revoke certificate.");
    }
  }
};

export default publicVerificationService;
