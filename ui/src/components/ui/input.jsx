import React from "react";
import { cn } from "../../lib/design-system/cn";
import { FormField } from "./form-field";

/**
 * Standardized Input Component
 *
 * @param {'sm' | 'md' | 'lg'} size
 */
export function Input({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  disabled = false,
  error,
  helperText,
  description,
  icon: Icon = null,
  leftIcon: LeftIcon = null,
  rightElement = null,
  size = "md",
  className = "",
  containerClassName = "",
  required = false,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  const EffectiveIcon = LeftIcon || Icon;

  const sizeStyles = {
    sm: "h-8 text-xs px-2.5",
    md: "h-9 text-sm px-3",
    lg: "h-10 text-sm px-3.5",
  }[size] || "h-9 text-sm px-3";

  return (
    <FormField
      label={label}
      htmlFor={inputId}
      required={required}
      error={error}
      description={description || helperText}
      className={containerClassName}
    >
      <div className="relative flex items-center w-full">
        {EffectiveIcon && (
          <div className="absolute left-2.5 text-text-muted pointer-events-none flex items-center justify-center">
            <EffectiveIcon className="w-4 h-4 shrink-0" />
          </div>
        )}

        <input
          id={inputId}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={cn(
            "w-full rounded-md border text-text-primary bg-surface placeholder:text-text-disabled transition-colors select-text",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
            "disabled:bg-surface-soft disabled:text-text-disabled disabled:cursor-not-allowed",
            sizeStyles,
            EffectiveIcon && "pl-8",
            rightElement && "pr-9",
            error ? "border-danger focus:ring-danger/20 focus:border-danger" : "border-border",
            className
          )}
          {...props}
        />

        {rightElement && (
          <div className="absolute right-2.5 flex items-center text-text-muted">
            {rightElement}
          </div>
        )}
      </div>
    </FormField>
  );
}

export default Input;
