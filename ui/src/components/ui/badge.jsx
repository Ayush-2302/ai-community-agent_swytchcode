import React from "react";
import { cn } from "../../lib/design-system/cn";

/**
 * Design System Badge Component
 *
 * @param {'neutral' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'} variant
 * @param {'sm' | 'md'} size
 * @param {boolean} dot
 */
export function Badge({
  children,
  variant = "neutral",
  size = "md",
  dot = false,
  className = "",
  ...props
}) {
  const sizeStyles = {
    sm: "px-1.5 py-0.5 text-[11px]",
    md: "px-2 py-0.5 text-xs",
  }[size] || "px-2 py-0.5 text-xs";

  const variantStyles = {
    neutral: "bg-surface-soft text-text-secondary border-border",
    primary: "bg-primary-soft text-primary border-primary-soft",
    secondary: "bg-secondary-soft text-secondary border-border",
    success: "bg-success-soft text-success border-success-soft",
    warning: "bg-warning-soft text-warning border-warning-soft",
    danger: "bg-danger-soft text-danger border-danger-soft",
    info: "bg-info-soft text-info border-info-soft",
  }[variant] || "bg-surface-soft text-text-secondary border-border";

  const dotStyles = {
    neutral: "bg-text-muted",
    primary: "bg-primary",
    secondary: "bg-secondary",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    info: "bg-info",
  }[variant] || "bg-text-muted";

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border transition-colors select-none",
        sizeStyles,
        variantStyles,
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full mr-1.5 shrink-0", dotStyles)}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export default Badge;
