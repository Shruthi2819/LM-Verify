import { forwardRef } from "react";

/**
 * Input component with label, required indicator, error/helper text, and focus state.
 */
const Input = forwardRef(
  (
    {
      label,
      required,
      error,
      helperText,
      id,
      className = "",
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-slate-700"
          >
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              "w-full rounded-md border bg-white text-slate-800 text-sm",
              "placeholder:text-slate-400",
              "transition-colors duration-150",
              "disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed",
              error
                ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
                : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none",
              leftIcon ? "pl-10 pr-3 py-2" : rightIcon ? "pl-3 pr-10 py-2" : "px-3 py-2",
              className,
            ].join(" ")}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
        {!error && helperText && (
          <p className="text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
