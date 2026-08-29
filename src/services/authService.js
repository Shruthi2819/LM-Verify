import api from "./api";
import { STORAGE_KEYS } from "../utils/constants";
import { ROLES, ROLE_HOME } from "../config/routes";
import { delay } from "../utils/helpers";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === "true";

// Mock users for fallback
const MOCK_USERS = {
  "business@example.com": {
    id: "usr-001",
    name: "Rajesh Kumar",
    email: "business@example.com",
    role: ROLES.BUSINESS,
    organisation: "Acme Weighing Solutions Pvt. Ltd.",
    phone: "+91 98765 43210",
    address: "Unit 4, MIDC Industrial Area, Pune",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411019"
  },
  "lmo@example.com": {
    id: "usr-002",
    name: "Priya Sharma",
    email: "lmo@example.com",
    role: ROLES.LMO,
    organisation: "Legal Metrology Dept., Maharashtra",
  },
  "gatc@example.com": {
    id: "usr-003",
    name: "Anand Verma",
    email: "gatc@example.com",
    role: ROLES.GATC,
    organisation: "NABL Approved Test Centre, Pune",
  },
  "admin@example.com": {
    id: "usr-004",
    name: "Sunita Patil",
    email: "admin@example.com",
    role: ROLES.ADMIN,
    organisation: "LM Verify Platform Administration",
  }
};

export const authService = {
  async login(email, password) {
    if (USE_MOCK) {
      await delay(1000);
      const emailLower = email.toLowerCase();
      
      // 1. Check pre-seeded mock users
      let user = MOCK_USERS[emailLower];
      
      // 2. Check dynamically registered users in local storage
      if (!user) {
        const registered = JSON.parse(localStorage.getItem("lmv_registered_users") || "[]");
        user = registered.find((u) => u.email.toLowerCase() === emailLower);
      }
      
      // 3. Fallback default if not found
      if (!user) {
        user = {
          id: "usr-001",
          name: "Rajesh Kumar",
          email: email,
          role: ROLES.BUSINESS,
          organisation: "Acme Weighing Solutions Pvt. Ltd.",
          phone: "+91 98765 43210",
          address: "Unit 4, MIDC Industrial Area, Pune",
          city: "Pune",
          state: "Maharashtra",
          pincode: "411019"
        };
      }
      
      const token = `mock-jwt-token-${user.role}-${Date.now()}`;
      return { token, user };
    }

    try {
      const response = await api.post("/auth/login", { email, password });
      return {
        token: response.data.access_token,
        user: response.data.user
      };
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async register(data) {
    if (USE_MOCK) {
      await delay(1000);
      
      const emailLower = data.email.toLowerCase();
      const registered = JSON.parse(localStorage.getItem("lmv_registered_users") || "[]");
      
      if (registered.some((u) => u.email.toLowerCase() === emailLower) || MOCK_USERS[emailLower]) {
        throw new Error("Email address is already registered.");
      }

      const newUser = {
        id: `usr-${Date.now().toString().substring(9)}`,
        name: data.fullName,
        email: data.email,
        phone: data.phone,
        role: data.stakeholderType, // 'business', 'lmo', 'gatc'
        organisation: data.organisation,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode
      };

      registered.push(newUser);
      localStorage.setItem("lmv_registered_users", JSON.stringify(registered));

      return { success: true, message: "Registration submitted successfully" };
    }

    try {
      const response = await api.post("/auth/register", data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async getCurrentUser() {
    if (USE_MOCK) {
      await delay(500);
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      return storedUser ? JSON.parse(storedUser) : null;
    }

    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async forgotPassword(email) {
    if (USE_MOCK) {
      await delay(800);
      return { success: true };
    }
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async resetPassword(token, password) {
    if (USE_MOCK) {
      await delay(800);
      return { success: true };
    }
    try {
      const response = await api.post("/auth/reset-password", { token, password });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  handleError(error) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.detail || error.response.data?.message;
      if (status === 422) {
        return new Error("Validation failed. Please verify your details.");
      }
      return new Error(message || `Request failed with status ${status}`);
    }
    return new Error("Network error. Please check your internet connection.");
  }
};

export default authService;
