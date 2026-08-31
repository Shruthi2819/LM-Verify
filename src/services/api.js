import axios from "axios";
import { STORAGE_KEYS } from "../utils/constants.js";

/**
 * Axios instance for all API calls.
 *
 * Base URL is read from the environment variable VITE_API_BASE_URL.
 * In Part 2, connect this to the FastAPI backend.
 */
const api = axios.create({
  baseURL: (typeof import.meta !== "undefined" && import.meta?.env?.VITE_API_BASE_URL) || "http://localhost:8000/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request interceptor ────────────────────────────────────────────────────
// Attaches the JWT Authorization header to every request if a token exists.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor ───────────────────────────────────────────────────
// Handles global error cases — especially 401 Unauthorized.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear local auth state and redirect
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      // Avoid importing navigate here; components handle redirect via AuthContext
      window.dispatchEvent(new Event("lmv:unauthorized"));
    }
    return Promise.reject(error);
  }
);

export default api;
