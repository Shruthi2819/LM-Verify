import { APP_STATUS } from "../../utils/constants";

const statusConfig = {
  [APP_STATUS.VERIFIED]:     { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200",  dot: "bg-green-500",  label: "✓ Verified" },
  [APP_STATUS.PENDING]:      { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200",  dot: "bg-amber-500",  label: "⏳ Pending" },
  [APP_STATUS.REJECTED]:     { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200",    dot: "bg-red-500",    label: "✕ Rejected" },
  [APP_STATUS.EXPIRED]:      { bg: "bg-slate-100", text: "text-slate-600",  border: "border-slate-200",  dot: "bg-slate-400",  label: "Expired" },
  [APP_STATUS.SUBMITTED]:    { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200",   dot: "bg-blue-500",   label: "Submitted" },
  [APP_STATUS.UNDER_REVIEW]: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", dot: "bg-violet-500", label: "Under Review" },
  [APP_STATUS.SCHEDULED]:    { bg: "bg-sky-50",    text: "text-sky-700",    border: "border-sky-200",    dot: "bg-sky-500",    label: "Scheduled" },
  [APP_STATUS.COMPLETED]:    { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200",  dot: "bg-green-500",  label: "✓ Completed" },
  [APP_STATUS.ACTIVE]:       { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200",  dot: "bg-green-500",  label: "Active" },
  [APP_STATUS.INACTIVE]:     { bg: "bg-slate-100", text: "text-slate-600",  border: "border-slate-200",  dot: "bg-slate-400",  label: "Inactive" },
  "In Progress":             { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200",   dot: "bg-blue-500",   label: "In Progress" },
  "High":                    { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200",    dot: "bg-red-500",    label: "High Priority" },
  "Normal":                  { bg: "bg-slate-50",  text: "text-slate-600",  border: "border-slate-200",  dot: "bg-slate-400",  label: "Normal" },
};

const fallback = {
  bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400", label: null,
};

/**
 * StatusBadge — semantic colour-coded badge for verification statuses.
 *
 * @param {string} status - one of APP_STATUS values
 * @param {boolean} showDot - show coloured dot indicator
 * @param {string} className
 */
function StatusBadge({ status, showDot = true, className = "" }) {
  const cfg = statusConfig[status] || fallback;
  const displayLabel = cfg.label || status || "Unknown";

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        cfg.bg, cfg.text, cfg.border, className,
      ].join(" ")}
    >
      {showDot && <span className={["w-1.5 h-1.5 rounded-full flex-shrink-0", cfg.dot].join(" ")} />}
      {displayLabel}
    </span>
  );
}

export default StatusBadge;
