import LoadingSpinner from "./LoadingSpinner";
import EmptyState from "./EmptyState";

/**
 * Reusable Table component.
 *
 * @param {Array<{key: string, header: string, render?: (row) => ReactNode}>} columns
 * @param {Array<object>} data - array of row objects
 * @param {boolean} loading
 * @param {string} emptyTitle
 * @param {string} emptyDescription
 * @param {string} keyField - field name to use as row key (default: 'id')
 * @param {function} onRowClick - optional row click handler
 */
function Table({
  columns = [],
  data = [],
  loading = false,
  emptyTitle = "No records found",
  emptyDescription = "",
  keyField = "id",
  onRowClick,
  className = "",
}) {
  return (
    <div className={["w-full overflow-x-auto rounded-lg border border-slate-200", className].join(" ")}>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="py-16 text-center">
                <LoadingSpinner />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-10">
                <EmptyState title={emptyTitle} description={emptyDescription} />
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={row[keyField]}
                onClick={() => onRowClick?.(row)}
                className={[
                  "border-b border-slate-100 last:border-0",
                  "transition-colors duration-100",
                  onRowClick ? "cursor-pointer hover:bg-slate-50" : "",
                ].join(" ")}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-slate-700 whitespace-nowrap">
                    {col.render ? col.render(row) : row[col.key] ?? "—"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
