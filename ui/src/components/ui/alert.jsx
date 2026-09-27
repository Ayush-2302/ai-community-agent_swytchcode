import React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "../../lib/design-system/cn";

/**
 * Standardized Alert Component
 *
 * @param {'info' | 'success' | 'warning' | 'danger'} variant
 */
export function Alert({
  variant = "info",
  title,
  children,
  onDismiss,
  className = "",
  ...props
}) {
  const variantStyles = {
    info: "bg-info-soft border-info-soft text-text-primary",
    success: "bg-success-soft border-success-soft text-text-primary",
    warning: "bg-warning-soft border-warning-soft text-text-primary",
    danger: "bg-danger-soft border-danger-soft text-text-primary",
  }[variant] || "bg-info-soft border-info-soft text-text-primary";

  const iconStyles = {
    info: "text-info",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
  }[variant] || "text-info";

  const IconComponent = {
    info: Info,
    success: CheckCircle2,
    warning: AlertTriangle,
    danger: AlertCircle,
  }[variant] || Info;

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 p-3.5 rounded-lg border text-sm shadow-subtle",
        variantStyles,
        className
      )}
      {...props}
    >
      <IconComponent className={cn("w-4 h-4 shrink-0 mt-0.5", iconStyles)} />

      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="font-semibold text-xs tracking-tight mb-0.5 text-text-primary">
            {title}
          </h4>
        )}
        <div className="text-xs text-text-secondary leading-relaxed">
          {children}
        </div>
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-text-muted hover:text-text-primary p-0.5 rounded transition-colors -mr-1"
          title="Dismiss alert"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export default Alert;
