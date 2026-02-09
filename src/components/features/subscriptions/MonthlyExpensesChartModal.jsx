/**
 * Line chart modal showing monthly expenses for the current year (Jan–Dec).
 * Opened by clicking the "Yearly" stat card on the dashboard.
 *
 * The chart is rendered as a pure SVG (no charting library):
 *  - Solid cyan line for past/current months (actual data)
 *  - Dashed cyan line for future months (projected data)
 *  - Gradient fill under the actual line
 *  - Value labels above each data point
 *
 * Data comes from useSubscriptionStats → monthlyExpensesData: [{ month, total }].
 * This component is lazy-loaded via React.lazy in HomePage.
 */
import { useEffect } from "react";
import PropTypes from "prop-types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// SVG viewBox dimensions and margins for the chart layout
const W = 620;
const H = 340;
const M = { top: 40, right: 30, bottom: 40, left: 72 };
const PW = W - M.left - M.right;   // plot width (inside margins)
const PH = H - M.top - M.bottom;   // plot height (inside margins)
const PAD_X = 24;                   // horizontal padding inside the plot
const TICK_COUNT = 4;               // number of Y-axis grid lines

/**
 * Rounds the maximum Y value up to a "nice" number so that axis ticks
 * fall on clean intervals (e.g. 50, 100, 200, 500...).
 */
function niceMax(value) {
  if (value <= 0) return 50;
  const rough = value / TICK_COUNT;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const frac = rough / mag;
  const step = frac <= 1 ? mag : frac <= 2 ? 2 * mag : frac <= 5 ? 5 * mag : 10 * mag;
  return step * TICK_COUNT;
}

export default function MonthlyExpensesChartModal({ isOpen, onClose, monthlyData, totalYearly }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const yMax = niceMax(Math.max(...monthlyData.map((d) => d.total)));
  const yTicks = Array.from({ length: TICK_COUNT + 1 }, (_, i) => (yMax / TICK_COUNT) * i);

  // Coordinate mapping: convert month index / value to SVG x/y positions
  const x = (month) => M.left + PAD_X + (month / 11) * (PW - 2 * PAD_X);
  const y = (val) => M.top + PH - (val / yMax) * PH;

  // Build an SVG polyline path string from an array of data points
  const buildPath = (data) =>
    data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(d.month)} ${y(d.total)}`).join(" ");

  // Split data into actual (past + current month) and projected (current month onward).
  // They overlap at the current month so the lines connect seamlessly.
  const actual = monthlyData.slice(0, currentMonth + 1);
  const projected = monthlyData.slice(currentMonth);
  const actualPath = buildPath(actual);
  const projectedPath = buildPath(projected);

  // Closed path for the gradient fill area under the actual line
  const areaPath =
    actualPath +
    ` L ${x(currentMonth)} ${M.top + PH}` +
    ` L ${x(0)} ${M.top + PH} Z`;


  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="expenses-title">
      <div className="fixed inset-0 bg-overlay backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-linear-to-br from-surface to-panel border border-edge/50 rounded-2xl shadow-2xl w-full max-w-2xl p-8">
          <button onClick={onClose} className="absolute top-4 right-4 text-content-dim hover:text-content transition-colors" aria-label="Close">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="text-center mb-6">
            <h2 id="expenses-title" className="text-xl font-bold text-content">Monthly Expenses</h2>
            <p className="text-sm text-content-dim">(Jan &ndash; Dec {currentYear})</p>
          </div>

          <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Grid */}
            {yTicks.map((v) => (
              <line key={v} x1={M.left} y1={y(v)} x2={W - M.right} y2={y(v)} stroke="var(--th-edge)" strokeWidth="0.5" strokeDasharray={v === 0 ? "0" : "4 3"} />
            ))}

            {/* Area under actual */}
            <path d={areaPath} fill="url(#areaFill)" />

            {/* Actual line (solid) */}
            <path d={actualPath} fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Projected line (dashed) */}
            {projected.length > 1 && (
              <path d={projectedPath} fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="6 4" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
            )}

            {/* Dots + value labels */}
            {monthlyData.map((d) => {
              const past = d.month <= currentMonth;
              return (
                <g key={d.month}>
                  <circle cx={x(d.month)} cy={y(d.total)} r="4" fill={past ? "#22d3ee" : "var(--th-surface)"} stroke="#22d3ee" strokeWidth="2" opacity={past ? 1 : 0.4} />
                  <text x={x(d.month)} y={y(d.total) - 10} textAnchor="middle" fill="var(--th-content)" fontSize="9" fontWeight="600" opacity={past ? 1 : 0.35}>
                    €{d.total.toFixed(2)}
                  </text>
                </g>
              );
            })}

            {/* X-axis */}
            {MONTHS.map((label, i) => (
              <text key={label} x={x(i)} y={H - 8} textAnchor="middle" fill={i <= currentMonth ? "var(--th-content-dim)" : "var(--th-content-faint)"} fontSize="11">
                {label}
              </text>
            ))}

            {/* Y-axis */}
            {yTicks.map((v) => (
              <text key={v} x={M.left - 8} y={y(v) + 4} textAnchor="end" fill="var(--th-content-dim)" fontSize="11">
                €{v.toFixed(2)}
              </text>
            ))}
          </svg>

          <div className="text-center mt-6">
            <p className="text-sm text-content-dim">Projected Yearly Total</p>
            <p className="text-2xl font-bold text-content">€{totalYearly.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

MonthlyExpensesChartModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  monthlyData: PropTypes.arrayOf(
    PropTypes.shape({
      month: PropTypes.number.isRequired,
      total: PropTypes.number.isRequired,
    }),
  ).isRequired,
  totalYearly: PropTypes.number.isRequired,
};
