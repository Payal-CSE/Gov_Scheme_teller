"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, Info, X } from "lucide-react";

/**
 * Reusable confirmation / alert dialog.
 *
 * Props:
 *  - open        (bool)   – whether the dialog is visible
 *  - title       (string) – heading text
 *  - message     (string) – body text
 *  - variant     ("danger" | "warning" | "info")  – colour scheme (default "danger")
 *  - confirmText (string) – confirm-button label  (default "Confirm")
 *  - cancelText  (string) – cancel-button label   (default "Cancel", hidden when alertOnly)
 *  - alertOnly   (bool)   – if true, show only one "OK" button (replaces window.alert)
 *  - onConfirm   (fn)     – called when user confirms
 *  - onCancel    (fn)     – called when user cancels / closes
 */
export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message = "",
  variant = "danger",
  confirmText = "Confirm",
  cancelText = "Cancel",
  alertOnly = false,
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === "Escape") onCancel?.();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

  /* Lock body scroll while open */
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const colors = {
    danger: {
      icon: "text-red-500",
      bg: "bg-red-500/10",
      btn: "bg-red-600 hover:bg-red-700 text-white",
    },
    warning: {
      icon: "text-amber-500",
      bg: "bg-amber-500/10",
      btn: "bg-amber-600 hover:bg-amber-700 text-white",
    },
    info: {
      icon: "text-blue-500",
      bg: "bg-blue-500/10",
      btn: "bg-blue-600 hover:bg-blue-700 text-white",
    },
  }[variant] ?? {
    icon: "text-red-500",
    bg: "bg-red-500/10",
    btn: "bg-red-600 hover:bg-red-700 text-white",
  };

  const IconComp = variant === "info" ? Info : AlertTriangle;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in"
      onClick={onCancel}
    >
      {/* Dialog card */}
      <div
        ref={dialogRef}
        className="relative mx-4 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close X */}
        <button
          onClick={onCancel}
          className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon + content */}
        <div className="flex gap-4">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${colors.bg}`}>
            <IconComp className={`h-5 w-5 ${colors.icon}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          {!alertOnly && (
            <button
              onClick={onCancel}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${colors.btn}`}
          >
            {alertOnly ? "OK" : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
