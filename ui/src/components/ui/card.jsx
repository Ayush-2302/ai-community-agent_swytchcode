import React from "react";
import { cn } from "../../lib/design-system/cn";

/**
 * Standardized Card Component
 *
 * @param {'none' | 'sm' | 'md' | 'lg' | 'xl'} padding
 * @param {boolean} border
 * @param {boolean} hoverable
 */
export function Card({
  children,
  className = "",
  padding = "md",
  border = true,
  hoverable = false,
  onClick,
  ...props
}) {
  const paddingStyles = {
    none: "p-0",
    sm: "p-3",
    md: "p-4 sm:p-5",
    lg: "p-6",
    xl: "p-8",
  }[padding] || "p-4 sm:p-5";

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-surface rounded-lg shadow-card transition-all",
        border && "border border-border",
        hoverable && "hover:border-border-hover hover:shadow-dropdown cursor-pointer",
        onClick && "cursor-pointer",
        paddingStyles,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className = "",
  children,
  ...props
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 pb-3 mb-3 border-b border-border-light",
        className
      )}
      {...props}
    >
      {(title || subtitle) && (
        <div className="min-w-0 flex-1">
          {title && (
            <h3 className="text-sm font-semibold text-text-primary tracking-tight truncate">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
      {children}
    </div>
  );
}

export function CardTitle({ className = "", children, ...props }) {
  return (
    <h3
      className={cn("text-base font-semibold text-text-primary tracking-tight", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className = "", children, ...props }) {
  return (
    <p
      className={cn("text-xs text-text-muted mt-1 leading-relaxed", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ className = "", children, ...props }) {
  return (
    <div className={cn("text-text-secondary text-sm", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = "", children, ...props }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between pt-3 mt-3 border-t border-border-light text-xs text-text-muted",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
