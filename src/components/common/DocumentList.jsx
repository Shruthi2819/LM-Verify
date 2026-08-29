import React from "react";
import { FileText, Trash2, CheckCircle2 } from "lucide-react";

/**
 * DocumentList — displays uploaded documents with size and actions.
 */
function DocumentList({ documents = [], onRemove, readOnly = false }) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-4 border border-dashed border-slate-200 rounded-lg text-xs text-slate-400">
        No documents uploaded yet.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {documents.map((doc) => (
        <li
          key={doc.id}
          className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
              <FileText size={16} className="text-slate-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-700 truncate">{doc.name}</p>
              <p className="text-[10px] text-slate-400">{doc.size}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-100">
              <CheckCircle2 size={10} /> Verified
            </span>
            {!readOnly && onRemove && (
              <button
                type="button"
                onClick={() => onRemove(doc.id)}
                className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                aria-label="Delete document"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default DocumentList;
