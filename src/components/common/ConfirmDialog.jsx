/**
 * Reusable confirmation dialog modal.
 * Used throughout the app when a destructive action requires user confirmation
 * (e.g. deleting a subscription or bulk-deleting multiple subscriptions).
 *
 * Props:
 *  - confirmStyle: "danger" (red button) or "primary" (blue button)
 *  - All text (title, message, button labels) is customizable via props.
 *  - Closes on Escape key or clicking the backdrop.
 */
import { useEffect } from "react";
import PropTypes from "prop-types";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  confirmStyle = "danger",
}) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div
      className="ui-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        className="ui-overlay__backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="ui-overlay__alignment">
        <div className="ui-dialog confirm-dialog">
          {/* Icon */}
          <div className="confirm-dialog__icon-wrap">
            <div
              className={`confirm-dialog__icon confirm-dialog__icon--${confirmStyle}`}
            >
              <svg
                className="ui-icon confirm-dialog__symbol"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2
            id="confirm-dialog-title"
            className="confirm-dialog__title"
          >
            {title}
          </h2>

          {/* Message */}
          <p className="confirm-dialog__message">{message}</p>

          {/* Buttons */}
          <div className="confirm-dialog__actions">
            <button
              type="button"
              onClick={onClose}
              className="ui-button ui-button--secondary"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className={`ui-button ${confirmStyle === "danger" ? "ui-button--danger" : "ui-button--primary"}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

ConfirmDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  confirmStyle: PropTypes.oneOf(["danger", "primary"]),
};
