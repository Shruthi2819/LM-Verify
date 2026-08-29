import api from "./api";
import { mockCertificates } from "../mock/certificateData";
import { publicVerificationService } from "./publicVerificationService";
import { delay } from "../utils/helpers";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === "true";

export const certificateService = {
  async getCertificates(params = {}) {
    if (USE_MOCK) {
      await delay(500);
      const { status, search } = params;
      let filtered = [...mockCertificates];

      if (status) {
        filtered = filtered.filter((c) => c.status.toLowerCase() === status.toLowerCase());
      }
      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.id.toLowerCase().includes(query) ||
            c.instrumentName.toLowerCase().includes(query) ||
            c.serialNumber.toLowerCase().includes(query)
        );
      }
      return filtered;
    }

    try {
      const response = await api.get("/certificates", { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch certificates.");
    }
  },

  async getCertificate(id) {
    if (USE_MOCK) {
      await delay(400);
      // Fallback to public verification to retrieve mutated state (e.g. revoked)
      const res = await publicVerificationService.verifyCertificate(id);
      if (res.valid) {
        return res.certificate;
      }
      throw new Error("Certificate not found.");
    }

    try {
      const response = await api.get(`/certificates/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch certificate details.");
    }
  },

  async verifyCertificate(certId) {
    // Reuses the publicVerificationService integrity check logic
    return publicVerificationService.verifyCertificate(certId);
  },

  async revokeCertificate(certId, reason) {
    return publicVerificationService.revokeCertificate(certId, reason);
  }
};
export default certificateService;
