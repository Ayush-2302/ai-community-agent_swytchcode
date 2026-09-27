import React from "react";
import { cn } from "../../lib/design-system/cn";

/**
 * Standardized PageContainer component
 * Enforces unified margins, max-width, and padding across all operational views.
 */
export function PageContainer({
  children,
  maxWidth = "max-w-7xl",
  className = "",
  ...props
}) {
  return (
    <div
      className={cn(
        "w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6",
        maxWidth,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default PageContainer;
