import React from "react";
import { Check } from "lucide-react";

/**
 * FormStepper — displays progress steps in multi-step wizard processes.
 *
 * @param {Array<string>} steps - names/labels of the steps
 * @param {number} currentStep - current step index (1-indexed)
 */
function FormStepper({ steps = [], currentStep = 1 }) {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <React.Fragment key={idx}>
              {/* Step circle */}
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={[
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border transition-all duration-300",
                    isCompleted
                      ? "bg-green-600 border-green-600 text-white"
                      : isActive
                      ? "bg-blue-700 border-blue-700 text-white ring-4 ring-blue-50"
                      : "bg-white border-slate-300 text-slate-500",
                  ].join(" ")}
                >
                  {isCompleted ? <Check size={14} /> : stepNum}
                </div>
                <span
                  className={[
                    "text-[11px] font-medium mt-2 whitespace-nowrap hidden sm:block",
                    isActive ? "text-blue-700 font-semibold" : isCompleted ? "text-slate-700" : "text-slate-400",
                  ].join(" ")}
                >
                  {step}
                </span>
              </div>

              {/* Line connector */}
              {idx < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 bg-slate-200 relative -top-3 sm:-top-5">
                  <div
                    className="h-full bg-blue-700 transition-all duration-300"
                    style={{ width: isCompleted ? "100%" : "0%" }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default FormStepper;
