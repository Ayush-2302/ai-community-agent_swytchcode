/**
 * Centralized Priority Configuration for SocialOps Platform
 * Maps priority levels to semantic tokens.
 */

export const PRIORITY_CONFIG = {
  LOW: {
    label: "Low",
    variant: "neutral",
    dotColor: "bg-text-muted",
    badgeClasses: "bg-surface-soft text-text-secondary border-border",
  },
  MEDIUM: {
    label: "Medium",
    variant: "info",
    dotColor: "bg-info",
    badgeClasses: "bg-info-soft text-info border-info-soft",
  },
  HIGH: {
    label: "High",
    variant: "warning",
    dotColor: "bg-warning",
    badgeClasses: "bg-warning-soft text-warning border-warning-soft",
  },
  CRITICAL: {
    label: "Critical",
    variant: "danger",
    dotColor: "bg-danger",
    badgeClasses: "bg-danger-soft text-danger border-danger-soft",
  },
  DEFAULT: {
    label: "Normal",
    variant: "neutral",
    dotColor: "bg-text-muted",
    badgeClasses: "bg-surface-soft text-text-secondary border-border",
  },
};

export function getPriorityConfig(priority) {
  if (!priority) return PRIORITY_CONFIG.DEFAULT;
  const key = String(priority).toUpperCase().trim();
  return PRIORITY_CONFIG[key] || {
    ...PRIORITY_CONFIG.DEFAULT,
    label: priority,
  };
}

export default PRIORITY_CONFIG;
