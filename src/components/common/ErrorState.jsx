import { AlertCircle, RefreshCw } from "lucide-react";
import Button from "./Button";

/**
 * ErrorState — for data-fetch errors inside page sections or cards.
 *
 * @param {string} title
 * @param {string} description
 * @param {function} onRetry
 */
function ErrorState({
  title = "Unable to load data",
  description = "An error occurred while fetching the information. Please try again.",
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-3">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
        <AlertCircle size={22} className="text-red-500" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-1">{title}</h3>
        <p className="text-xs text-slate-500 max-w-xs">{description}</p>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw size={14} />}
          onClick={onRetry}
        >
          Try Again
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
