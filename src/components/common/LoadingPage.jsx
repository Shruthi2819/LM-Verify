import LoadingSpinner from "./LoadingSpinner";
import { appConfig } from "../../config/appConfig";

/**
 * LoadingPage — full-page loading state shown while
 * auth rehydrates or large async operations run.
 */
function LoadingPage({ message = "Loading…" }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-50 z-40 gap-4">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-blue-700 rounded-md flex items-center justify-center">
          <span className="text-white font-bold text-sm">LM</span>
        </div>
        <span className="text-lg font-semibold text-slate-800">{appConfig.name}</span>
      </div>
      <LoadingSpinner size="lg" />
      <p className="text-sm text-slate-500 mt-2">{message}</p>
    </div>
  );
}

export default LoadingPage;
