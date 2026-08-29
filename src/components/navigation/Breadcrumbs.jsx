import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

/**
 * Breadcrumbs — auto-generates breadcrumbs from the current URL path.
 *
 * @param {Array<{label: string, path?: string}>} items - manual override (optional)
 */
function Breadcrumbs({ items }) {
  const location = useLocation();

  // Auto-generate from path if no manual items provided
  const crumbs = items || generateCrumbs(location.pathname);

  if (crumbs.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1 text-xs text-slate-500 mb-4" aria-label="Breadcrumb">
      <Link to="/" className="hover:text-slate-700 transition-colors flex items-center gap-1">
        <Home size={12} />
      </Link>
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <span key={index} className="flex items-center gap-1">
            <ChevronRight size={12} className="text-slate-300" />
            {isLast || !crumb.path ? (
              <span className="text-slate-700 font-medium">{crumb.label}</span>
            ) : (
              <Link to={crumb.path} className="hover:text-slate-700 transition-colors">
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

function generateCrumbs(pathname) {
  const parts = pathname.split("/").filter(Boolean);
  const crumbs = [];
  let accumulated = "";

  for (const part of parts) {
    accumulated += `/${part}`;
    crumbs.push({
      label: formatSegment(part),
      path: accumulated,
    });
  }

  return crumbs;
}

function formatSegment(segment) {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default Breadcrumbs;
