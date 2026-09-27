import React from "react";
import { cn } from "../../lib/design-system/cn";

/**
 * Standardized Skeleton loader component
 */
export function Skeleton({ className = "", ...props }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-border-light",
        className
      )}
      {...props}
    />
  );
}

export default Skeleton;
