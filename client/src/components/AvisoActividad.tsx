import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { FiAlertCircle, FiX } from "react-icons/fi";

export default function AvisoActividad({ message, onClose }: { message: string; onClose: () => void }) {
  const id = useId();
  const dialog = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const callback = useRef(onClose);
  callback.current = onClose;

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        callback.current();
      }
      if (event.key !== "Tab") return;
      const buttons = Array.from(dialog.current?.querySelectorAll<HTMLButtonElement>("button") ?? []);
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first?.focus();
      }
    };
    document.addEventListener("keydown", handleKey, true);
    return () => {
      document.removeEventListener("keydown", handleKey, true);
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);

  return createPortal(
    <div className="mn-activity-notice-overlay">
      <div ref={dialog} className="mn-activity-notice" role="alertdialog" aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={`${id}-message`}>
        <button className="mn-activity-notice-close" type="button" aria-label="Cerrar aviso" onClick={onClose}><FiX /></button>
        <span className="mn-activity-notice-icon" aria-hidden="true"><FiAlertCircle /></span>
        <span className="mn-activity-notice-label">MathNova · Actividad</span>
        <h2 id={`${id}-title`}>Revisa este paso</h2>
        <p id={`${id}-message`}>{message.replace(/^❌\s*/, "")}</p>
        <button ref={closeButton} className="mn-activity-notice-accept" type="button" onClick={onClose}>Entendido</button>
      </div>
    </div>, document.body,
  );
}
