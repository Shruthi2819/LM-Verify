import api from "./api";
import { localCertificates, saveCertificates } from "./publicVerificationService";
import { mockApplications } from "../mock/applicationData";
import { mockLmoApplications } from "../mock/lmoData";
import { publicVerificationService } from "./publicVerificationService";
import { delay } from "../utils/helpers";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === "true";

export const certificateService = {
  async getCertificates(params = {}) {
    if (USE_MOCK) {
      await delay(500);
      const { status, search } = params;
      let filtered = [...localCertificates];

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
  },

  async generateCertificate(applicationId) {
    if (USE_MOCK) {
      await delay(1000);
      const certId = `LM-CERT-2026-${String(Math.floor(100000 + Math.random() * 900000))}`;
      const issueDate = new Date().toISOString().split("T")[0];
      const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      // Update business applications in localStorage
      const businessAppsKey = "lmv_mock_applications";
      const cachedBApps = localStorage.getItem(businessAppsKey);
      let bApps = cachedBApps ? JSON.parse(cachedBApps) : [...mockApplications];
      const bIdx = bApps.findIndex(app => app.id === applicationId);
      if (bIdx !== -1) {
        bApps[bIdx] = {
          ...bApps[bIdx],
          status: "CERTIFICATE_GENERATED",
          certificateId: certId,
          certificateExpiry: expiryDate,
          timeline: bApps[bIdx].timeline.map(t => 
            t.status === "CERTIFICATE_GENERATED" ? { ...t, done: true, date: issueDate } : t
          )
        };
        localStorage.setItem(businessAppsKey, JSON.stringify(bApps));
      }

      // Update LMO applications in localStorage
      const lmoAppsKey = "lmv_mock_lmo_applications";
      const cachedLmoApps = localStorage.getItem(lmoAppsKey);
      let lmoApps = cachedLmoApps ? JSON.parse(cachedLmoApps) : [...mockLmoApplications];
      const lIdx = lmoApps.findIndex(app => app.id === applicationId);
      let matchedApp = null;
      if (lIdx !== -1) {
        lmoApps[lIdx] = {
          ...lmoApps[lIdx],
          status: "CERTIFICATE_GENERATED",
          certificateId: certId,
          certificateExpiry: expiryDate,
          timeline: lmoApps[lIdx].timeline.map(t => 
            t.status === "CERTIFICATE_GENERATED" ? { ...t, done: true, date: issueDate } : t
          )
        };
        matchedApp = lmoApps[lIdx];
        localStorage.setItem(lmoAppsKey, JSON.stringify(lmoApps));
      } else if (bIdx !== -1) {
        matchedApp = bApps[bIdx];
      }

      // Create new certificate object
      const newCert = {
        id: certId,
        applicationId: applicationId,
        instrumentId: matchedApp?.instrumentId || "INS-2026-00001",
        instrumentName: matchedApp?.instrumentName || "Digital Weighing Scale",
        instrumentType: matchedApp?.instrumentName || "Digital Weighing Scale",
        serialNumber: matchedApp?.instrumentSerial || "MT-2024-AB1234",
        capacity: matchedApp?.capacity || "150 kg",
        businessName: matchedApp?.businessName || "Acme Weighing Solutions Pvt. Ltd.",
        address: matchedApp?.businessAddress || "Unit 4, MIDC Industrial Area, Pune",
        issuedDate: issueDate,
        expiryDate: expiryDate,
        status: "Valid",
        issuingOfficer: matchedApp?.assignedOfficer || "Priya Sharma",
        designation: "Legal Metrology Officer",
        department: "Department of Legal Metrology",
        blockchainHash: "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join(""),
        txId: "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join(""),
        network: "Ethereum Sepolia Testnet",
        verificationStatus: "MATCHED",
        evidenceChainId: "CHAIN-" + (matchedApp?.id?.replace(/[^0-9]/g, "").padStart(6, "0") || "2026-000001")
      };

      const updatedCerts = [newCert, ...localCertificates];
      saveCertificates(updatedCerts);
      return newCert;
    }

    try {
      const response = await api.post("/certificates/generate", { applicationId });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to generate certificate.");
    }
  },

  async downloadCertificatePdf(certId) {
    if (USE_MOCK) {
      await delay(800);
      const cert = localCertificates.find(c => c.id === certId) || {
        id: certId,
        instrumentName: "Digital Weighing Scale",
        serialNumber: "MT-2024-AB1234",
        businessName: "Acme Weighing Solutions Pvt. Ltd.",
        issuedDate: new Date().toISOString().split("T")[0],
        expiryDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split("T")[0]
      };

      const text = `
==================================================
DIGITAL LEGAL METROLOGY CERTIFICATE

Certificate No: ${cert.id}
Application ID: ${cert.applicationId || "APP-2026-000043"}
--------------------------------------------------
INSTRUMENT DETAILS
Instrument Type: ${cert.instrumentName}
Manufacturer: Mettler Toledo
Model: ICS465
Serial Number: ${cert.serialNumber}
Capacity: ${cert.capacity || "150 kg"}
Accuracy Class: Class III
--------------------------------------------------
VERIFICATION RESULT
PASS
Inspection ID: INS-2026-000324
--------------------------------------------------
VALIDITY
Issue Date: ${cert.issuedDate}
Expiry Date: ${cert.expiryDate}
--------------------------------------------------
AUTHORIZED OFFICER
${cert.issuingOfficer || "Rebecca"}
Legal Metrology Officer
--------------------------------------------------
APPROVAL
Approved
==================================================
`;
      const blob = new Blob([text], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `LM-Certificate-${certId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return;
    }

    try {
      const response = await api.get(`/certificates/${certId}/pdf`, {
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `LM-Certificate-${certId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to download certificate PDF.");
    }
  }
};
export default certificateService;
