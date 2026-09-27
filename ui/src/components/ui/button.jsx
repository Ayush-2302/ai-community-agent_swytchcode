import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/design-system/cn";

/**
 * Design System Button Component
 *
 * @param {'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link'} variant
 * @param {'xs' | 'sm' | 'md' | 'lg'} size
 * @param {boolean} isLoading
 * @param {boolean} disabled
 * @param {React.ElementType} icon
 * @param {'left' | 'right'} iconPosition
 */
export function Button({
  children,
  variant = "secondary",
  size = "md",
  className = "",
  disabled = false,
  isLoading = false,
  icon: Icon = null,
  leftIcon: LeftIcon = null,
  rightIcon: RightIcon = null,
  iconPosition = "left",
  type = "button",
  onClick,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-colors select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none rounded-md cursor-pointer";

  const sizeStyles = {
    xs: "h-7 px-2 text-xs gap-1.5",
    sm: "h-8 px-2.5 text-xs gap-1.5",
    md: "h-9 px-3.5 text-sm gap-2",
    lg: "h-10 px-4 text-sm gap-2.5",
  }[size] || "h-9 px-3.5 text-sm gap-2";

  const variantStyles = {
    primary:
      "bg-primary text-text-inverse hover:bg-primary-hover active:bg-primary-active border border-transparent shadow-subtle",
    secondary:
      "bg-surface text-text-secondary border border-border hover:bg-surface-hover hover:text-text-primary active:bg-surface-active shadow-subtle",
    outline:
      "bg-transparent text-text-secondary border border-border hover:bg-surface-hover hover:text-text-primary active:bg-surface-active",
    ghost:
      "bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary active:bg-surface-active border border-transparent",
    danger:
      "bg-danger text-text-inverse hover:opacity-90 active:opacity-100 border border-transparent shadow-subtle",
    dangerOutline:
      "bg-surface text-danger border border-danger-soft hover:bg-danger-soft active:bg-danger-soft/80",
    link:
      "bg-transparent text-primary hover:text-primary-hover underline-offset-4 hover:underline border-0 p-0 h-auto",
  }[variant] || "bg-surface text-text-secondary border border-border hover:bg-surface-hover";

  const EffectiveLeftIcon = LeftIcon || (iconPosition === "left" ? Icon : null);
  const EffectiveRightIcon = RightIcon || (iconPosition === "right" ? Icon : null);

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={cn(baseStyles, sizeStyles, variantStyles, className)}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
      ) : EffectiveLeftIcon ? (
        <EffectiveLeftIcon className="w-4 h-4 shrink-0" />
      ) : null}

      {children && <span>{children}</span>}

      {!isLoading && EffectiveRightIcon && (
        <EffectiveRightIcon className="w-4 h-4 shrink-0" />
      )}
    </button>
  );
}

export default Button;
