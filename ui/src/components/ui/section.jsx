import React from "react";
import { cn } from "../../lib/design-system/cn";

/**
 * Standardized Section component
 */
export function Section({
  title,
  description,
  action,
  children,
  className = "",
  headerClassName = "",
  ...props
}) {
  return (
    <section className={cn("space-y-4", className)} {...props}>
      {(title || description || action) && (
        <div
          className={cn(
            "flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2",
            headerClassName
          )}
        >
          <div>
            {title && (
              <h2 className="text-sm font-semibold text-text-primary tracking-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs text-text-muted mt-0.5">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export default Section;
