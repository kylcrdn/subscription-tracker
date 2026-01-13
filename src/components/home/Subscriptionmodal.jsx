import React, { useState, useEffect } from "react";

export default function SubscriptionModal({
  isOpen,
  onClose,
  onSave,
  subscription,
}) {
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    color: "#3B82F6",
    dueDate: "",
    price: "",
    currency: "€",
    billing: "Monthly",
    category: "",
  });

  // Pre-fill form when editing
  useEffect(() => {
    if (subscription) {
      setFormData({
        name: subscription.name || "",
        logo: subscription.logo || "",
        color: subscription.color || "#3B82F6",
        dueDate: subscription.dueDate || "",
        price: subscription.price || "",
        currency: subscription.currency || "€",
        billing: subscription.billing || "Monthly",
        category: subscription.category || "",
      });
    } else {
      // Reset form for new subscription
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
    }
  }, [subscription, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.price || !formData.dueDate) {
      alert("Please fill in all required fields");
      return;
    }

    onSave({
      ...formData,
      price: parseFloat(formData.price),
      id: subscription ? subscription.id : Date.now(),
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {subscription ? "Edit Subscription" : "Add Subscription"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700/50 rounded-lg"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Service Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Netflix"
                required
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
              />
            </div>

            {/* Logo and Color */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Logo (2 letters)
                </label>
                <input
                  type="text"
                  name="logo"
                  value={formData.logo}
                  onChange={handleChange}
                  placeholder="NF"
                  maxLength={2}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Color
                </label>
                <div className="relative">
                  <input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="15.99"
                  step="0.01"
                  min="0"
                  required
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Currency
                </label>
                <select
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Billing Cycle
              </label>
              <select
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Next Due Date *
              </label>
              <input
                type="text"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                placeholder="7 days from now"
                required
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                e.g., "7 days from now" or "Jan 20, 2026"
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <input
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
