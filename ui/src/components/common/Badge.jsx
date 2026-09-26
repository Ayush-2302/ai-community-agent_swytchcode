import React from "react";

export function Badge({
  children,
  variant = "neutral", // 'success' | 'warning' | 'error' | 'neutral' | 'accent' | 'purple'
  dot = false,
  className = "",
  size = "md",
}) {
  const sizeStyles = size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-2 py-0.5 text-xs";

  const variantStyles = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    error: "bg-rose-50 text-rose-700 border-rose-200",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
    accent: "bg-blue-50 text-blue-700 border-blue-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  }[variant] || "bg-slate-100 text-slate-700 border-slate-200";

  const dotStyles = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    error: "bg-rose-500",
    neutral: "bg-slate-400",
    accent: "bg-blue-500",
    indigo: "bg-indigo-500",
  }[variant] || "bg-slate-400";

  return (
    <span
      className={`inline-flex items-center font-medium rounded border ${sizeStyles} ${variantStyles} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 ${dotStyles}`} />}
      {children}
    </span>
  );
}

export function StatusBadge({ status, className = "" }) {
  const norm = (status || "").toLowerCase();

  if (norm === "published" || norm === "running" || norm === "connected" || norm === "success" || norm === "active") {
    return (
      <Badge variant="success" dot className={className}>
        {status}
      </Badge>
    );
  }

  if (norm === "scheduled" || norm === "publishing") {
    return (
      <Badge variant="accent" dot className={className}>
        {status}
      </Badge>
    );
  }

  if (norm === "pending review" || norm === "warning" || norm === "draft" || norm === "idle") {
    return (
      <Badge variant="warning" dot className={className}>
        {status}
      </Badge>
    );
  }

  if (norm === "failed" || norm === "error" || norm === "disconnected" || norm === "stopped") {
    return (
      <Badge variant="error" dot className={className}>
        {status}
      </Badge>
    );
  }

  if (norm === "paused") {
    return (
      <Badge variant="neutral" dot className={className}>
        {status}
      </Badge>
    );
  }

  return (
    <Badge variant="neutral" dot className={className}>
      {status || "Unknown"}
    </Badge>
  );
}
