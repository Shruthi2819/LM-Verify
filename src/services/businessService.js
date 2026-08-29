import api from "./api";
import { businessStats } from "../mock/dashboardData";
import { delay } from "../utils/helpers";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === "true";

export const businessService = {
  async getDashboardStats() {
    if (USE_MOCK) {
      await delay(600);
      return businessStats;
    }

    try {
      const response = await api.get("/business/dashboard/stats");
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch dashboard statistics.");
    }
  },

  async getProfile() {
    if (USE_MOCK) {
      await delay(600);
      const storedUser = localStorage.getItem("lmv_user");
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        return {
          businessName: userObj.organisation || "Acme Weighing Solutions Pvt. Ltd.",
          ownerName: userObj.name || "Rajesh Kumar",
          email: userObj.email || "business@example.com",
          phone: userObj.phone || "+91 98765 43210",
          address: userObj.address || "Unit 4, MIDC Industrial Area",
          city: userObj.city || "Pune",
          state: userObj.state || "Maharashtra",
          pincode: userObj.pincode || "411019",
          registrationNumber: userObj.registrationNumber || "LM-MH-2024-00481",
          licenseNumber: userObj.licenseNumber || "LML-PUNE-8831",
          licenseExpiry: userObj.licenseExpiry || "2028-12-31"
        };
      }
      return {
        businessName: "Acme Weighing Solutions Pvt. Ltd.",
        ownerName: "Rajesh Kumar",
        email: "business@example.com",
        phone: "+91 98765 43210",
        address: "Unit 4, MIDC Industrial Area",
        city: "Pune",
        state: "Maharashtra",
        pincode: "411019",
        registrationNumber: "LM-MH-2024-00481",
        licenseNumber: "LML-PUNE-8831",
        licenseExpiry: "2028-12-31"
      };
    }

    try {
      const response = await api.get("/business/profile");
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch business profile.");
    }
  },

  async updateProfile(profileData) {
    if (USE_MOCK) {
      await delay(800);
      const storedUser = localStorage.getItem("lmv_user");
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        const updatedUser = {
          ...userObj,
          name: profileData.ownerName,
          organisation: profileData.businessName,
          phone: profileData.phone,
          address: profileData.address,
          city: profileData.city,
          state: profileData.state,
          pincode: profileData.pincode
        };
        localStorage.setItem("lmv_user", JSON.stringify(updatedUser));

        // Also update registered list in local storage
        const registered = JSON.parse(localStorage.getItem("lmv_registered_users") || "[]");
        const idx = registered.findIndex((u) => u.email.toLowerCase() === userObj.email.toLowerCase());
        if (idx !== -1) {
          registered[idx] = updatedUser;
          localStorage.setItem("lmv_registered_users", JSON.stringify(registered));
        }
      }
      return { success: true, profile: profileData };
    }

    try {
      const response = await api.put("/business/profile", profileData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to update business profile.");
    }
  }
};

export default businessService;
