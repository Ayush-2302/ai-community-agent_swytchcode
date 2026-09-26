import React from "react";

export function Button({
  children,
  variant = "secondary", // 'primary' | 'secondary' | 'ghost' | 'destructive'
  size = "md", // 'sm' | 'md' | 'lg'
  className = "",
  disabled = false,
  icon: Icon = null,
  iconPosition = "left",
  type = "button",
  onClick,
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors select-none focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none rounded-md";

  const sizeStyles = {
    sm: "h-8 px-2.5 text-xs gap-1.5",
    md: "h-9 px-3.5 text-sm gap-2",
    lg: "h-10 px-4 text-sm gap-2.5",
  }[size] || "h-9 px-3.5 text-sm gap-2";

  const variantStyles = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 border border-transparent shadow-none",
    accent: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 border border-transparent",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 border border-transparent",
    destructive: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 border border-transparent",
    destructiveOutline: "bg-white text-red-600 border border-red-200 hover:bg-red-50 active:bg-red-100",
  }[variant] || "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50";

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {Icon && iconPosition === "left" && <Icon className="w-4 h-4 shrink-0" />}
      {children}
      {Icon && iconPosition === "right" && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
}
