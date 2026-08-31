import api from "./api";
import {
  mockLmoStats,
  mockLmoProfile,
  mockLmoApplications,
  mockLmoInspections
} from "../mock/lmoData";
import { delay } from "../utils/helpers";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === "true";

// Local states for mock LMO mutations

const getLocalLmoApps = () => {
  const cached = localStorage.getItem("lmv_mock_lmo_applications");
  if (!cached) {
    localStorage.setItem("lmv_mock_lmo_applications", JSON.stringify(mockLmoApplications));
    return [...mockLmoApplications];
  }
  return JSON.parse(cached);
};

const getLocalLmoInspections = () => {
  const cached = localStorage.getItem("lmv_mock_lmo_inspections");
  if (!cached) {
    localStorage.setItem("lmv_mock_lmo_inspections", JSON.stringify(mockLmoInspections));
    return [...mockLmoInspections];
  }
  return JSON.parse(cached);
};

export const lmoService = {
  async getDashboardStats() {
    if (USE_MOCK) {
      await delay(600);
      return mockLmoStats;
    }
    try {
      const response = await api.get("/lmo/dashboard/stats");
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch stats.");
    }
  },

  async getApplications(params = {}) {
    if (USE_MOCK) {
      await delay(600);
      const { search, status, type, page = 1, limit = 10 } = params;
      let filtered = getLocalLmoApps();

      if (search) {
        const query = search.trim().toLowerCase();
        filtered = filtered.filter(
          (app) =>
            app.id.toLowerCase().includes(query) ||
            (app.businessName && app.businessName.toLowerCase().includes(query)) ||
            (app.instrumentSerial && app.instrumentSerial.toLowerCase().includes(query)) ||
            (app.instrumentId && app.instrumentId.toLowerCase().includes(query)) ||
            (app.instrumentName && app.instrumentName.toLowerCase().includes(query))
        );
      }

      if (status) {
        filtered = filtered.filter((app) => app.status === status);
      }

      if (type) {
        filtered = filtered.filter((app) => app.type.toLowerCase() === type.toLowerCase());
      }

      const total = filtered.length;
      const startIndex = (page - 1) * limit;
      const paginatedItems = filtered.slice(startIndex, startIndex + limit);

      return { items: paginatedItems, total };
    }

    try {
      const response = await api.get("/lmo/applications", { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch applications.");
    }
  },

  async getApplication(id) {
    if (USE_MOCK) {
      await delay(500);
      const apps = getLocalLmoApps();
      let matched = apps.find((app) => app.id === id);
      if (!matched) {
        matched = mockLmoApplications.find((app) => app.id === id);
      }
      if (!matched) throw new Error("Application not found.");
      return matched;
    }
    try {
      const response = await api.get(`/lmo/applications/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch application details.");
    }
  },

  async scheduleInspection(applicationId, scheduledDate, scheduledTime) {
    if (USE_MOCK) {
      await delay(800);
      const lmoApps = getLocalLmoApps();
      const idx = lmoApps.findIndex((app) => app.id === applicationId);
      if (idx === -1) throw new Error("Application not found");

      // Update lmo application
      const updatedApp = {
        ...lmoApps[idx],
        status: "SCHEDULED",
        scheduledDate,
        timeline: lmoApps[idx].timeline.map((item) =>
          item.status === "SCHEDULED" ? { ...item, done: true, date: scheduledDate } : item
        )
      };
      lmoApps[idx] = updatedApp;
      localStorage.setItem("lmv_mock_lmo_applications", JSON.stringify(lmoApps));

      // Synchronize with business applications
      const businessAppsKey = "lmv_mock_applications";
      const cachedBApps = localStorage.getItem(businessAppsKey);
      let bApps = cachedBApps ? JSON.parse(cachedBApps) : [];
      const bIdx = bApps.findIndex(app => app.id === applicationId);
      if (bIdx !== -1) {
        bApps[bIdx] = {
          ...bApps[bIdx],
          status: "SCHEDULED",
          scheduledDate,
          timeline: bApps[bIdx].timeline.map(t =>
            t.status === "SCHEDULED" ? { ...t, done: true, date: scheduledDate } : t
          )
        };
        localStorage.setItem(businessAppsKey, JSON.stringify(bApps));
      }

      // Add to inspections queue
      const inspections = getLocalLmoInspections();
      const newInspectionId = `INS-2026-${String(inspections.length + 322).padStart(6, "0")}`;
      const newInspection = {
        id: newInspectionId,
        applicationId: updatedApp.id,
        businessName: updatedApp.businessName,
        instrumentName: updatedApp.instrumentName,
        instrumentSerial: updatedApp.instrumentSerial,
        instrumentId: updatedApp.instrumentId,
        scheduledDate,
        scheduledTime: scheduledTime || "11:00 AM",
        status: "SCHEDULED",
        location: updatedApp.installationAddress,
        checklist: [
          { id: "cl-1", label: "Physical Condition check", value: "" },
          { id: "cl-2", label: "Identification Markings legible", value: "" },
          { id: "cl-3", label: "Manufacturer plate matches master details", value: "" },
          { id: "cl-4", label: "Sealing integrity intact", value: "" },
          { id: "cl-5", label: "Required specifications sheet present", value: "" }
        ],
        measurements: [
          { id: "m-1", testName: "Zero Load Calibration", standardValue: 0, observedValue: null, error: null, result: "" },
          { id: "m-2", testName: "Half Capacity Verification", standardValue: Math.round(parseFloat(updatedApp.capacity) / 2) || 50, observedValue: null, error: null, result: "" },
          { id: "m-3", testName: "Full Capacity Load", standardValue: parseFloat(updatedApp.capacity) || 100, observedValue: null, error: null, result: "" }
        ],
        photos: [],
        remarks: "",
        result: ""
      };
      inspections.unshift(newInspection);
      localStorage.setItem("lmv_mock_lmo_inspections", JSON.stringify(inspections));
      return { success: true };
    }

    try {
      const response = await api.post(`/lmo/applications/${applicationId}/schedule`, {
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to schedule inspection.");
    }
  },

  async getInspections(params = {}) {
    if (USE_MOCK) {
      await delay(600);
      const { status } = params;
      let filtered = getLocalLmoInspections();
      if (status) {
        filtered = filtered.filter((ins) => ins.status === status);
      }
      return filtered;
    }
    try {
      const response = await api.get("/lmo/inspections", { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch inspections list.");
    }
  },

  async getInspection(id) {
    if (USE_MOCK) {
      await delay(500);
      const inspections = getLocalLmoInspections();
      let matched = inspections.find((ins) => ins.id === id || ins.inspectionId === id);
      if (!matched) {
        matched = mockLmoInspections.find((ins) => ins.id === id || ins.inspectionId === id);
      }
      if (!matched) throw new Error("Inspection not found.");
      return matched;
    }
    try {
      const response = await api.get(`/lmo/inspections/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch inspection details.");
    }
  },

  async uploadInspectionPhoto(inspectionId, file) {
    if (USE_MOCK) {
      await delay(1200);
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
      const response = await api.post(`/lmo/inspections/${inspectionId}/photos`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to upload inspection photograph.");
    }
  },

  async submitInspection(id, payload) {
    if (USE_MOCK) {
      await delay(1000);
      const inspections = getLocalLmoInspections();
      const insIdx = inspections.findIndex((ins) => ins.id === id);
      if (insIdx === -1) throw new Error("Inspection not found");

      const currentIns = inspections[insIdx];
      const updatedInspection = {
        ...currentIns,
        status: "COMPLETED",
        checklist: payload.checklist,
        measurements: payload.measurements,
        observations: payload.observations,
        remarks: payload.remarks,
        result: payload.result,
        photos: payload.photos
      };
      inspections[insIdx] = updatedInspection;
      localStorage.setItem("lmv_mock_lmo_inspections", JSON.stringify(inspections));

      // Sync LMO application status to INSPECTION_COMPLETED
      const lmoApps = getLocalLmoApps();
      const appIdx = lmoApps.findIndex((app) => app.id === currentIns.applicationId);
      if (appIdx !== -1) {
        lmoApps[appIdx] = {
          ...lmoApps[appIdx],
          status: "INSPECTION_COMPLETED",
          timeline: lmoApps[appIdx].timeline.map((item) =>
            item.status === "INSPECTION_COMPLETED" ? { ...item, done: true, date: new Date().toISOString().split("T")[0] } : item
          )
        };
        localStorage.setItem("lmv_mock_lmo_applications", JSON.stringify(lmoApps));
      }

      // Sync business application status to INSPECTION_COMPLETED
      const businessAppsKey = "lmv_mock_applications";
      const cachedBApps = localStorage.getItem(businessAppsKey);
      let bApps = cachedBApps ? JSON.parse(cachedBApps) : [];
      const bIdx = bApps.findIndex(app => app.id === currentIns.applicationId);
      if (bIdx !== -1) {
        bApps[bIdx] = {
          ...bApps[bIdx],
          status: "INSPECTION_COMPLETED",
          timeline: bApps[bIdx].timeline.map(t =>
            t.status === "INSPECTION_COMPLETED" ? { ...t, done: true, date: new Date().toISOString().split("T")[0] } : t
          )
        };
        localStorage.setItem(businessAppsKey, JSON.stringify(bApps));
      }

      return { success: true };
    }

    try {
      const response = await api.post(`/lmo/inspections/${id}/submit`, payload);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to submit inspection report.");
    }
  },

  async approveApplication(applicationId, remarks) {
    if (USE_MOCK) {
      await delay(1000);
      
      // Update LMO application
      const lmoApps = getLocalLmoApps();
      const idx = lmoApps.findIndex((app) => app.id === applicationId);
      if (idx === -1) throw new Error("Application not found");

      lmoApps[idx] = {
        ...lmoApps[idx],
        status: "APPROVED",
        timeline: lmoApps[idx].timeline.map((item) =>
          item.status === "CERTIFICATE_GENERATED" ? { ...item, done: true, date: new Date().toISOString().split("T")[0] } : item
        )
      };
      localStorage.setItem("lmv_mock_lmo_applications", JSON.stringify(lmoApps));

      // Synchronize with business applications
      const businessAppsKey = "lmv_mock_applications";
      const cachedBApps = localStorage.getItem(businessAppsKey);
      let bApps = cachedBApps ? JSON.parse(cachedBApps) : [];
      const bIdx = bApps.findIndex(app => app.id === applicationId);
      if (bIdx !== -1) {
        bApps[bIdx] = {
          ...bApps[bIdx],
          status: "APPROVED",
          timeline: bApps[bIdx].timeline.map(t =>
            t.status === "CERTIFICATE_GENERATED" ? { ...t, done: true, date: new Date().toISOString().split("T")[0] } : t
          )
        };
        localStorage.setItem(businessAppsKey, JSON.stringify(bApps));
      }

      return { success: true };
    }
    try {
      const response = await api.post(`/lmo/applications/${applicationId}/approve`, { remarks });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to approve application.");
    }
  },

  async rejectApplication(applicationId, reason) {
    if (USE_MOCK) {
      await delay(1000);
      
      // Update LMO application
      const lmoApps = getLocalLmoApps();
      const idx = lmoApps.findIndex((app) => app.id === applicationId);
      if (idx === -1) throw new Error("Application not found");

      lmoApps[idx] = {
        ...lmoApps[idx],
        status: "REJECTED",
        rejectionReason: reason,
        timeline: lmoApps[idx].timeline.map((item) =>
          item.status === "REJECTED" || item.status === "INSPECTION_COMPLETED" ? { ...item, done: true, date: new Date().toISOString().split("T")[0] } : item
        )
      };
      localStorage.setItem("lmv_mock_lmo_applications", JSON.stringify(lmoApps));

      // Synchronize with business applications
      const businessAppsKey = "lmv_mock_applications";
      const cachedBApps = localStorage.getItem(businessAppsKey);
      let bApps = cachedBApps ? JSON.parse(cachedBApps) : [];
      const bIdx = bApps.findIndex(app => app.id === applicationId);
      if (bIdx !== -1) {
        bApps[bIdx] = {
          ...bApps[bIdx],
          status: "REJECTED",
          rejectionReason: reason,
          timeline: bApps[bIdx].timeline.map(t =>
            t.status === "REJECTED" || t.status === "INSPECTION_COMPLETED" ? { ...t, done: true, date: new Date().toISOString().split("T")[0] } : t
          )
        };
        localStorage.setItem(businessAppsKey, JSON.stringify(bApps));
      }

      return { success: true };
    }
    try {
      const response = await api.post(`/lmo/applications/${applicationId}/reject`, { reason });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to reject application.");
    }
  },

  async getInstrument(id) {
    if (USE_MOCK) {
      await delay(500);
      const apps = getLocalLmoApps();
      const appMatch = apps.find((app) => app.instrumentId === id);
      if (!appMatch) throw new Error("Instrument not found.");
      return {
        id: appMatch.instrumentId,
        name: appMatch.instrumentName,
        serialNumber: appMatch.instrumentSerial,
        model: appMatch.instrumentModel || "ICS465",
        manufacturer: appMatch.instrumentManufacturer || "Mettler Toledo",
        capacity: appMatch.capacity || "150 kg",
        unit: appMatch.unit || "kg",
        accuracyClass: appMatch.accuracyClass || "Class III",
        category: appMatch.category || "Weighing Instrument",
        purchaseDate: appMatch.purchaseDate || "2024-03-10",
        location: appMatch.installationAddress || "Unit 4, MIDC Industrial Area, Pune",
        businessName: appMatch.businessName,
        verificationStatus: appMatch.status === "APPROVED" || appMatch.status === "CERTIFICATE_GENERATED" ? "Verified" : "Pending Verification",
        certificateStatus: appMatch.status === "CERTIFICATE_GENERATED" ? "Valid" : "Expired/None",
        certificateExpiry: appMatch.certificateExpiry || "2027-08-28",
        lastVerifiedDate: appMatch.status === "CERTIFICATE_GENERATED" ? "2026-08-28" : null,
        nextVerificationDue: appMatch.status === "CERTIFICATE_GENERATED" ? "2027-08-28" : "Immediate",
        history: [
          { date: "2025-08-15", officer: "Priya Sharma", result: "PASS", remarks: "Checked accuracy under standard weights." }
        ]
      };
    }
    try {
      const response = await api.get(`/lmo/instruments/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch instrument details.");
    }
  },

  async getProfile() {
    if (USE_MOCK) {
      await delay(400);
      const storedUser = localStorage.getItem("lmv_user");
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        return {
          name: userObj.name || "Priya Sharma",
          officerId: userObj.id || "LMO-MH-44012",
          designation: "Legal Metrology Officer",
          department: userObj.organisation || "Department of Legal Metrology, Maharashtra",
          jurisdiction: userObj.jurisdiction || "Pune East Division",
          email: userObj.email || "lmo@example.com",
          phone: userObj.phone || "+91 98765 43210",
          joiningDate: userObj.joiningDate || "2022-04-10"
        };
      }
      return mockLmoProfile;
    }
    try {
      const response = await api.get("/lmo/profile");
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch LMO profile.");
    }
  }
};
export default lmoService;
