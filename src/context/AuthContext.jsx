import { createContext, useState, useEffect, useCallback } from "react";
import { STORAGE_KEYS } from "../utils/constants";
import { ROLES, ROLE_HOME } from "../config/routes";
import { authService } from "../services/authService";

/**
 * AuthContext — JWT-ready authentication context.
 *
 * Exposes login, logout, and registration methods wired to authService.
 * Maintains current user profile, token, role, and loading state.
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    async function rehydrate() {
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Optionally, verify session with backend in the background
          if (import.meta.env.VITE_USE_MOCK_DATA !== "true") {
            const freshUser = await authService.getCurrentUser();
            if (freshUser) {
              setUser(freshUser);
              localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(freshUser));
            }
          }
        } catch (error) {
          console.error("Session rehydration failed:", error);
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
        }
      }
      setIsLoading(false);
    }
    rehydrate();
  }, []);

  // Listen for 401 events from the Axios interceptor
  useEffect(() => {
    const handle = () => logout();
    window.addEventListener("lmv:unauthorized", handle);
    return () => window.removeEventListener("lmv:unauthorized", handle);
  }, []);

  /**
   * login — requests token and user details from authService.
   */
  const login = useCallback(async (email, password) => {
    const { token: receivedToken, user: receivedUser } = await authService.login(email, password);

    localStorage.setItem(STORAGE_KEYS.TOKEN, receivedToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(receivedUser));

    setToken(receivedToken);
    setUser(receivedUser);

    return ROLE_HOME[receivedUser.role] || "/";
  }, []);

  /**
   * register — submits business registration, then redirects to login page.
   */
  const registerUser = useCallback(async (data) => {
    return await authService.register(data);
  }, []);

  /**
   * logout — clears local credentials.
   */
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    register: registerUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
