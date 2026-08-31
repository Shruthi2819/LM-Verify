import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import Button from "./Button";

/**
 * Modal component with fade animation.
 *
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {string} title
 * @param {string} description
 * @param {React.ReactNode} children - body content
 * @param {React.ReactNode} footer - footer actions (optional)
 * @param {string} size - sm | md | lg | xl
 */
function Modal({ isOpen, open, onClose, title, description, children, footer, size = "md" }) {
  const activeOpen = isOpen !== undefined ? isOpen : open;

  // Close on Escape key
  useEffect(() => {
    if (!activeOpen) return;
    const handle = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [activeOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = activeOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [activeOpen]);

  if (!activeOpen) return null;

  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-0"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={[
          "relative w-full bg-white rounded-xl shadow-xl z-10 transition-all duration-200 transform scale-100",
          widths[size] || widths.md,
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-100">
          <div>
            <h2 id="modal-title" className="text-base font-semibold text-slate-800">
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-sm text-slate-500">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-5 pb-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export default Modal;
