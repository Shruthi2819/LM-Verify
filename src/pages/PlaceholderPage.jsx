import { Construction } from "lucide-react";
import Card from "../components/common/Card";

/**
 * PlaceholderPage — shown for routes that are part of the navigation
 * but not yet implemented. Replaced with real pages in Part 2+.
 */
function PlaceholderPage({ title, description }) {
  return (
    <div className="max-w-lg mx-auto py-12">
      <Card className="text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto">
          <Construction size={24} className="text-amber-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-800">{title}</h1>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-500 text-left">
          <p className="font-semibold text-slate-600 mb-1">Part 1 — Foundation complete</p>
          <p>This section is part of the navigation architecture. The full implementation will be connected to the FastAPI backend in Part 2.</p>
        </div>
      </Card>
    </div>
  );
}

export default PlaceholderPage;
