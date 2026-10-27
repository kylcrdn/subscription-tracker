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
import "./subscriptions.css";

const MoreIcon = () => (
  <Icon className="ui-icon">
    <circle cx="12" cy="5" r="1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
  </Icon>
);

const EditIcon = () => (
  <Icon className="ui-icon">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </Icon>
);

const TrashIcon = () => (
  <Icon className="ui-icon">
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
  const renewalTone =
    daysRemaining === 0
      ? "subscription-card__renewal--today"
      : daysRemaining <= 3
        ? "subscription-card__renewal--soon"
        : daysRemaining <= 7
          ? "subscription-card__renewal--upcoming"
          : "subscription-card__renewal--later";

  return (
    <article className="subscription-card">
      {/* Left side */}
      <div className="subscription-card__identity">
        <div className="subscription-card__logo">
          {subscription.icon && !imageError ? (
            <img
              src={subscription.icon}
              alt={`${subscription.name} icon`}
              className="subscription-card__image"
              onError={() => setImageError(true)}
            />
          ) : (
            <span className="subscription-card__initials">
              {getInitials(subscription.name)}
            </span>
          )}
        </div>

        <div>
          <h3 className="subscription-card__name">{subscription.name}</h3>
          <p className="subscription-card__date">{formatDate(subscription.dueDate)}</p>
        </div>
      </div>

      {/* Right side */}
      <div className="subscription-card__details">
        <div className="subscription-card__price-block">
          <p className="subscription-card__price">
            €{(parseFloat(subscription.price) || 0).toFixed(2)}
          </p>
          <p className="subscription-card__billing">{subscription.billing}</p>
        </div>

        {/* Color-coded urgency: red (today), orange (<=3d), yellow (<=7d), cyan (>7d) */}
        {daysRemaining !== null && (
          <div className="subscription-card__renewal">
            <p
              className={`subscription-card__renewal-label ${renewalTone}`}
            >
              {daysRemaining === 0
                ? "Renews today"
                : daysRemaining === 1
                  ? "Tomorrow"
                  : `${daysRemaining} days`}
            </p>
            <p className="subscription-card__renewal-caption">until renewal</p>
          </div>
        )}

        {/* Menu */}
        <div className="subscription-card__menu">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="ui-icon-button"
            aria-label="Menu"
          >
            <MoreIcon />
          </button>

          {/* Invisible full-screen overlay closes the menu when clicking outside */}
          {showMenu && (
            <>
              <div
                className="subscription-card__menu-backdrop"
                onClick={() => setShowMenu(false)}
              />
              <div className="subscription-card__menu-list">
                <button
                  onClick={() => {
                    onEdit(subscription);
                    setShowMenu(false);
                  }}
                  className="subscription-card__menu-item"
                >
                  <EditIcon />
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDelete(subscription);
                    setShowMenu(false);
                  }}
                  className="subscription-card__menu-item subscription-card__menu-item--danger"
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
            className={`subscription-card__checkbox${selected ? " subscription-card__checkbox--selected" : ""}`}
            aria-label={selected ? "Deselect subscription" : "Select subscription"}
          >
            {selected && (
              <svg className="subscription-card__check" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        )}
      </div>
    </article>
  );
}
