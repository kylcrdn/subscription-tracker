/**
 * Single subscription row in the dashboard list.
 *
 * Displays the service icon (or initials fallback), name, start date, price,
 * billing cycle, days-until-renewal badge, and a 3-dot menu for edit/delete.
 *
 * When the parent activates "selection mode", each card also shows a checkbox
 * for bulk-delete operations.
 *
 * Note: All dates use the Europe/Madrid timezone for consistency.
 */
import { useState } from "react";
import Icon from "../../common/Icon";
import { calculateNextRenewal, getSpainDate, TIMEZONE } from "../../../utils/dateUtils";

const MoreIcon = () => (
  <Icon className="w-5 h-5">
    <circle cx="12" cy="5" r="1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
  </Icon>
);

const EditIcon = () => (
  <Icon className="w-4 h-4">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </Icon>
);

const TrashIcon = () => (
  <Icon className="w-4 h-4">
    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
    <path d="M10 11v6M14 11v6" />
  </Icon>
);

export default function SubscriptionCard({ subscription, onEdit, onDelete, selectionMode, selected, onToggleSelect }) {
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      timeZone: TIMEZONE,
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysUntilRenewal = () => {
    if (!subscription.dueDate) return null;
    const today = getSpainDate();
    const nextRenewal = calculateNextRenewal(subscription.dueDate, subscription.billing);
    return Math.ceil((nextRenewal - today) / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = getDaysUntilRenewal();

  return (
    <div className="bg-surface/60 border border-edge/40 rounded-xl p-4 flex items-center justify-between hover:bg-surface/90 hover:border-edge/50 transition-all duration-200">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl w-11 h-11 flex items-center justify-center overflow-hidden bg-surface shrink-0">
          {subscription.icon && !imageError ? (
            <img
              src={subscription.icon}
              alt={`${subscription.name} icon`}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <span className="text-content-dim font-semibold text-sm">
              {getInitials(subscription.name)}
            </span>
          )}
        </div>

        <div>
          <h3 className="text-content font-medium">{subscription.name}</h3>
          <p className="text-content-faint text-sm">{formatDate(subscription.dueDate)}</p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-content font-semibold">
            €{subscription.price.toFixed(2)}
          </p>
          <p className="text-content-faint text-sm">{subscription.billing}</p>
        </div>

        {/* Color-coded urgency: red (today), orange (<=3d), yellow (<=7d), cyan (>7d) */}
        {daysRemaining !== null && (
          <div className="text-right min-w-25">
            <p
              className={`text-sm font-medium ${
                daysRemaining === 0
                  ? "text-red-500"
                  : daysRemaining <= 3
                    ? "text-orange-500"
                    : daysRemaining <= 7
                      ? "text-accent-yellow"
                      : "text-accent-teal"
              }`}
            >
              {daysRemaining === 0
                ? "Renews today"
                : daysRemaining === 1
                  ? "Tomorrow"
                  : `${daysRemaining} days`}
            </p>
            <p className="text-content-faint text-xs">until renewal</p>
          </div>
        )}

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-content-dim hover:text-content p-2 rounded-lg hover:bg-control/50 transition-colors"
            aria-label="Menu"
          >
            <MoreIcon />
          </button>

          {/* Invisible full-screen overlay closes the menu when clicking outside */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-1 w-36 bg-surface border border-edge/50 rounded-xl shadow-xl z-20 overflow-hidden">
                <button
                  onClick={() => {
                    onEdit(subscription);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-content-dim hover:text-content hover:bg-control/50 transition-colors"
                >
                  <EditIcon />
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDelete(subscription);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-red-500 hover:text-red-400 hover:bg-control/50 transition-colors"
                >
                  <TrashIcon />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>

        {/* Selection checkbox */}
        {selectionMode && (
          <button
            onClick={() => onToggleSelect(subscription.id)}
            className="ml-2 flex items-center justify-center w-6 h-6 rounded border-2 transition-colors shrink-0"
            style={{
              borderColor: selected ? "#10b981" : "#4b5563",
              backgroundColor: selected ? "#10b981" : "transparent",
            }}
            aria-label={selected ? "Deselect subscription" : "Select subscription"}
          >
            {selected && (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
