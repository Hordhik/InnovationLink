import React, { useEffect, useRef } from "react";
// import "./EditModal.css"; // Optional – or remove if not using

export default function EditModal({
  open,
  title,
  children,
  onSave,
  onCancel,
  initialFocusSelector,
}) {
  const backdropRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onCancel?.();
    };
    document.addEventListener("keydown", onKey);

    // Autofocus
    setTimeout(() => {
      try {
        const el = initialFocusSelector
          ? document.querySelector(initialFocusSelector)
          : backdropRef.current?.querySelector("textarea, input");
        el?.focus();
      } catch (_) {}
    }, 80);

    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel, initialFocusSelector]);

  if (!open) return null;

  return (
    <div
      className="epm-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel?.();
      }}
      ref={backdropRef}
    >
      <div className="epm-modal">
        <div className="epm-header">
          <h3>{title}</h3>
          <button className="epm-close" onClick={onCancel} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="epm-body">{children}</div>
        <div className="epm-footer">
          <button className="epm-btn epm-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="epm-btn epm-save" onClick={onSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
