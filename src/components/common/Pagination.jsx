import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Pagination component.
 *
 * @param {number} currentPage - 1-indexed
 * @param {number} totalPages
 * @param {number} totalItems
 * @param {number} pageSize
 * @param {function} onPageChange - (page: number) => void
 */
function Pagination({ currentPage, totalPages, totalItems, pageSize, onPageChange }) {
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  // Build page numbers to show (max 5 around current)
  const pages = [];
  const delta = 2;
  for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between px-1 py-3 text-sm text-slate-600">
      <span className="hidden sm:block">
        Showing {start}–{end} of {totalItems} records
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {pages[0] > 1 && (
          <>
            <PageBtn page={1} current={currentPage} onClick={onPageChange} />
            {pages[0] > 2 && <span className="px-1">…</span>}
          </>
        )}

        {pages.map((p) => (
          <PageBtn key={p} page={p} current={currentPage} onClick={onPageChange} />
        ))}

        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && <span className="px-1">…</span>}
            <PageBtn page={totalPages} current={currentPage} onClick={onPageChange} />
          </>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function PageBtn({ page, current, onClick }) {
  const active = page === current;
  return (
    <button
      onClick={() => onClick(page)}
      className={[
        "w-8 h-8 rounded text-sm font-medium transition-colors",
        active
          ? "bg-blue-700 text-white cursor-default"
          : "hover:bg-slate-100 text-slate-700",
      ].join(" ")}
      aria-current={active ? "page" : undefined}
    >
      {page}
    </button>
  );
}

export default Pagination;
