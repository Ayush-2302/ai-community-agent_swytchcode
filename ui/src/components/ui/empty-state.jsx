import React from "react";
import { Button } from "./button";
import { cn } from "../../lib/design-system/cn";

/**
 * Standardized EmptyState Component
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  secondaryActionLabel,
  onSecondaryAction,
  className = "",
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-border rounded-lg bg-surface-soft/60",
        className
      )}
    >
      {Icon && (
        <div className="w-11 h-11 rounded-full bg-surface flex items-center justify-center text-text-muted mb-3 border border-border shadow-subtle">
          <Icon className="w-5 h-5" />
        </div>
      )}

      <h3 className="text-sm font-semibold text-text-primary tracking-tight">
        {title}
      </h3>

      {description && (
        <p className="text-xs text-text-muted mt-1 max-w-sm mb-4 leading-relaxed">
          {description}
        </p>
      )}

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex items-center gap-2.5 mt-1 flex-wrap justify-center">
          {actionLabel && onAction && (
            <Button
              variant="primary"
              size="sm"
              onClick={onAction}
              icon={actionIcon}
            >
              {actionLabel}
            </Button>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onSecondaryAction}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
