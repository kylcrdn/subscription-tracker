/**
 * Pie chart modal showing the monthly cost split by category.
 * Opened by clicking the "Monthly" stat card on the dashboard.
 *
 * The chart is rendered as a pure SVG (no charting library) using basic
 * trigonometry to compute arc paths. If there's only one category, a
 * simple circle is drawn instead of a single-slice arc.
 *
 * Data comes from useSubscriptionStats → categoryData: [{ name, value }].
 * This component is lazy-loaded via React.lazy in HomePage.
 */
import { useEffect } from "react";
import PropTypes from "prop-types";
import "./subscriptions.css";

/** Color palette for pie slices — cycles if there are more categories than colors */
const COLORS = [
  "#FF6384",
  "#FFCE56",
  "#36A2EB",
  "#9B59B6",
  "#4BC0C0",
  "#FF9F40",
  "#7BC67E",
  "#E74C3C",
  "#8B5CF6",
  "#F97316",
];

export default function CategoryPieChartModal({
  isOpen,
  onClose,
  categoryData,
}) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !categoryData.length) return null;

  const total = categoryData.reduce((sum, d) => sum + d.value, 0);

  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 8;

  // Build SVG path data for each pie slice.
  // Each slice starts where the previous one ended (startAngle = previous endAngle).
  // The arc starts at -PI/2 (12 o'clock) and goes clockwise.
  const slices = categoryData.reduce((acc, d, i) => {
    const startAngle = acc.length > 0
      ? acc[acc.length - 1].endAngle
      : -Math.PI / 2;
    const percentage = d.value / total;
    const sliceAngle = percentage * 2 * Math.PI;
    const endAngle = startAngle + sliceAngle;

    // Single-category edge case: render as a full circle (no arc path needed)
    if (categoryData.length === 1) {
      acc.push({ ...d, color: COLORS[0], percentage, path: null, endAngle });
      return acc;
    }

    // Convert polar coordinates to cartesian for the SVG arc command
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const largeArc = sliceAngle > Math.PI ? 1 : 0;
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    acc.push({ ...d, color: COLORS[i % COLORS.length], percentage, path, endAngle });
    return acc;
  }, []);

  return (
    <div
      className="ui-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-chart-title"
    >
      <div
        className="ui-overlay__backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="ui-overlay__alignment">
        <div className="ui-dialog chart-dialog">
          {/* Close button */}
          <button
            onClick={onClose}
            className="ui-icon-button ui-dialog__close"
            aria-label="Close"
          >
            <svg
              className="ui-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Title */}
          <div className="chart-dialog__heading">
            <h2
              id="category-chart-title"
              className="chart-dialog__title"
            >
              Category Split
            </h2>
            <p className="chart-dialog__subtitle">(Monthly Cost)</p>
          </div>

          {/* Legend */}
          <div className="chart-dialog__legend">
            {slices.map((slice, i) => (
              <div key={i} className="chart-dialog__legend-item">
                <div
                  className="chart-dialog__legend-swatch"
                  style={{ backgroundColor: slice.color }}
                />
                <span>
                  {slice.name} (€{slice.value.toFixed(2)})
                </span>
              </div>
            ))}
          </div>

          {/* Pie Chart */}
          <div className="chart-dialog__chart">
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="chart-dialog__pie"
            >
              {categoryData.length === 1 ? (
                <circle cx={cx} cy={cy} r={radius} fill={COLORS[0]} />
              ) : (
                slices.map((slice, i) => (
                  <path
                    key={i}
                    d={slice.path}
                    fill={slice.color}
                    stroke="var(--th-surface)"
                    strokeWidth="2"
                  />
                ))
              )}
            </svg>
          </div>

          {/* Total */}
          <div className="chart-dialog__total">
            <p>Total Monthly</p>
            <p className="chart-dialog__total-value">
              €{total.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

CategoryPieChartModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  categoryData: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    }),
  ).isRequired,
};
