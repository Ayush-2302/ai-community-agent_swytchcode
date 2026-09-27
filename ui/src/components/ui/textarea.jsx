import React from "react";
import { cn } from "../../lib/design-system/cn";
import { FormField } from "./form-field";

/**
 * Standardized Textarea Component
 */
export function Textarea({
  label,
  id,
  placeholder,
  value,
  onChange,
  rows = 4,
  disabled = false,
  error,
  helperText,
  description,
  className = "",
  containerClassName = "",
  required = false,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <FormField
      label={label}
      htmlFor={inputId}
      required={required}
      error={error}
      description={description || helperText}
      className={containerClassName}
    >
      <textarea
        id={inputId}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        disabled={disabled}
        className={cn(
          "w-full rounded-md border text-sm text-text-primary bg-surface placeholder:text-text-disabled p-3 transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
          "disabled:bg-surface-soft disabled:text-text-disabled disabled:cursor-not-allowed",
          error ? "border-danger focus:ring-danger/20 focus:border-danger" : "border-border",
          className
        )}
        {...props}
      />
    </FormField>
  );
}

export default Textarea;
