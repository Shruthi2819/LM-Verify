import { forwardRef } from "react";

const variants = {
  primary:
    "bg-blue-700 text-white hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 border border-transparent",
  secondary:
    "bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 border border-transparent",
  outline:
    "bg-transparent text-blue-700 border border-blue-700 hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 border border-transparent",
  success:
    "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 border border-transparent",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 border border-transparent",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-2.5 text-base",
};

/**
 * Reusable Button component.
 *
 * @param {string} variant - primary | secondary | outline | danger | success | ghost
 * @param {string} size - sm | md | lg
 * @param {boolean} loading - shows spinner and disables button
 * @param {boolean} disabled
 * @param {React.ReactNode} leftIcon - icon to render before label
 * @param {React.ReactNode} rightIcon - icon to render after label
 * @param {string} className - additional Tailwind classes
 */
const Button = forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      className = "",
      type = "button",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={[
          "inline-flex items-center justify-center gap-2 font-medium rounded-md",
          "transition-colors duration-150 cursor-pointer",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant] || variants.primary,
          sizes[size] || sizes.md,
          className,
        ].join(" ")}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin h-4 w-4 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        ) : (
          leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
        )}
        {children}
        {rightIcon && !loading && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
