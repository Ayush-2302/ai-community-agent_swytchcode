import React from "react";
import { Search, X } from "lucide-react";
import { cn } from "../../lib/design-system/cn";

/**
 * Standardized SearchInput Component
 */
export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  onClear,
  size = "md",
  className = "",
  containerClassName = "",
  disabled = false,
  ...props
}) {
  const sizeStyles = {
    sm: "h-8 text-xs pl-8 pr-7",
    md: "h-9 text-sm pl-8.5 pr-8",
    lg: "h-10 text-sm pl-9 pr-8.5",
  }[size] || "h-9 text-sm pl-8.5 pr-8";

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange({ target: { value: "" } });
    }
  };

  return (
    <div className={cn("relative flex items-center w-full", containerClassName)}>
      <div className="absolute left-2.5 text-text-muted pointer-events-none flex items-center justify-center">
        <Search className="w-4 h-4 shrink-0" />
      </div>

      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full rounded-md border text-text-primary bg-surface placeholder:text-text-disabled transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary border-border",
          "disabled:bg-surface-soft disabled:text-text-disabled disabled:cursor-not-allowed",
          sizeStyles,
          className
        )}
        {...props}
      />

      {value && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 text-text-muted hover:text-text-primary p-0.5 rounded transition-colors"
          title="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export default SearchInput;
