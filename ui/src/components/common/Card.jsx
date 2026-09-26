import React from "react";

export function Card({
  children,
  className = "",
  padding = "md", // 'none' | 'sm' (12px) | 'md' (16px) | 'lg' (20px) | 'xl' (24px)
  border = true,
  onClick,
  ...props
}) {
  const paddingStyles = {
    none: "p-0",
    sm: "p-3",
    md: "p-4",
    lg: "p-5",
    xl: "p-6",
  }[padding] || "p-4";

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg ${border ? "border border-slate-200" : ""} shadow-none ${paddingStyles} ${onClick ? "cursor-pointer hover:border-slate-300 transition-colors" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className = "",
  children,
}) {
  return (
    <div className={`flex items-start justify-between gap-4 pb-3 mb-3 border-b border-slate-100 ${className}`}>
      <div>
        {title && <h3 className="text-sm font-semibold text-slate-900 leading-tight">{title}</h3>}
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
      {children}
    </div>
  );
}
