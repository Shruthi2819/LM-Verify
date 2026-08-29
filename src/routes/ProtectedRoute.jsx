import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoadingPage from "../components/common/LoadingPage";
import { ROUTES } from "../config/routes";

/**
 * ProtectedRoute — guards routes that require authentication and/or a specific role.
 *
 * Architecture:
 *   Not authenticated → redirect /login (preserves intended path)
 *   Authenticated, no role restriction → render
 *   Authenticated, role matches → render
 *   Authenticated, role mismatch → redirect /unauthorized
 *
 * IMPORTANT: Frontend route protection is for UX/navigation only.
 * The backend API must enforce authorization as the actual security boundary.
 *
 * @param {React.ReactNode} children
 * @param {string|string[]} allowedRoles - role(s) permitted to access this route
 */
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingPage message="Verifying session…" />;
  }

  if (!isAuthenticated) {
    // Preserve intended destination so we can redirect after login
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return children;
}

export default ProtectedRoute;
