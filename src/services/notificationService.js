import api from "./api";
import { mockNotifications } from "../mock/notificationData";
import { delay } from "../utils/helpers";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === "true";

let localNotifications = [...mockNotifications];

export const notificationService = {
  async getNotifications() {
    if (USE_MOCK) {
      await delay(400);
      return localNotifications;
    }

    try {
      const response = await api.get("/notifications");
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch notifications.");
    }
  },

  async markAsRead(id) {
    if (USE_MOCK) {
      await delay(200);
      localNotifications = localNotifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return { success: true };
    }

    try {
      const response = await api.put(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to mark notification as read.");
    }
  }
};
export default notificationService;
