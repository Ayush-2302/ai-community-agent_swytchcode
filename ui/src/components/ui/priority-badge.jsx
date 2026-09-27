import React from "react";
import { Badge } from "./badge";
import { getPriorityConfig } from "../../config/priority-config";
import { cn } from "../../lib/design-system/cn";

/**
 * Standardized Priority Badge Component
 *
 * @param {string} priority - Raw priority ('low' | 'medium' | 'high' | 'critical')
 * @param {boolean} dot - Defaults to true
 * @param {string} className
 */
export function PriorityBadge({ priority, dot = true, className = "", ...props }) {
  const config = getPriorityConfig(priority);

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

export default PriorityBadge;
