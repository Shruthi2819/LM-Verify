import React from "react";
import { Check } from "lucide-react";
import { formatDate } from "../../utils/helpers";

/**
 * ApplicationTimeline — vertical timeline for tracking application milestone states.
 */
function ApplicationTimeline({ timeline = [] }) {
  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {timeline.map((event, idx) => {
          const isLast = idx === timeline.length - 1;
          const isDone = event.done;
          const isRejectedEvent = event.status === "REJECTED";

          return (
            <li key={event.status}>
              <div className="relative pb-8">
                {/* Visual connecting line */}
                {!isLast && (
                  <span
                    className={[
                      "absolute top-4 left-4 -ml-px h-full w-0.5",
                      isRejectedEvent
                        ? "bg-red-500"
                        : isDone
                        ? "bg-green-500"
                        : "bg-slate-200"
                    ].join(" ")}
                    aria-hidden="true"
                  />
                )}

                <div className="relative flex space-x-3">
                  {/* Timeline icon */}
                  <div>
                    <span
                      className={[
                        "h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white",
                        isRejectedEvent
                          ? "bg-red-600 text-white"
                          : isDone
                          ? "bg-green-600 text-white"
                          : "bg-slate-100 border border-slate-300 text-slate-400"
                      ].join(" ")}
                    >
                      {isRejectedEvent ? (
                        <span className="font-bold text-xs select-none">✕</span>
                      ) : isDone ? (
                        <Check size={14} className="stroke-[3]" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      )}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p
                        className={[
                          "text-xs",
                          isRejectedEvent
                            ? "font-semibold text-red-700"
                            : isDone
                            ? "font-semibold text-slate-800"
                            : "text-slate-500"
                        ].join(" ")}
                      >
                        {event.label}
                      </p>
                    </div>
                    {event.date && (
                      <div className="text-right text-[10px] text-slate-400 whitespace-nowrap">
                        {formatDate(event.date)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default ApplicationTimeline;
