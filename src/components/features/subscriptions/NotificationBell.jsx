/**
 * Notification bell icon with dropdown — shown in the header.
 *
 * How it works:
 *  1. Subscribes to real-time Firestore notifications (only undismissed ones whose
 *     sendAt <= now).
 *  2. Filters client-side to only show notifications within 0–7 days of renewal.
 *  3. Displays an unread count badge on the bell icon.
 *  4. When the dropdown opens, all visible unread notifications are auto-marked as read.
 *  5. Each notification can be individually dismissed (permanently hidden).
 *
 * Note: Renewal dates are recalculated client-side (same logic as SubscriptionCard)
 * to always reflect the current next renewal, even if the stored notification
 * references an older date.
 */
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Icon from "../../common/Icon";
import {
  subscribeToNotifications,
  dismissNotification,
  markNotificationAsRead,
  calculateNextRenewal,
} from "../../../firebase/firestore";
import "./subscriptions.css";

const BellIcon = () => (
  <Icon>
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </Icon>
);

const CloseIcon = () => (
  <Icon className="ui-icon">
    <path d="M18 6L6 18M6 6l12 12" />
  </Icon>
);

export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToNotifications(userId, (notifs) => {
      setNotifications(notifs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleDismiss = async (e, notificationId) => {
    e.stopPropagation();
    try {
      await dismissNotification(userId, notificationId);
    } catch (error) {
      console.error("Error dismissing notification:", error);
    }
  };

  const formatRenewalDate = (notification) => {
    const renewal = calculateNextRenewal(
      notification.dueDate,
      notification.billing,
    );
    return renewal.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysUntilRenewal = (notification) => {
    const renewal = calculateNextRenewal(
      notification.dueDate,
      notification.billing,
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = renewal - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const visibleNotifications = notifications.filter((n) => {
    const days = getDaysUntilRenewal(n);
    return days >= 0 && days <= 7;
  });

  const unreadCount = visibleNotifications.filter((n) => !n.read).length;

  const handleToggleDropdown = () => {
    const opening = !showDropdown;
    setShowDropdown(opening);
    if (opening) {
      visibleNotifications
        .filter((n) => !n.read)
        .forEach((n) => {
          markNotificationAsRead(userId, n.id).catch(console.error);
        });
    }
  };

  return (
    <div className="notification-bell">
      <button
        onClick={handleToggleDropdown}
        className="ui-icon-button notification-bell__trigger"
        aria-label="Notifications"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="notification-bell__count">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div
            className="notification-bell__backdrop"
            onClick={() => setShowDropdown(false)}
          />
          <div className="notification-bell__dropdown">
            <div className="notification-bell__header">
              <h3>Notifications</h3>
              {unreadCount > 0 && (
                <p className="notification-bell__unread">
                  {unreadCount} unread
                </p>
              )}
            </div>

            <div className="notification-bell__list">
              {loading ? (
                <div className="notification-bell__empty">
                  <div className="ui-spinner notification-bell__spinner" />
                  <p>
                    Checking for notifications...
                  </p>
                </div>
              ) : visibleNotifications.length === 0 ? (
                <div className="notification-bell__empty">
                  <p className="notification-bell__empty-title">
                    No notifications
                  </p>
                  <p className="notification-bell__empty-note">
                    You&apos;ll be notified 7 days before renewals
                  </p>
                </div>
              ) : (
                visibleNotifications
                  .map((notification) => {
                    const daysUntil = getDaysUntilRenewal(notification);
                    return { notification, daysUntil };
                  })
                  .map(({ notification, daysUntil }) => (
                    <div
                      key={notification.id}
                      className={`notification-bell__notification${!notification.read ? " notification-bell__notification--unread" : ""}`}
                    >
                      <div className="notification-bell__notification-content">
                        <div className="notification-bell__notification-copy">
                          <p className="notification-bell__subscription">
                            {notification.subscriptionName}
                          </p>
                          <p className="notification-bell__renewal">
                            {daysUntil === 0
                              ? "Renews today!"
                              : daysUntil === 1
                                ? "Renews tomorrow"
                                : `Renews in ${daysUntil} days`}
                          </p>
                          <p className="notification-bell__date">
                            {formatRenewalDate(notification)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleDismiss(e, notification.id)}
                          className="ui-icon-button notification-bell__dismiss"
                          aria-label="Dismiss"
                        >
                          <CloseIcon />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

NotificationBell.propTypes = {
  userId: PropTypes.string.isRequired,
};
