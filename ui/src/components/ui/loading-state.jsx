import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/design-system/cn";

/**
 * Standardized LoadingState Component
 */
export function LoadingState({
  message = "Loading...",
  subtext,
  size = "md",
  fullPage = false,
  className = "",
}) {
  const spinnerSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }[size] || "w-6 h-6";

  const content = (
    <div className={cn("flex flex-col items-center justify-center text-center p-8", className)}>
      <Loader2 className={cn("animate-spin text-primary mb-3", spinnerSizes)} />
      {message && (
        <span className="text-sm font-medium text-text-primary tracking-tight">
          {message}
        </span>
      )}
      {subtext && (
        <span className="text-xs text-text-muted mt-1 leading-normal max-w-xs">
          {subtext}
        </span>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}

export default LoadingState;
