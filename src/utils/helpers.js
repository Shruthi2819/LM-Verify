/**
 * General utility helpers.
 * Pure functions — no side effects, no imports from React.
 */

/**
 * Format a date string to a readable format.
 * @param {string|Date} date
 * @param {object} options - Intl.DateTimeFormat options
 */
export function formatDate(date, options = {}) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  }).format(new Date(date));
}

/**
 * Truncate a string to maxLength characters.
 */
export function truncate(str, maxLength = 40) {
  if (!str) return "";
  return str.length > maxLength ? `${str.substring(0, maxLength)}…` : str;
}

/**
 * Capitalise first letter of every word.
 */
export function titleCase(str) {
  if (!str) return "";
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Generate a friendly certificate ID for display.
 */
export function formatCertId(id) {
  if (!id) return "—";
  return id.toString().toUpperCase();
}

/**
 * Return initials from a full name (max 2 chars).
 */
export function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Deep clone a plain object (for mock data manipulation).
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Delay utility (for simulating async operations in dev).
 */
export function delay(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Build query string from a params object.
 */
export function buildQueryString(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      query.append(key, val);
    }
  });
  return query.toString() ? `?${query.toString()}` : "";
}
