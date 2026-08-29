import api from "./api";
import { mockInstruments, mockVerificationHistory } from "../mock/instrumentData";
import { delay } from "../utils/helpers";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === "true";

// Local state for mock CRUD operations
let localInstruments = [...mockInstruments];

export const instrumentService = {
  async getInstruments(params = {}) {
    if (USE_MOCK) {
      await delay(600);
      const { search, type, status, page = 1, limit = 10 } = params;
      let filtered = [...localInstruments];

      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.id.toLowerCase().includes(query) ||
            item.serialNumber.toLowerCase().includes(query) ||
            item.manufacturer.toLowerCase().includes(query) ||
            item.model.toLowerCase().includes(query)
        );
      }

      if (type) {
        filtered = filtered.filter((item) => item.type === type);
      }

      if (status) {
        filtered = filtered.filter((item) => item.verificationStatus === status);
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
      const response = await api.get("/instruments", { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch instruments.");
    }
  },

  async getInstrument(id) {
    if (USE_MOCK) {
      await delay(500);
      const instrument = localInstruments.find((item) => item.id === id);
      if (!instrument) throw new Error("Instrument not found.");
      return {
        ...instrument,
        verificationHistory: mockVerificationHistory
      };
    }

    try {
      const response = await api.get(`/instruments/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch instrument details.");
    }
  },

  async createInstrument(data) {
    if (USE_MOCK) {
      await delay(800);
      const newId = `INS-2026-${String(localInstruments.length + 1).padStart(5, "0")}`;
      const newInstrument = {
        id: newId,
        ...data,
        verificationStatus: "Unverified",
        lastVerifiedDate: null,
        certificateId: null,
        certificateExpiry: null,
        daysToExpiry: null
      };
      localInstruments.unshift(newInstrument);
      return newInstrument;
    }

    try {
      const response = await api.post("/instruments", data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to register instrument.");
    }
  },

  async updateInstrument(id, data) {
    if (USE_MOCK) {
      await delay(800);
      const idx = localInstruments.findIndex((item) => item.id === id);
      if (idx === -1) throw new Error("Instrument not found.");
      
      const updated = {
        ...localInstruments[idx],
        ...data
      };
      localInstruments[idx] = updated;
      return updated;
    }

    try {
      const response = await api.put(`/instruments/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to update instrument.");
    }
  }
};
export default instrumentService;
