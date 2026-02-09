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

const TIMEZONE = "Europe/Madrid";

/** Converts a Date to midnight in Europe/Madrid, avoiding UTC offset issues. */
const getSpainDate = (date = new Date()) => {
  const spainDateStr = date.toLocaleDateString("en-CA", { timeZone: TIMEZONE });
  const [year, month, day] = spainDateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

/** Calculates the next renewal date from a start date and billing cycle. */
const getNextRenewal = (dueDate, billing) => {
  const today = getSpainDate();
  const startDate = getSpainDate(new Date(dueDate));
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
    const withMonthly = subscriptions.map((s) => ({
      ...s,
      monthlyCost: s.billing === "Yearly" ? s.price / 12 : s.price,
    }));

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
        const renewal = getNextRenewal(s.dueDate, s.billing);
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

  const urgencyColor = (days) => {
    if (days === 0) return "text-red-500";
    if (days <= 3) return "text-orange-500";
    return "text-accent-yellow";
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="overview-title"
    >
      <div
        className="fixed inset-0 bg-overlay backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-linear-to-br from-surface to-panel border border-edge/50 rounded-2xl shadow-2xl w-full max-w-lg p-8 transform transition-all">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-content-dim hover:text-content transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 id="overview-title" className="text-xl font-bold text-content">
              Subscription Overview
            </h2>
            <p className="text-sm text-content-dim mt-1">
              A snapshot of your {total} active subscription{total !== 1 ? "s" : ""}
            </p>
          </div>

          {!stats ? (
            <p className="text-center text-content-dim">No subscriptions to analyze.</p>
          ) : (
            <div className="space-y-8">
              {/* Billing Cycle Split */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-accent-emerald shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-content-dim">Billing Cycle</span>
                </div>
                <p className="text-xs text-content-faint mb-3">
                  How your subscriptions are billed — monthly vs yearly plans.
                </p>
                <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-control/50">
                  {stats.monthlyCount > 0 && (
                    <div
                      className="bg-emerald-500 transition-all duration-500"
                      style={{
                        width: `${monthlyPct}%`,
                        borderRadius: stats.yearlyCount === 0 ? "9999px" : "9999px 0 0 9999px",
                      }}
                    />
                  )}
                  {stats.yearlyCount > 0 && (
                    <div
                      className="bg-teal-500 transition-all duration-500"
                      style={{
                        width: `${100 - monthlyPct}%`,
                        borderRadius: stats.monthlyCount === 0 ? "9999px" : "0 9999px 9999px 0",
                      }}
                    />
                  )}
                </div>
                <div className="flex justify-between mt-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                    <span className="text-xs text-content-dim">
                      {stats.monthlyCount} Monthly
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-teal-500" />
                    <span className="text-xs text-content-dim">
                      {stats.yearlyCount} Yearly
                    </span>
                  </div>
                </div>
              </div>

              {/* Cost Highlights */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-accent-teal shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.5 0-3 1-3 2.5s1.5 2 3 2.5c1.5.5 3 1 3 2.5s-1.5 2.5-3 2.5c-1 0-2-.5-2.5-1.5" />
                    <path d="M12 6v2M12 16v2" />
                  </svg>
                  <span className="text-sm font-medium text-content-dim">Cost Comparison</span>
                </div>
                <p className="text-xs text-content-faint mb-3">
                  All prices shown as monthly cost for easy comparison.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface/60 border border-edge/30 rounded-xl p-3 text-center">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
                      <svg className="w-3.5 h-3.5 text-accent-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 15l-6-6-6 6" />
                      </svg>
                    </div>
                    <p className="text-[11px] text-content-faint mb-1">Highest</p>
                    <p className="text-sm font-bold text-content truncate" title={stats.mostExpensive.name}>
                      {stats.mostExpensive.name}
                    </p>
                    <p className="text-xs text-accent-emerald mt-0.5">
                      €{stats.mostExpensive.monthlyCost.toFixed(2)}/mo
                    </p>
                  </div>
                  <div className="bg-surface/60 border border-edge/30 rounded-xl p-3 text-center">
                    <div className="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center mx-auto mb-2">
                      <svg className="w-3.5 h-3.5 text-accent-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>
                    <p className="text-[11px] text-content-faint mb-1">Lowest</p>
                    <p className="text-sm font-bold text-content truncate" title={stats.cheapest.name}>
                      {stats.cheapest.name}
                    </p>
                    <p className="text-xs text-accent-teal mt-0.5">
                      €{stats.cheapest.monthlyCost.toFixed(2)}/mo
                    </p>
                  </div>
                </div>
              </div>

              {/* Top Category */}
              {stats.topCategory && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-accent-lime shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="text-sm font-medium text-content-dim">Most Used Category</span>
                  </div>
                  <div className="flex items-center justify-between bg-surface/60 border border-edge/30 rounded-xl px-4 py-3.5">
                    <span className="text-sm font-semibold text-content">{stats.topCategory[0]}</span>
                    <span className="text-xs text-content-dim bg-control/50 px-2.5 py-1 rounded-full">
                      {stats.topCategory[1]} of {total} subscription{total !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              )}

              {/* Upcoming Renewals */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-accent-yellow shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 01-3.46 0" />
                  </svg>
                  <span className="text-sm font-medium text-content-dim">Renewing Soon</span>
                </div>
                <p className="text-xs text-content-faint mb-3">
                  Subscriptions renewing within the next 7 days.
                </p>
                {stats.upcoming.length === 0 ? (
                  <div className="bg-surface/60 border border-edge/30 rounded-xl px-4 py-5 text-center">
                    <svg className="w-6 h-6 text-emerald-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                      <path d="M22 4L12 14.01l-3-3" />
                    </svg>
                    <p className="text-sm text-content-dim">No upcoming renewals this week</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {stats.upcoming.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between bg-surface/60 border border-edge/30 rounded-xl px-4 py-2.5"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {sub.icon ? (
                            <img
                              src={sub.icon}
                              alt=""
                              className="w-7 h-7 rounded-lg object-cover bg-white p-0.5 shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-control flex items-center justify-center text-[10px] font-bold text-content-dim shrink-0">
                              {sub.name[0]}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm text-content font-medium truncate">{sub.name}</p>
                            <p className="text-[11px] text-content-faint">{formatDate(sub.renewal)}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-semibold shrink-0 ml-3 px-2 py-0.5 rounded-full ${
                          sub.daysUntil === 0
                            ? "bg-red-500/10 text-red-500"
                            : sub.daysUntil <= 3
                              ? "bg-orange-500/10 text-orange-500"
                              : "bg-yellow-500/10 text-accent-yellow"
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
