import React from "react";
import { Button as UiButton } from "../ui/button";

export function Button(props) {
  // Support legacy props like variant="destructive"
  const legacyVariantMap = {
    destructive: "danger",
    destructiveOutline: "dangerOutline",
    accent: "primary",
  };

  const resolvedVariant = legacyVariantMap[props.variant] || props.variant;

  return <UiButton {...props} variant={resolvedVariant} />;
}

export default Button;
