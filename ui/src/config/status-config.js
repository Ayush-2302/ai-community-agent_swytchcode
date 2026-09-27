/**
 * Centralized Status Configuration for SocialOps Platform
 * Maps raw backend status values and display labels to semantic design tokens.
 */

export const STATUS_CONFIG = {
  PUBLISHED: {
    label: "Published",
    variant: "success",
    dotColor: "bg-success",
    badgeClasses: "bg-success-soft text-success border-success-soft",
  },
  RUNNING: {
    label: "Running",
    variant: "success",
    dotColor: "bg-success",
    badgeClasses: "bg-success-soft text-success border-success-soft",
  },
  CONNECTED: {
    label: "Connected",
    variant: "success",
    dotColor: "bg-success",
    badgeClasses: "bg-success-soft text-success border-success-soft",
  },
  SUCCESS: {
    label: "Success",
    variant: "success",
    dotColor: "bg-success",
    badgeClasses: "bg-success-soft text-success border-success-soft",
  },
  ACTIVE: {
    label: "Active",
    variant: "success",
    dotColor: "bg-success",
    badgeClasses: "bg-success-soft text-success border-success-soft",
  },
  SCHEDULED: {
    label: "Scheduled",
    variant: "primary",
    dotColor: "bg-primary",
    badgeClasses: "bg-primary-soft text-primary border-primary-soft",
  },
  PUBLISHING: {
    label: "Publishing",
    variant: "primary",
    dotColor: "bg-primary",
    badgeClasses: "bg-primary-soft text-primary border-primary-soft",
  },
  PENDING: {
    label: "Pending Review",
    variant: "warning",
    dotColor: "bg-warning",
    badgeClasses: "bg-warning-soft text-warning border-warning-soft",
  },
  DRAFT: {
    label: "Draft",
    variant: "warning",
    dotColor: "bg-warning",
    badgeClasses: "bg-warning-soft text-warning border-warning-soft",
  },
  WARNING: {
    label: "Warning",
    variant: "warning",
    dotColor: "bg-warning",
    badgeClasses: "bg-warning-soft text-warning border-warning-soft",
  },
  IDLE: {
    label: "Idle",
    variant: "warning",
    dotColor: "bg-warning",
    badgeClasses: "bg-warning-soft text-warning border-warning-soft",
  },
  FAILED: {
    label: "Failed",
    variant: "danger",
    dotColor: "bg-danger",
    badgeClasses: "bg-danger-soft text-danger border-danger-soft",
  },
  ERROR: {
    label: "Error",
    variant: "danger",
    dotColor: "bg-danger",
    badgeClasses: "bg-danger-soft text-danger border-danger-soft",
  },
  DISCONNECTED: {
    label: "Disconnected",
    variant: "danger",
    dotColor: "bg-danger",
    badgeClasses: "bg-danger-soft text-danger border-danger-soft",
  },
  STOPPED: {
    label: "Stopped",
    variant: "danger",
    dotColor: "bg-danger",
    badgeClasses: "bg-danger-soft text-danger border-danger-soft",
  },
  PAUSED: {
    label: "Paused",
    variant: "neutral",
    dotColor: "bg-text-muted",
    badgeClasses: "bg-surface-soft text-text-secondary border-border",
  },
  QUEUED: {
    label: "Queued",
    variant: "info",
    dotColor: "bg-info",
    badgeClasses: "bg-info-soft text-info border-info-soft",
  },
  DEFAULT: {
    label: "Unknown",
    variant: "neutral",
    dotColor: "bg-text-muted",
    badgeClasses: "bg-surface-soft text-text-secondary border-border",
  },
};

/**
 * Resolves any raw status string to its standard configuration entry.
 * @param {string} status - Raw status string
 * @returns {object} - Configuration object
 */
export function getStatusConfig(status) {
  if (!status) return STATUS_CONFIG.DEFAULT;
  const key = String(status).toUpperCase().replace(/\s+/g, "_");
  return STATUS_CONFIG[key] || {
    ...STATUS_CONFIG.DEFAULT,
    label: status,
  };
}

export default STATUS_CONFIG;
