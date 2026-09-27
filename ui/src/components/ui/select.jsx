import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/design-system/cn";
import { FormField } from "./form-field";

/**
 * Standardized Select Component
 */
export function Select({
  label,
  id,
  value,
  onChange,
  options = [],
  disabled = false,
  error,
  helperText,
  description,
  size = "md",
  className = "",
  containerClassName = "",
  required = false,
  children,
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  const sizeStyles = {
    sm: "h-8 text-xs pl-2.5 pr-8",
    md: "h-9 text-sm pl-3 pr-8",
    lg: "h-10 text-sm pl-3.5 pr-9",
  }[size] || "h-9 text-sm pl-3 pr-8";

  return (
    <FormField
      label={label}
      htmlFor={selectId}
      required={required}
      error={error}
      description={description || helperText}
      className={containerClassName}
    >
      <div className="relative w-full">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={cn(
            "w-full appearance-none rounded-md border text-text-primary bg-surface transition-colors cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
            "disabled:bg-surface-soft disabled:text-text-disabled disabled:cursor-not-allowed",
            sizeStyles,
            error ? "border-danger focus:ring-danger/20 focus:border-danger" : "border-border",
            className
          )}
          {...props}
        >
          {children ||
            options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
        </select>

        <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    </FormField>
  );
}

export default Select;
