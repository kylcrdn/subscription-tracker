/**
 * Subscription overview modal — shows quick-stats about the user's active subscriptions.
 * Opened by clicking the "Active Subs" stat card on the dashboard.
 *
 * Sections:
 *  1. Billing cycle split (Monthly vs Yearly) with visual bar
 *  2. Cost highlights (most expensive, cheapest)
 *  3. Top category by subscription count
 *  4. Upcoming renewals within the next 7 days
 *
 * Data comes directly from the subscriptions array (passed as a prop).
 * This component is lazy-loaded via React.lazy in HomePage.
 */
import { useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { calculateNextRenewal, getSpainDate, TIMEZONE } from "../../../utils/dateUtils";
import "./subscriptions.css";

const formatDate = (date) =>
  date.toLocaleDateString("en-GB", {
    timeZone: TIMEZONE,
    day: "numeric",
    month: "short",
  });

export default function SubscriptionOverviewModal({ isOpen, onClose, subscriptions }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const stats = useMemo(() => {
    if (!subscriptions.length) return null;

    const monthlyCount = subscriptions.filter((s) => s.billing === "Monthly").length;
    const yearlyCount = subscriptions.filter((s) => s.billing === "Yearly").length;

    // Normalize all prices to monthly for fair comparison
    const withMonthly = subscriptions.map((s) => {
      const price = parseFloat(s.price) || 0;
      return { ...s, monthlyCost: s.billing === "Yearly" ? price / 12 : price };
    });

    const sorted = [...withMonthly].sort((a, b) => b.monthlyCost - a.monthlyCost);
    const mostExpensive = sorted[0];
    const cheapest = sorted[sorted.length - 1];
    // Category with the most subscriptions (by count, not cost)
    const categoryCounts = {};
    subscriptions.forEach((s) => {
      const cat = s.category?.trim() || "Uncategorized";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

    // Upcoming renewals within the next 7 days
    const today = getSpainDate();
    const upcoming = subscriptions
      .map((s) => {
        const renewal = calculateNextRenewal(s.dueDate, s.billing);
        const diffDays = Math.ceil((renewal - today) / (1000 * 60 * 60 * 24));
        return { ...s, renewal, daysUntil: diffDays };
      })
      .filter((s) => s.daysUntil >= 0 && s.daysUntil <= 7)
      .sort((a, b) => a.daysUntil - b.daysUntil);

    return { monthlyCount, yearlyCount, mostExpensive, cheapest, topCategory, upcoming };
  }, [subscriptions]);

  if (!isOpen) return null;

  const total = subscriptions.length;
  const monthlyPct = stats ? (stats.monthlyCount / total) * 100 : 0;

  return (
    <div
      className="ui-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="overview-title"
    >
      <div
        className="ui-overlay__backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="ui-overlay__alignment">
        <div className="ui-dialog overview-dialog">
          {/* Close button */}
          <button
            onClick={onClose}
            className="ui-icon-button ui-dialog__close"
            aria-label="Close"
          >
            <svg className="ui-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Title */}
          <div className="overview-dialog__heading">
            <h2 id="overview-title" className="overview-dialog__title">
              Subscription Overview
            </h2>
            <p className="overview-dialog__subtitle">
              A snapshot of your {total} active subscription{total !== 1 ? "s" : ""}
            </p>
          </div>

          {!stats ? (
            <p className="overview-dialog__empty">No subscriptions to analyze.</p>
          ) : (
            <div className="overview-dialog__sections">
              {/* Billing Cycle Split */}
              <div>
                <div className="overview-dialog__section-heading">
                  <svg className="ui-icon overview-dialog__icon--emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Billing Cycle</span>
                </div>
                <p className="overview-dialog__help">
                  How your subscriptions are billed — monthly vs yearly plans.
                </p>
                <div className="overview-dialog__billing-bar">
                  {stats.monthlyCount > 0 && (
                    <div
                      className="overview-dialog__billing-segment overview-dialog__billing-segment--monthly"
                      style={{
                        width: `${monthlyPct}%`,
                        borderRadius: stats.yearlyCount === 0 ? "9999px" : "9999px 0 0 9999px",
                      }}
                    />
                  )}
                  {stats.yearlyCount > 0 && (
                    <div
                      className="overview-dialog__billing-segment overview-dialog__billing-segment--yearly"
                      style={{
                        width: `${100 - monthlyPct}%`,
                        borderRadius: stats.monthlyCount === 0 ? "9999px" : "0 9999px 9999px 0",
                      }}
                    />
                  )}
                </div>
                <div className="overview-dialog__billing-legend">
                  <div className="overview-dialog__legend-item">
                    <div className="overview-dialog__swatch overview-dialog__swatch--monthly" />
                    <span>
                      {stats.monthlyCount} Monthly
                    </span>
                  </div>
                  <div className="overview-dialog__legend-item">
                    <div className="overview-dialog__swatch overview-dialog__swatch--yearly" />
                    <span>
                      {stats.yearlyCount} Yearly
                    </span>
                  </div>
                </div>
              </div>

              {/* Cost Highlights */}
              <div>
                <div className="overview-dialog__section-heading">
                  <svg className="ui-icon overview-dialog__icon--teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.5 0-3 1-3 2.5s1.5 2 3 2.5c1.5.5 3 1 3 2.5s-1.5 2.5-3 2.5c-1 0-2-.5-2.5-1.5" />
                    <path d="M12 6v2M12 16v2" />
                  </svg>
                  <span>Cost Comparison</span>
                </div>
                <p className="overview-dialog__help">
                  All prices shown as monthly cost for easy comparison.
                </p>
                <div className="overview-dialog__cost-grid">
                  <div className="overview-dialog__cost-card">
                    <div className="overview-dialog__cost-icon overview-dialog__cost-icon--emerald">
                      <svg className="overview-dialog__small-icon overview-dialog__icon--emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 15l-6-6-6 6" />
                      </svg>
                    </div>
                    <p className="overview-dialog__caption">Highest</p>
                    <p className="overview-dialog__cost-name" title={stats.mostExpensive.name}>
                      {stats.mostExpensive.name}
                    </p>
                    <p className="overview-dialog__cost-value overview-dialog__icon--emerald">
                      €{stats.mostExpensive.monthlyCost.toFixed(2)}/mo
                    </p>
                  </div>
                  <div className="overview-dialog__cost-card">
                    <div className="overview-dialog__cost-icon overview-dialog__cost-icon--teal">
                      <svg className="overview-dialog__small-icon overview-dialog__icon--teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>
                    <p className="overview-dialog__caption">Lowest</p>
                    <p className="overview-dialog__cost-name" title={stats.cheapest.name}>
                      {stats.cheapest.name}
                    </p>
                    <p className="overview-dialog__cost-value overview-dialog__icon--teal">
                      €{stats.cheapest.monthlyCost.toFixed(2)}/mo
                    </p>
                  </div>
                </div>
              </div>

              {/* Top Category */}
              {stats.topCategory && (
                <div>
                  <div className="overview-dialog__section-heading">
                    <svg className="ui-icon overview-dialog__icon--lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span>Most Used Category</span>
                  </div>
                  <div className="overview-dialog__category">
                    <span className="overview-dialog__category-name">{stats.topCategory[0]}</span>
                    <span className="overview-dialog__category-count">
                      {stats.topCategory[1]} of {total} subscription{total !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              )}

              {/* Upcoming Renewals */}
              <div>
                <div className="overview-dialog__section-heading">
                  <svg className="ui-icon overview-dialog__icon--lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 01-3.46 0" />
                  </svg>
                  <span>Renewing Soon</span>
                </div>
                <p className="overview-dialog__help">
                  Subscriptions renewing within the next 7 days.
                </p>
                {stats.upcoming.length === 0 ? (
                  <div className="overview-dialog__no-renewals">
                    <svg className="overview-dialog__success-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                      <path d="M22 4L12 14.01l-3-3" />
                    </svg>
                    <p>No upcoming renewals this week</p>
                  </div>
                ) : (
                  <div className="overview-dialog__renewals">
                    {stats.upcoming.map((sub) => (
                      <div
                        key={sub.id}
                        className="overview-dialog__renewal"
                      >
                        <div className="overview-dialog__renewal-identity">
                          {sub.icon ? (
                            <img
                              src={sub.icon}
                              alt=""
                              className="overview-dialog__renewal-logo"
                            />
                          ) : (
                            <div className="overview-dialog__renewal-fallback">
                              {sub.name[0]}
                            </div>
                          )}
                          <div className="overview-dialog__renewal-copy">
                            <p className="overview-dialog__renewal-name">{sub.name}</p>
                            <p className="overview-dialog__renewal-date">{formatDate(sub.renewal)}</p>
                          </div>
                        </div>
                        <span className={`overview-dialog__renewal-badge ${
                          sub.daysUntil === 0
                            ? "overview-dialog__renewal-badge--today"
                            : sub.daysUntil <= 3
                              ? "overview-dialog__renewal-badge--soon"
                              : "overview-dialog__renewal-badge--later"
                        }`}>
                          {sub.daysUntil === 0
                            ? "Today"
                            : sub.daysUntil === 1
                              ? "Tomorrow"
                              : `In ${sub.daysUntil} days`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

SubscriptionOverviewModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  subscriptions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      icon: PropTypes.string,
      dueDate: PropTypes.string,
      price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      billing: PropTypes.string,
      category: PropTypes.string,
    }),
  ).isRequired,
};
