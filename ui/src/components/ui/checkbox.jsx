import React from "react";
import { Check } from "lucide-react";
import { cn } from "../../lib/design-system/cn";

/**
 * Standardized Checkbox Component
 */
export function Checkbox({
  id,
  label,
  description,
  checked = false,
  onChange,
  disabled = false,
  className = "",
  ...props
}) {
  const checkboxId = id || (label ? `chk-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

  return (
    <label
      htmlFor={checkboxId}
      className={cn(
        "inline-flex items-start gap-2.5 cursor-pointer select-none",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <div className="relative flex items-center justify-center mt-0.5">
        <input
          id={checkboxId}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="peer sr-only"
          {...props}
        />
        <div
          className={cn(
            "w-4 h-4 rounded border transition-colors flex items-center justify-center",
            "border-border bg-surface",
            "peer-checked:bg-primary peer-checked:border-primary peer-checked:text-text-inverse",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-primary/20",
            disabled && "peer-checked:bg-text-disabled peer-checked:border-text-disabled"
          )}
        >
          {checked && <Check className="w-3 h-3 text-text-inverse stroke-[2.5]" />}
        </div>
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

export default Checkbox;
