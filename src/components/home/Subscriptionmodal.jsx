import { useState, useEffect } from "react";
import PropTypes from "prop-types";

export default function SubscriptionModal({
  isOpen,
  onClose,
  onSave,
  subscription,
}) {
  // Initialize form data based on whether we're editing or creating
  const getInitialFormData = () => ({
    name: subscription?.name ?? "",
    logo: subscription?.logo ?? "",
    color: subscription?.color ?? "#3B82F6",
    dueDate: subscription?.dueDate ?? "",
    price: subscription?.price ?? "",
    currency: subscription?.currency ?? "€",
    billing: subscription?.billing ?? "Monthly",
    category: subscription?.category ?? "",
  });

  const [formData, setFormData] = useState(getInitialFormData);
  const [errors, setErrors] = useState({});

  // Reset form when modal opens or subscription changes
  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, subscription?.id])

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Service name is required";
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Valid price is required";
    }

    if (!formData.dueDate.trim()) {
      newErrors.dueDate = "Due date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    onSave({
      ...formData,
      price: parseFloat(formData.price),
      id: subscription ? subscription.id : `sub_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    });

    // Reset form and close
    setFormData({
      name: "",
      logo: "",
      color: "#3B82F6",
      dueDate: "",
      price: "",
      currency: "€",
      billing: "Monthly",
      category: "",
    });
    setErrors({});
    onClose();
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 id="modal-title" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {subscription ? "Edit Subscription" : "Add Subscription"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700/50 rounded-lg"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="service-name" className="block text-sm font-medium text-gray-300 mb-2">
                Service Name *
              </label>
              <input
                id="service-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Netflix"
                aria-invalid={errors.name ? "true" : "false"}
                aria-describedby={errors.name ? "name-error" : undefined}
                className={`w-full px-4 py-3 bg-gray-900/50 border ${
                  errors.name ? "border-red-500" : "border-gray-700"
                } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all`}
              />
              {errors.name && (
                <p id="name-error" className="text-red-400 text-xs mt-1">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Logo and Color */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="service-logo" className="block text-sm font-medium text-gray-300 mb-2">
                  Logo (2 letters)
                </label>
                <input
                  id="service-logo"
                  type="text"
                  name="logo"
                  value={formData.logo}
                  onChange={handleChange}
                  placeholder="NF"
                  maxLength={2}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all uppercase"
                />
              </div>
              <div>
                <label htmlFor="service-color" className="block text-sm font-medium text-gray-300 mb-2">
                  Color
                </label>
                <div className="relative">
                  <input
                    id="service-color"
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    aria-label="Service color picker"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div
                    className="w-full h-12 rounded-lg border border-gray-700 cursor-pointer flex items-center justify-center"
                    style={{ backgroundColor: formData.color }}
                  >
                    <span className="text-white text-xs font-medium drop-shadow-lg">
                      {formData.color}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Price and Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="service-price" className="block text-sm font-medium text-gray-300 mb-2">
                  Price *
                </label>
                <input
                  id="service-price"
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="15.99"
                  step="0.01"
                  min="0"
                  aria-invalid={errors.price ? "true" : "false"}
                  aria-describedby={errors.price ? "price-error" : undefined}
                  className={`w-full px-4 py-3 bg-gray-900/50 border ${
                    errors.price ? "border-red-500" : "border-gray-700"
                  } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all`}
                />
                {errors.price && (
                  <p id="price-error" className="text-red-400 text-xs mt-1">
                    {errors.price}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="service-currency" className="block text-sm font-medium text-gray-300 mb-2">
                  Currency
                </label>
                <select
                  id="service-currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                >
                  <option value="€">€ (EUR)</option>
                  <option value="$">$ (USD)</option>
                  <option value="£">£ (GBP)</option>
                  <option value="¥">¥ (JPY)</option>
                </select>
              </div>
            </div>

            {/* Billing */}
            <div>
              <label htmlFor="service-billing" className="block text-sm font-medium text-gray-300 mb-2">
                Billing Cycle
              </label>
              <select
                id="service-billing"
                name="billing"
                value={formData.billing}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
              >
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="service-dueDate" className="block text-sm font-medium text-gray-300 mb-2">
                Next Due Date *
              </label>
              <input
                id="service-dueDate"
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                aria-invalid={errors.dueDate ? "true" : "false"}
                aria-describedby={errors.dueDate ? "dueDate-error" : "dueDate-help"}
                className={`w-full px-4 py-3 bg-gray-900/50 border ${
                  errors.dueDate ? "border-red-500" : "border-gray-700"
                } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all`}
              />
              {errors.dueDate ? (
                <p id="dueDate-error" className="text-red-400 text-xs mt-1">
                  {errors.dueDate}
                </p>
              ) : (
                <p id="dueDate-help" className="text-xs text-gray-500 mt-1">
                  Select the next billing date
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="service-category" className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <input
                id="service-category"
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Entertainment"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 font-medium border border-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg transition-all duration-200 font-medium shadow-lg shadow-blue-500/25"
              >
                {subscription ? "Save Changes" : "Add Subscription"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

SubscriptionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  subscription: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    logo: PropTypes.string,
    color: PropTypes.string,
    dueDate: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    currency: PropTypes.string,
    billing: PropTypes.string,
    category: PropTypes.string,
  }),
};
