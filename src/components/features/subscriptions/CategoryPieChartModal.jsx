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
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-chart-title"
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-lg p-8 transform transition-all">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
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
          <div className="text-center mb-6">
            <h2
              id="category-chart-title"
              className="text-xl font-bold text-white"
            >
              Category Split
            </h2>
            <p className="text-sm text-gray-400">(Monthly Cost)</p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-6">
            {slices.map((slice, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="text-xs text-gray-300">
                  {slice.name} (€{slice.value.toFixed(2)})
                </span>
              </div>
            ))}
          </div>

          {/* Pie Chart */}
          <div className="flex justify-center">
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="drop-shadow-lg"
            >
              {categoryData.length === 1 ? (
                <circle cx={cx} cy={cy} r={radius} fill={COLORS[0]} />
              ) : (
                slices.map((slice, i) => (
                  <path
                    key={i}
                    d={slice.path}
                    fill={slice.color}
                    stroke="rgb(31, 41, 55)"
                    strokeWidth="2"
                  />
                ))
              )}
            </svg>
          </div>

          {/* Total */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-400">Total Monthly</p>
            <p className="text-2xl font-bold text-white">
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
