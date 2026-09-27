import React from "react";
import { AlertTriangle, Info } from "lucide-react";
import { Modal } from "./modal";
import { Button } from "./button";

/**
 * Standardized ConfirmDialog Component
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger", // 'danger' | 'primary'
  isLoading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={title}
      footer={
        <>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3 py-2">
        <div
          className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center ${
            variant === "danger"
              ? "bg-danger-soft text-danger border border-danger-soft"
              : "bg-primary-soft text-primary border border-primary-soft"
          }`}
        >
          {variant === "danger" ? (
            <AlertTriangle className="w-4 h-4" />
          ) : (
            <Info className="w-4 h-4" />
          )}
        </div>
        <div className="flex-1 text-sm text-text-secondary leading-relaxed">
          {message}
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
