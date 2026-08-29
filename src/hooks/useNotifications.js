import { useState, useEffect, useCallback } from "react";
import { notificationService } from "../services/notificationService";

/**
 * useNotifications — Custom hook to query and manage user notifications.
 * Exposes notification list, loading state, unreadCount, and operations.
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error("Failed to load notifications in hook:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read in hook:", err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Set up brief polling interval in mock mode to simulate live events
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    refresh: fetchNotifications,
  };
}
