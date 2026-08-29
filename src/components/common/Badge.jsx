/**
 * Badge — generic small label badge.
 * Use StatusBadge for verification statuses.
 * Use Badge for other categorical labels.
 */

const variants = {
  default: "bg-slate-100 text-slate-700 border-slate-200",
  blue:    "bg-blue-50 text-blue-700 border-blue-200",
  green:   "bg-green-50 text-green-700 border-green-200",
  amber:   "bg-amber-50 text-amber-700 border-amber-200",
  red:     "bg-red-50 text-red-700 border-red-200",
};

function Badge({ children, variant = "default", className = "" }) {
  return (
    <span
      className={[
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variants[variant] || variants.default,
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

export default Badge;
