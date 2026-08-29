import React from "react";
import Card from "./Card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

/**
 * StatCard — displays key numeric indicators with visual trend context.
 */
function StatCard({ label, value, change, trend, loading = false }) {
  if (loading) {
    return (
      <Card className="animate-pulse">
        <div className="h-3 w-2/3 bg-slate-200 rounded mb-2" />
        <div className="h-7 w-1/2 bg-slate-200 rounded mb-1.5" />
        <div className="h-3.5 w-3/4 bg-slate-200 rounded" />
      </Card>
    );
  }

  const isUp = trend === "up";
  const isDown = trend === "down";
  const trendColor = isUp ? "text-green-600 bg-green-50 border-green-100" : isDown ? "text-red-600 bg-red-50 border-red-100" : "text-slate-500 bg-slate-50 border-slate-100";
  const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500 truncate uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
      </div>
      {change && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className={["inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium border", trendColor].join(" ")}>
            <TrendIcon size={10} />
            {change}
          </span>
        </div>
      )}
    </Card>
  );
}

export default StatCard;
