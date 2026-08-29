import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";

/**
 * ConfirmDialog — for destructive or important actions.
 *
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {function} onConfirm
 * @param {string} title
 * @param {string} description
 * @param {string} confirmLabel
 * @param {string} confirmVariant - danger | primary | success
 * @param {boolean} loading
 */
function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Confirm",
  confirmVariant = "danger",
  loading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title=""
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center gap-3 py-2">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
          <AlertTriangle size={22} className="text-red-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
