import { Inbox } from "lucide-react";

/**
 * EmptyState — for empty lists, tables, or sections.
 *
 * @param {string} title
 * @param {string} description
 * @param {React.ReactNode} action - optional CTA button
 * @param {React.ReactNode} icon - optional custom icon
 */
function EmptyState({ title = "No records found", description, action, icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-2">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-1">
        {icon || <Inbox size={22} className="text-slate-400" />}
      </div>
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      {description && (
        <p className="text-xs text-slate-500 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export default EmptyState;
