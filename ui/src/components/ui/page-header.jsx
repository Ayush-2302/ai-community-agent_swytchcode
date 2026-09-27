import React from "react";
import { cn } from "../../lib/design-system/cn";

/**
 * Standardized PageHeader component
 * Displays page title, description/subtext, metadata, and primary action buttons.
 */
export function PageHeader({
  title,
  description,
  badge,
  actions,
  breadcrumbs,
  className = "",
  children,
}) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border-light",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        {breadcrumbs && (
          <div className="mb-2 text-xs text-text-muted flex items-center gap-1.5 font-medium">
            {breadcrumbs}
          </div>
        )}

        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-semibold text-text-primary tracking-tight">
            {title}
          </h1>
          {badge}
        </div>

        {description && (
          <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed max-w-3xl">
            {description}
          </p>
        )}

        {children}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
