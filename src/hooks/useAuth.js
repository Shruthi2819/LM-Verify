import { useContext } from "react";
import AuthContext from "../context/AuthContext";

/**
 * useAuth — convenience hook for consuming AuthContext.
 *
 * Usage:
 *   const { user, isAuthenticated, login, logout, role } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
