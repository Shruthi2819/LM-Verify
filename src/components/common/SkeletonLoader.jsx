import React from "react";

export function SkeletonBlock({ className = "" }) {
  return <div className={["animate-pulse bg-slate-200 rounded", className].join(" ")} />;
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="w-full space-y-3">
      <div className="flex gap-4 border-b border-slate-200 pb-3">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonBlock key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 py-2 border-b border-slate-100 last:border-0">
          {Array.from({ length: cols }).map((_, c) => (
            <SkeletonBlock key={c} className="h-6 flex-1" style={{ opacity: 1 - (r * 0.15) }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function PanelSkeleton() {
  return (
    <div className="space-y-4 w-full">
      <SkeletonBlock className="h-8 w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SkeletonBlock className="h-28" />
        <SkeletonBlock className="h-28" />
        <SkeletonBlock className="h-28" />
      </div>
      <SkeletonBlock className="h-64 w-full" />
    </div>
  );
}

export default {
  Block: SkeletonBlock,
  Table: TableSkeleton,
  Panel: PanelSkeleton
};
