import React from "react";
import { Badge as UiBadge } from "../ui/badge";
import { StatusBadge as UiStatusBadge } from "../ui/status-badge";

export function Badge(props) {
  const legacyVariantMap = {
    error: "danger",
    accent: "primary",
    indigo: "primary",
  };
  const resolvedVariant = legacyVariantMap[props.variant] || props.variant;

  return <UiBadge {...props} variant={resolvedVariant} />;
}

export function StatusBadge(props) {
  return <UiStatusBadge {...props} />;
}

export default Badge;
