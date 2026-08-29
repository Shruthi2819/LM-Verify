import api from "./api";
import {
  mockAdminStats,
  mockAdminProfile,
  mockAdminOfficers,
  mockAdminGatcs,
  mockAdminJurisdictions,
  mockAdminAuditLogs
} from "../mock/adminData";
import { mockLmoApplications } from "../mock/lmoData";
import { mockCertificates } from "../mock/certificateData";
import { delay } from "../utils/helpers";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === "true";

let localAdminApplications = [...mockLmoApplications];
let localAdminOfficers = [...mockAdminOfficers];
let localAdminGatcs = [...mockAdminGatcs];
let localAdminAuditLogs = [...mockAdminAuditLogs];

export const adminService = {
  async getDashboardStats() {
    if (USE_MOCK) {
      await delay(600);
      return mockAdminStats;
    }
    try {
      const response = await api.get("/admin/dashboard/stats");
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch admin stats.");
    }
  },

  async getApplications(params = {}) {
    if (USE_MOCK) {
      await delay(600);
      const { search, status, type } = params;
      let filtered = [...localAdminApplications];

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

      if (type) {
        filtered = filtered.filter((app) => app.type.toLowerCase() === type.toLowerCase());
      }

      return { items: filtered, total: filtered.length };
    }
    try {
      const response = await api.get("/admin/applications", { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch applications list.");
    }
  },

  async getApplication(id) {
    if (USE_MOCK) {
      await delay(500);
      const matched = localAdminApplications.find((app) => app.id === id);
      if (!matched) throw new Error("Application not found.");
      return matched;
    }
    try {
      const response = await api.get(`/admin/applications/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch application details.");
    }
  },

  async assignApplication(applicationId, assigneeId, assigneeType, remarks) {
    if (USE_MOCK) {
      await delay(1000);
      // Find application and update assignee
      const appIdx = localAdminApplications.findIndex((app) => app.id === applicationId);
      if (appIdx === -1) throw new Error("Application not found");

      let assigneeName = "Unknown";
      if (assigneeType === "LMO") {
        const officer = localAdminOfficers.find((o) => o.officerId === assigneeId);
        if (officer) {
          assigneeName = officer.name;
          officer.workload += 1;
        }
      } else {
        const centre = localAdminGatcs.find((g) => g.gatcId === assigneeId);
        if (centre) {
          assigneeName = centre.name;
          centre.workload += 1;
        }
      }

      localAdminApplications[appIdx] = {
        ...localAdminApplications[appIdx],
        status: "ASSIGNED",
        assignedOfficer: `${assigneeName} (${assigneeType})`,
        timeline: localAdminApplications[appIdx].timeline.map((item) =>
          item.status === "ASSIGNED" ? { ...item, done: true, date: new Date().toISOString().split("T")[0] } : item
        )
      };

      // Add to audit logs
      const auditEvent = {
        id: `AUD-${Date.now().toString().substring(8)}`,
        timestamp: new Date().toISOString(),
        actorName: "Sunita Patil",
        actorRole: "Admin",
        action: "APPLICATION_ASSIGNED",
        entityType: "Application",
        entityId: applicationId,
        previousState: "UNDER_REVIEW",
        newState: "ASSIGNED",
        metadata: `Assigned to ${assigneeName} (${assigneeType}). Remarks: ${remarks || "None"}`
      };
      localAdminAuditLogs.unshift(auditEvent);

      return { success: true };
    }

    try {
      const response = await api.post(`/admin/applications/${applicationId}/assign`, {
        assignee_id: assigneeId,
        assignee_type: assigneeType,
        remarks
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Assignment failed.");
    }
  },

  async getOfficers() {
    if (USE_MOCK) {
      await delay(500);
      return localAdminOfficers;
    }
    try {
      const response = await api.get("/admin/officers");
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch officers.");
    }
  },

  async getOfficer(id) {
    if (USE_MOCK) {
      await delay(400);
      const officer = localAdminOfficers.find((o) => o.officerId === id);
      if (!officer) throw new Error("Officer not found.");
      return officer;
    }
    try {
      const response = await api.get(`/admin/officers/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch officer details.");
    }
  },

  async getGATCs() {
    if (USE_MOCK) {
      await delay(500);
      return localAdminGatcs;
    }
    try {
      const response = await api.get("/admin/gatcs");
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch GATC records.");
    }
  },

  async getGATC(id) {
    if (USE_MOCK) {
      await delay(400);
      const centre = localAdminGatcs.find((g) => g.gatcId === id);
      if (!centre) throw new Error("Centre not found.");
      return centre;
    }
    try {
      const response = await api.get(`/admin/gatcs/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch test centre details.");
    }
  },

  async createGATC(data) {
    if (USE_MOCK) {
      await delay(800);
      const newId = `GATC-PN-${String(localAdminGatcs.length + 88216)}`;
      const newCentre = {
        gatcId: newId,
        ...data,
        status: "Active",
        workload: 0
      };
      localAdminGatcs.unshift(newCentre);
      return newCentre;
    }
    try {
      const response = await api.post("/admin/gatcs", data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to register new GATC.");
    }
  },

  async getJurisdictions() {
    if (USE_MOCK) {
      await delay(500);
      return mockAdminJurisdictions;
    }
    try {
      const response = await api.get("/admin/jurisdictions");
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch jurisdictions.");
    }
  },

  async getInspections(params = {}) {
    if (USE_MOCK) {
      await delay(600);
      return [
        { id: "INS-2026-000321", applicationId: "APP-2026-00041", handlerName: "Priya Sharma (LMO)", scheduledDate: "2026-08-30", location: "Bhosari, Pune", status: "SCHEDULED" },
        { id: "TEST-2026-000109", applicationId: "APP-2026-00052", handlerName: "Anand Verma (GATC)", scheduledDate: "2026-09-02", location: "Hinjewadi, Pune", status: "SCHEDULED" }
      ];
    }
    try {
      const response = await api.get("/admin/inspections", { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch inspections monitor.");
    }
  },

  async getCertificates() {
    if (USE_MOCK) {
      await delay(500);
      return mockCertificates;
    }
    try {
      const response = await api.get("/admin/certificates");
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch certificates.");
    }
  },

  async getAuditLogs(params = {}) {
    if (USE_MOCK) {
      await delay(500);
      const { search } = params;
      let logs = [...localAdminAuditLogs];
      if (search) {
        const query = search.toLowerCase();
        logs = logs.filter(
          (l) =>
            l.actorName.toLowerCase().includes(query) ||
            l.action.toLowerCase().includes(query) ||
            l.entityId.toLowerCase().includes(query)
        );
      }
      return logs;
    }
    try {
      const response = await api.get("/admin/audit-logs", { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch audit log.");
    }
  },

  async getProfile() {
    if (USE_MOCK) {
      await delay(400);
      const storedUser = localStorage.getItem("lmv_user");
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        return {
          name: userObj.name || "Sunita Patil",
          adminId: userObj.id || "ADM-MH-0012",
          email: userObj.email || "admin@example.com",
          phone: userObj.phone || "+91 22 2202 4432",
          department: userObj.organisation || "LM Verify Platform Administration",
          designation: "Legal Metrology Administrator",
          jurisdiction: userObj.jurisdiction || "State of Maharashtra, India",
          officeLocation: "Mantralaya, Mumbai"
        };
      }
      return mockAdminProfile;
    }
    try {
      const response = await api.get("/admin/profile");
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch profile details.");
    }
  }
};
export default adminService;
