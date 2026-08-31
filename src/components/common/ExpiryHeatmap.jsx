import React from "react";
import { Calendar, Flame, AlertCircle } from "lucide-react";

export function ExpiryHeatmap({ heatmap = [], selectedHorizon = "", onSelectHorizon }) {
  const maxCount = Math.max(...heatmap.map(h => h.count), 1);

  const getBarColor = (key, count) => {
    if (key === "EXPIRED" && count > 0) return "bg-red-500 hover:bg-red-600";
    if (key === "0_7_DAYS") return "bg-rose-500 hover:bg-rose-600";
    if (key === "8_15_DAYS") return "bg-amber-500 hover:bg-amber-600";
    if (key === "16_30_DAYS") return "bg-yellow-500 hover:bg-yellow-600";
    if (key === "31_60_DAYS") return "bg-blue-500 hover:bg-blue-600";
    if (key === "61_90_DAYS") return "bg-indigo-500 hover:bg-indigo-600";
    return "bg-emerald-500 hover:bg-emerald-600";
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-xs">
        <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
          <Flame size={14} className="text-amber-500" />
          Expiry Concentration Heatmap
        </span>
        <span className="text-[11px] text-slate-400">Click a time block to filter</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {heatmap.map((item) => {
          const isSelected = selectedHorizon.toLowerCase() === item.key.toLowerCase();
          const percent = Math.round((item.count / maxCount) * 100);

          return (
            <div
              key={item.key}
              onClick={() => onSelectHorizon && onSelectHorizon(isSelected ? "" : item.key)}
              className={`p-3 rounded-lg border text-center transition cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-blue-50/80 border-blue-500 ring-2 ring-blue-400/20 dark:bg-blue-950/40 dark:border-blue-500"
                  : "bg-white border-slate-200/80 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700"
              }`}
            >
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block truncate" title={item.label}>
                  {item.label}
                </span>
                <span className="text-lg font-bold text-slate-800 dark:text-slate-100 block my-1">
                  {item.count}
                </span>
              </div>

              {/* Progress bar visualizer */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                <div
                  className={`h-full rounded-full transition-all ${getBarColor(item.key, item.count)}`}
                  style={{ width: `${Math.max(percent, 8)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ExpiryHeatmap;
