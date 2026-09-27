import React from "react";
import { cn } from "../../lib/design-system/cn";

/**
 * Standardized Switch / Toggle Component
 */
export function Switch({
  id,
  label,
  description,
  checked = false,
  onChange,
  disabled = false,
  className = "",
  size = "md",
  ...props
}) {
  const switchId = id || (label ? `sw-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

  const trackSizes = {
    sm: "w-7 h-4",
    md: "w-9 h-5",
    lg: "w-11 h-6",
  }[size] || "w-9 h-5";

  const thumbSizes = {
    sm: "w-3 h-3 translate-x-0.5 peer-checked:translate-x-3.5",
    md: "w-4 h-4 translate-x-0.5 peer-checked:translate-x-4.5",
    lg: "w-5 h-5 translate-x-0.5 peer-checked:translate-x-5.5",
  }[size] || "w-4 h-4 translate-x-0.5 peer-checked:translate-x-4.5";

  return (
    <label
      htmlFor={switchId}
      className={cn(
        "inline-flex items-center gap-3 cursor-pointer select-none",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <div className="relative inline-flex items-center">
        <input
          id={switchId}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange && onChange(e.target.checked)}
          disabled={disabled}
          className="peer sr-only"
          {...props}
        />
        <div
          className={cn(
            "rounded-full bg-border-hover transition-colors peer-checked:bg-primary",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-primary/20",
            trackSizes
          )}
        />
        <div
          className={cn(
            "absolute rounded-full bg-white shadow-subtle transition-transform duration-150 ease-out",
            thumbSizes
          )}
        />
      </div>

      {(label || description) && (
        <div className="flex flex-col text-left">
          {label && <span className="text-xs font-medium text-text-primary leading-tight">{label}</span>}
          {description && <span className="text-[11px] text-text-muted mt-0.5 leading-snug">{description}</span>}
        </div>
      )}
    </label>
  );
}

export default Switch;
