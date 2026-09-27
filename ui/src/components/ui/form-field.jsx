import React from "react";
import { cn } from "../../lib/design-system/cn";

/**
 * Standardized FormField wrapper
 * Provides label, required asterisk, description, and error messaging.
 */
export function FormField({
  label,
  htmlFor,
  description,
  error,
  required = false,
  className = "",
  children,
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-xs font-medium text-text-primary select-none flex items-center justify-between"
        >
          <span>
            {label} {required && <span className="text-danger ml-0.5">*</span>}
          </span>
        </label>
      )}

      {children}

      {error ? (
        <span className="text-xs text-danger font-medium">{error}</span>
      ) : description ? (
        <span className="text-xs text-text-muted">{description}</span>
      ) : null}
    </div>
  );
}

export default FormField;
