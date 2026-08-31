import api from "./api";
import {
  mockGatcStats,
  mockGatcProfile,
  mockGatcApplications,
  mockGatcInspections,
  mockGatcReports,
  mockGatcAiInsights
} from "../mock/gatcData";
import { delay } from "../utils/helpers";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === "true";

let localGatcApplications = [...mockGatcApplications];
let localGatcInspections = [...mockGatcInspections];
let localGatcReports = [...mockGatcReports];
let localGatcAiInsights = { ...mockGatcAiInsights };

export const gatcService = {
  async getDashboardStats() {
    if (USE_MOCK) {
      await delay(600);
      return mockGatcStats;
    }
    try {
      const response = await api.get("/gatc/dashboard/stats");
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch stats.");
    }
  },

  async getApplications(params = {}) {
    if (USE_MOCK) {
      await delay(600);
      const { search, status } = params;
      let filtered = [...localGatcApplications];

      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter(
          (app) =>
            app.id.toLowerCase().includes(query) ||
            app.businessName.toLowerCase().includes(query) ||
            app.instrumentSerial.toLowerCase().includes(query)
        );
      }

      if (status) {
        filtered = filtered.filter((app) => app.status === status);
      }

      return { items: filtered, total: filtered.length };
    }
    try {
      const response = await api.get("/gatc/applications", { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch applications.");
    }
  },

  async getApplication(id) {
    if (USE_MOCK) {
      await delay(500);
      const matched = localGatcApplications.find((app) => app.id === id);
      if (!matched) throw new Error("Application not found");
      return matched;
    }
    try {
      const response = await api.get(`/gatc/applications/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch details.");
    }
  },

  async scheduleInspection(applicationId, date, time) {
    if (USE_MOCK) {
      await delay(800);
      const idx = localGatcApplications.findIndex((app) => app.id === applicationId);
      if (idx === -1) throw new Error("Application not found");

      localGatcApplications[idx] = {
        ...localGatcApplications[idx],
        status: "SCHEDULED",
        scheduledDate: date,
        timeline: localGatcApplications[idx].timeline.map((item) =>
          item.status === "SCHEDULED" ? { ...item, done: true, date } : item
        )
      };

      const testId = `TEST-2026-${String(localGatcInspections.length + 110).padStart(6, "0")}`;
      const newTest = {
        id: testId,
        applicationId: applicationId,
        businessName: localGatcApplications[idx].businessName,
        instrumentName: localGatcApplications[idx].instrumentName,
        instrumentSerial: localGatcApplications[idx].instrumentSerial,
        instrumentId: localGatcApplications[idx].instrumentId,
        scheduledDate: date,
        scheduledTime: time || "10:00 AM",
        status: "SCHEDULED",
        location: localGatcApplications[idx].installationAddress,
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
        result: ""
      };
      localGatcInspections.unshift(newTest);
      return { success: true };
    }
    try {
      const response = await api.post(`/gatc/applications/${applicationId}/schedule`, { date, time });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to schedule test.");
    }
  },

  async getInspections(params = {}) {
    if (USE_MOCK) {
      await delay(600);
      const { status } = params;
      let filtered = [...localGatcInspections];
      if (status) {
        filtered = filtered.filter((ins) => ins.status === status);
      }
      return filtered;
    }
    try {
      const response = await api.get("/gatc/inspections", { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch scheduled tests.");
    }
  },

  async getInspection(id) {
    if (USE_MOCK) {
      await delay(500);
      let matched = localGatcInspections.find((ins) => ins.id === id || ins.inspectionId === id);
      if (!matched) {
        matched = mockGatcInspections.find((ins) => ins.id === id || ins.inspectionId === id);
      }
      if (!matched) throw new Error("Test record not found.");
      return matched;
    }
    try {
      const response = await api.get(`/gatc/inspections/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch test details.");
    }
  },

  async startTest(id) {
    if (USE_MOCK) {
      await delay(500);
      const idx = localGatcInspections.findIndex((ins) => ins.id === id);
      if (idx !== -1) {
        localGatcInspections[idx] = {
          ...localGatcInspections[idx],
          status: "IN_PROGRESS"
        };
        // Add start event to audit trail
        const storedLogs = localStorage.getItem("lmv_audit_trail") || "[]";
        const logs = JSON.parse(storedLogs);
        logs.unshift({
          id: `AUDIT-${Date.now()}`,
          testId: id,
          actor: "Technician Priya",
          role: "GATC",
          action: "GATC_TEST_STARTED",
          timestamp: new Date().toISOString()
        });
        localStorage.setItem("lmv_audit_trail", JSON.stringify(logs));
      }
      return { success: true };
    }
    try {
      const response = await api.post(`/gatc/inspections/${id}/start`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to start test.");
    }
  },

  async uploadEvidence(inspectionId, file) {
    if (USE_MOCK) {
      await delay(1000);
      return {
        id: `img-${Date.now()}`,
        name: file.name,
        preview: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString()
      };
    }
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post(`/gatc/inspections/${inspectionId}/evidence`, formData, {
        headers: { "Content-Type": undefined }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Evidence upload failed.");
    }
  },

  async submitInspection(id, payload) {
    if (USE_MOCK) {
      await delay(1000);
      const idx = localGatcInspections.findIndex((ins) => ins.id === id);
      if (idx === -1) throw new Error("Test details not found");

      const current = localGatcInspections[idx];
      localGatcInspections[idx] = {
        ...current,
        status: "COMPLETED",
        checklist: payload.checklist,
        measurements: payload.measurements,
        remarks: payload.remarks,
        result: payload.result,
        photos: payload.photos
      };

      // Add to submitted reports
      const newReportId = `REP-2026-${String(localGatcReports.length + 88).padStart(6, "0")}`;
      const newReport = {
        id: newReportId,
        applicationId: current.applicationId,
        businessName: current.businessName,
        instrumentName: current.instrumentName,
        instrumentSerial: current.instrumentSerial,
        testDate: new Date().toISOString().split("T")[0],
        result: payload.result,
        risk: payload.result === "FAIL" ? "HIGH" : "LOW",
        status: "SUBMITTED",
        submittedDate: new Date().toISOString().split("T")[0],
        remarks: payload.remarks,
        checklist: payload.checklist,
        measurements: payload.measurements,
        photos: payload.photos,
        gps: payload.gps || { lat: "18.6254", lng: "73.8052", timestamp: new Date().toISOString() },
        signatureStatus: "Signed",
        blockchainStatus: "ANCHORED",
        blockchainTx: "0x" + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10),
        blockchainHash: "0x" + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10)
      };
      localGatcReports.unshift(newReport);

      // Sync application
      const appIdx = localGatcApplications.findIndex((app) => app.id === current.applicationId);
      if (appIdx !== -1) {
        localGatcApplications[appIdx] = {
          ...localGatcApplications[appIdx],
          status: "INSPECTION_COMPLETED",
          timeline: localGatcApplications[appIdx].timeline.map((item) =>
            item.status === "INSPECTION_COMPLETED" ? { ...item, done: true, date: new Date().toISOString().split("T")[0] } : item
          )
        };
      }
      return { success: true, reportId: newReportId };
    }
    try {
      const response = await api.post(`/gatc/inspections/${id}/submit`, payload);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to submit test results.");
    }
  },

  async getReports(params = {}) {
    if (USE_MOCK) {
      await delay(600);
      const { search, status, result } = params;
      let filtered = [...localGatcReports];

      if (search) {
        const query = search.trim().toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.id.toLowerCase().includes(query) ||
            r.applicationId.toLowerCase().includes(query) ||
            r.instrumentSerial.toLowerCase().includes(query) ||
            (r.businessName && r.businessName.toLowerCase().includes(query))
        );
      }

      if (status) {
        filtered = filtered.filter((r) => r.status === status);
      }

      if (result) {
        filtered = filtered.filter((r) => r.result === result);
      }

      return { items: filtered, total: filtered.length };
    }
    try {
      const response = await api.get("/gatc/reports", { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch reports.");
    }
  },

  async getReport(id) {
    if (USE_MOCK) {
      await delay(500);
      const matched = localGatcReports.find((r) => r.id === id);
      if (!matched) throw new Error("Report not found.");
      return matched;
    }
    try {
      const response = await api.get(`/gatc/reports/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch report details.");
    }
  },

  async getAIInsights() {
    if (USE_MOCK) {
      await delay(500);
      return localGatcAiInsights;
    }
    try {
      const response = await api.get("/gatc/ai-insights");
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch AI Insights.");
    }
  },

  async resolveAIWarning(warningId) {
    if (USE_MOCK) {
      await delay(400);
      localGatcAiInsights.alerts = localGatcAiInsights.alerts.map((alert) =>
        alert.id === warningId ? { ...alert, status: "REVIEWED" } : alert
      );
      localGatcAiInsights.stats.resolvedAlerts += 1;
      localGatcAiInsights.stats.totalAlerts = Math.max(0, localGatcAiInsights.stats.totalAlerts - 1);
      return { success: true };
    }
    try {
      const response = await api.post(`/gatc/ai-insights/resolve/${warningId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to resolve AI Warning.");
    }
  },

  async getProfile() {
    if (USE_MOCK) {
      await delay(400);
      const storedUser = localStorage.getItem("lmv_user");
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        return {
          name: userObj.name || "Anand Verma",
          centreId: userObj.id || "GATC-PN-88210",
          email: userObj.email || "gatc@example.com",
          phone: userObj.phone || "+91 20 2568 9012",
          department: userObj.organisation || "NABL Approved Test Centre, Pune",
          designation: "Approved Calibration Centre",
          jurisdiction: userObj.jurisdiction || "Pune District, Zone A, Maharashtra",
          accreditationNumber: userObj.accreditationNumber || "NABL-C-1294",
          accreditationExpiry: userObj.accreditationExpiry || "2029-05-31",
          labManager: userObj.name || "Anand Verma"
        };
      }
      return mockGatcProfile;
    }
    try {
      const response = await api.get("/gatc/profile");
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch profile details.");
    }
  }
};
export default gatcService;
