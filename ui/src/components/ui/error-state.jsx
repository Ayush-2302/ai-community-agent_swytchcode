import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./button";
import { cn } from "../../lib/design-system/cn";

/**
 * Standardized ErrorState Component
 */
export function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading this content.",
  onRetry,
  retryLabel = "Try Again",
  className = "",
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-danger-soft rounded-lg bg-danger-soft/30",
        className
      )}
    >
      <div className="w-10 h-10 rounded-full bg-danger-soft flex items-center justify-center text-danger mb-3 border border-danger-soft">
        <AlertCircle className="w-5 h-5" />
      </div>

      <h3 className="text-sm font-semibold text-text-primary tracking-tight">
        {title}
      </h3>

      {message && (
        <p className="text-xs text-text-muted mt-1 max-w-sm mb-4 leading-relaxed">
          {message}
        </p>
      )}

      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          icon={RefreshCw}
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
