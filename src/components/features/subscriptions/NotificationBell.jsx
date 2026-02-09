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
import {
  subscribeToNotifications,
  dismissNotification,
  markNotificationAsRead,
} from "../../../firebase/firestore";

const Icon = ({ children, className = "w-5 h-5", ...props }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {children}
  </svg>
);

const BellIcon = () => (
  <Icon>
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </Icon>
);

const CloseIcon = () => (
  <Icon className="w-4 h-4">
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

  const calculateNextRenewal = (dueDate, billing) => {
    const startDate = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);

    let nextRenewal = new Date(startDate);

    if (billing === "Monthly") {
      nextRenewal.setMonth(nextRenewal.getMonth() + 1);
      while (nextRenewal <= today) {
        nextRenewal.setMonth(nextRenewal.getMonth() + 1);
      }
    } else if (billing === "Yearly") {
      nextRenewal.setFullYear(nextRenewal.getFullYear() + 1);
      while (nextRenewal <= today) {
        nextRenewal.setFullYear(nextRenewal.getFullYear() + 1);
      }
    }

    return nextRenewal;
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
    <div className="relative">
      <button
        onClick={handleToggleDropdown}
        className="relative p-2 text-content-dim hover:text-content hover:bg-surface/50 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-surface border border-edge/50 rounded-xl shadow-2xl z-20 overflow-hidden">
            <div className="px-4 py-3 border-b border-edge/50">
              <h3 className="text-content font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-content-dim mt-0.5">
                  {unreadCount} unread
                </p>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="px-4 py-8 text-center text-content-dim">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500 mx-auto mb-3" />
                  <p className="text-sm text-content-dim">
                    Checking for notifications...
                  </p>
                </div>
              ) : visibleNotifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-content-dim">
                  <p className="text-sm font-medium text-content mb-1">
                    No notifications
                  </p>
                  <p className="text-xs text-content-faint">
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
                      className={`px-4 py-3 border-b border-edge/30 hover:bg-control/30 transition-colors ${
                        !notification.read ? "bg-emerald-500/5" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-content font-medium text-sm truncate">
                            {notification.subscriptionName}
                          </p>
                          <p className="text-content-dim text-xs mt-1">
                            {daysUntil === 0
                              ? "Renews today!"
                              : daysUntil === 1
                                ? "Renews tomorrow"
                                : `Renews in ${daysUntil} days`}
                          </p>
                          <p className="text-content-faint text-xs mt-0.5">
                            {formatRenewalDate(notification)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleDismiss(e, notification.id)}
                          className="text-content-faint hover:text-content p-1 rounded hover:bg-control/50 transition-colors shrink-0"
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
