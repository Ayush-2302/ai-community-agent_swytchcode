import React from "react";
import { cn } from "../../lib/design-system/cn";

/**
 * Standardized Tabs Component
 */
export function Tabs({
  tabs = [],
  activeTab,
  onChange,
  className = "",
  size = "md",
}) {
  const sizeStyles = {
    sm: "h-8 text-xs px-2.5",
    md: "h-9 text-xs px-3.5",
  }[size] || "h-9 text-xs px-3.5";

  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center p-1 rounded-lg bg-surface-soft border border-border-light text-text-muted gap-1",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-md font-medium transition-all select-none cursor-pointer",
              sizeStyles,
              isActive
                ? "bg-surface text-text-primary shadow-subtle border border-border/50 font-semibold"
                : "text-text-muted hover:text-text-primary hover:bg-surface/50"
            )}
          >
            {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px]",
                  isActive ? "bg-surface-soft text-text-primary" : "bg-border text-text-muted"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
