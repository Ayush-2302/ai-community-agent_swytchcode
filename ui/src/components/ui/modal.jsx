import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/design-system/cn";

/**
 * Standardized Modal / Dialog Component
 *
 * @param {'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'} size
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "max-w-2xl",
  size = "md",
  className = "",
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen && onClose) {
        onClose();
      }
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeStyles = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    "2xl": "max-w-5xl",
    full: "max-w-6xl",
  }[size] || maxWidth;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-overlay backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 w-full bg-surface rounded-lg border border-border shadow-modal overflow-hidden flex flex-col max-h-[90vh] my-auto animate-in zoom-in-95 duration-150",
          sizeStyles,
          className
        )}
      >
        {/* Header */}
        {(title || description || onClose) && (
          <div className="flex items-start justify-between px-6 py-4 border-b border-border-light bg-surface shrink-0">
            <div>
              {title && (
                <h2 className="text-base font-semibold text-text-primary tracking-tight">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-text-muted hover:text-text-primary p-1 rounded-md hover:bg-surface-hover transition-colors -mr-1"
                title="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1 text-text-secondary text-sm">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-3.5 bg-surface-soft border-t border-border-light shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
