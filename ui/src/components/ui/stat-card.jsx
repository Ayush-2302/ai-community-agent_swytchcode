import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "./card";
import { cn } from "../../lib/design-system/cn";

/**
 * Standardized StatCard Component for Dashboard & Analytics
 */
export function StatCard({
  title,
  value,
  change,
  trend = "neutral", // 'up' | 'down' | 'neutral'
  subtitle,
  icon: Icon = null,
  iconVariant = "primary", // 'primary' | 'success' | 'warning' | 'info' | 'neutral'
  className = "",
  onClick,
}) {
  const iconVariantStyles = {
    primary: "bg-primary-soft text-primary border-primary-soft",
    success: "bg-success-soft text-success border-success-soft",
    warning: "bg-warning-soft text-warning border-warning-soft",
    info: "bg-info-soft text-info border-info-soft",
    neutral: "bg-surface-soft text-text-secondary border-border",
  }[iconVariant] || "bg-primary-soft text-primary border-primary-soft";

  return (
    <Card
      padding="md"
      className={cn("flex flex-col justify-between", className)}
      hoverable={!!onClick}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-medium text-text-muted truncate uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div
            className={cn(
              "w-8 h-8 rounded-md flex items-center justify-center border shrink-0",
              iconVariantStyles
            )}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-text-primary">
          {value}
        </span>

        {change && (
          <span
            className={cn(
              "inline-flex items-center text-xs font-semibold gap-0.5",
              trend === "up" && "text-success",
              trend === "down" && "text-danger",
              trend === "neutral" && "text-text-muted"
            )}
          >
            {trend === "up" && <TrendingUp className="w-3 h-3" />}
            {trend === "down" && <TrendingDown className="w-3 h-3" />}
            {trend === "neutral" && <Minus className="w-3 h-3" />}
            {change}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-[11px] text-text-muted mt-1 leading-normal truncate">
          {subtitle}
        </p>
      )}
    </Card>
  );
}

export default StatCard;
