import type { ToastState } from "../types";

export function Toast({ toast }: { toast: ToastState | null }) {
  if (!toast) return null;
  return <div role="status" aria-live="polite" className={`mnx-toast ${toast.error ? "mnx-toast-error" : ""}`}>{toast.text}</div>;
}
