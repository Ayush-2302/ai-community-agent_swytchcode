import React from "react";
import { Badge } from "./badge";
import { getStatusConfig } from "../../config/status-config";
import { cn } from "../../lib/design-system/cn";

/**
 * Standardized Status Badge Component
 * Automatically resolves status colors, label, and dot indicator via status-config.
 *
 * @param {string} status - Raw status (e.g. 'PUBLISHED', 'SCHEDULED', 'FAILED')
 * @param {boolean} dot - Whether to show status dot indicator (defaults to true)
 * @param {string} className
 */
export function StatusBadge({ status, dot = true, className = "", ...props }) {
  const config = getStatusConfig(status);

  return (
    <Badge
      variant={config.variant}
      dot={dot}
      className={cn(config.badgeClasses, className)}
      {...props}
    >
      {config.label}
    </Badge>
  );
}

export default StatusBadge;
