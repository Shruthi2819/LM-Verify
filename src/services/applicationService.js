import api from "./api";
import { mockApplications } from "../mock/applicationData";
import { delay } from "../utils/helpers";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === "true";

let localApplications = [...mockApplications];

export const applicationService = {
  async getApplications(params = {}) {
    if (USE_MOCK) {
      await delay(600);
      const { search, type, status, page = 1, limit = 10 } = params;
      let filtered = [...localApplications];

      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.id.toLowerCase().includes(query) ||
            item.instrumentName.toLowerCase().includes(query) ||
            item.instrumentSerial.toLowerCase().includes(query)
        );
      }

      if (type) {
        filtered = filtered.filter((item) => item.type.toLowerCase() === type.toLowerCase());
      }

      if (status) {
        filtered = filtered.filter((item) => item.status === status);
      }

      const total = filtered.length;
      const start = (page - 1) * limit;
      const end = start + parseInt(limit);
      const items = filtered.slice(start, end);

      return {
        items,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    }

    try {
      const response = await api.get("/applications", { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch applications.");
    }
  },

  async getApplication(id) {
    if (USE_MOCK) {
      await delay(500);
      const application = localApplications.find((item) => item.id === id);
      if (!application) throw new Error("Application not found.");
      return application;
    }

    try {
      const response = await api.get(`/applications/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch application details.");
    }
  },

  async createApplication(data) {
    if (USE_MOCK) {
      await delay(1000);
      const newId = `APP-2026-${String(localApplications.length + 50).padStart(5, "0")}`;
      const newApplication = {
        id: newId,
        instrumentId: data.instrumentId,
        instrumentName: data.instrumentName || "Selected Instrument",
        instrumentSerial: data.instrumentSerial || "SN-UNKNOWN",
        type: data.type === "re-verification" ? "Re-verification" : "Verification",
        submittedDate: new Date().toISOString().split("T")[0],
        status: "SUBMITTED",
        assignedOfficer: null,
        scheduledDate: null,
        completedDate: null,
        notes: data.notes || "",
        documents: data.documents || [],
        timeline: [
          { status: "SUBMITTED", label: "Application Submitted", date: new Date().toISOString().split("T")[0], done: true },
          { status: "UNDER_REVIEW", label: "Documents Under Review", date: null, done: false },
          { status: "ASSIGNED", label: "Officer Assigned", date: null, done: false },
          { status: "SCHEDULED", label: "Inspection Scheduled", date: null, done: false },
          { status: "INSPECTION_COMPLETED", label: "Inspection Completed", date: null, done: false },
          { status: "CERTIFICATE_GENERATED", label: "Certificate Issued", date: null, done: false },
        ]
      };
      localApplications.unshift(newApplication);
      return newApplication;
    }

    try {
      const response = await api.post("/applications", data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to submit application.");
    }
  },

  async uploadApplicationDocument(applicationId, fileData) {
    if (USE_MOCK) {
      await delay(1200); // Simulate network upload time
      return {
        id: `doc-${Date.now()}`,
        name: fileData.name,
        size: `${Math.round(fileData.size / 1024)} KB`,
        uploadedAt: new Date().toISOString().split("T")[0],
        status: "Uploaded"
      };
    }

    try {
      const formData = new FormData();
      formData.append("file", fileData);
      const response = await api.post(`/applications/${applicationId}/documents`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to upload document.");
    }
  }
};
export default applicationService;
