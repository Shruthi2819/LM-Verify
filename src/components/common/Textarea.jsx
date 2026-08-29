import { forwardRef } from "react";

/**
 * Textarea — same design language as Input.
 */
const Textarea = forwardRef(
  ({ label, required, error, helperText, id, rows = 4, className = "", ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-slate-700">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={[
            "w-full rounded-md border bg-white text-slate-800 text-sm px-3 py-2",
            "placeholder:text-slate-400 resize-y",
            "transition-colors duration-150",
            "disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed",
            error
              ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
              : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none",
            className,
          ].join(" ")}
          {...props}
        />

        {error && <p className="text-xs text-red-600 flex items-center gap-1"><span>⚠</span> {error}</p>}
        {!error && helperText && <p className="text-xs text-slate-500">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
