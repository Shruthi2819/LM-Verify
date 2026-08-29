import { Search, X } from "lucide-react";
import { useState } from "react";

/**
 * SearchBar with icon, placeholder, and clear button.
 *
 * @param {string} placeholder
 * @param {function} onSearch - (query: string) => void
 * @param {string} className
 */
function SearchBar({ placeholder = "Search…", value, onChange, onSearch, className = "" }) {
  const [localValue, setLocalValue] = useState("");

  const isControlled = value !== undefined && onChange !== undefined;
  const activeValue = isControlled ? value : localValue;

  const handleChange = (e) => {
    const newVal = e.target.value;
    if (isControlled) {
      onChange(newVal);
    } else {
      setLocalValue(newVal);
    }
    onSearch?.(newVal);
  };

  const handleClear = () => {
    if (isControlled) {
      onChange("");
    } else {
      setLocalValue("");
    }
    onSearch?.("");
  };

  return (
    <div className={["relative flex-1 max-w-sm", className].join(" ")}>
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
      <input
        type="search"
        value={activeValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 py-2 rounded-md border border-slate-300 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
      />
      {activeValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
