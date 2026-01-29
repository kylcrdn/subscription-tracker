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
    icon: subscription?.icon ?? "",
    dueDate: subscription?.dueDate ?? "",
    price: subscription?.price ?? "",
    billing: subscription?.billing ?? "Monthly",
    category: subscription?.category ?? "",
  });

  const [formData, setFormData] = useState(getInitialFormData);
  const [errors, setErrors] = useState({});
  const [iconPreview, setIconPreview] = useState(subscription?.icon ?? "");

  // Reset form when modal opens or subscription changes
  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
      setIconPreview(subscription?.icon ?? "");
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, subscription?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          icon: "Please select a valid image file",
        }));
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          icon: "Image size should be less than 2MB",
        }));
        return;
      }

      // Read and convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData((prev) => ({ ...prev, icon: base64String }));
        setIconPreview(base64String);
        setErrors((prev) => ({ ...prev, icon: "" }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveIcon = () => {
    setFormData((prev) => ({ ...prev, icon: "" }));
    setIconPreview("");
    // Reset file input
    const fileInput = document.getElementById("service-icon");
    if (fileInput) fileInput.value = "";
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

    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
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
      id: subscription
        ? subscription.id
        : `sub_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    });

    // Reset form and close
    setFormData({
      name: "",
      icon: "",
      dueDate: "",
      price: "",
      billing: "Monthly",
      category: "",
    });
    setIconPreview("");
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
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
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
            <h2
              id="modal-title"
              className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
            >
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
              <label
                htmlFor="service-name"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Service Name *
              </label>
              <input
                id="service-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="What are you subscribed to?"
                required
                onInvalid={(e) => e.target.setCustomValidity("Please fill out this field")}
                onInput={(e) => e.target.setCustomValidity("")}
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

            {/* Icon Upload */}
            <div>
              <label
                htmlFor="service-icon"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Service Icon
              </label>
              <div className="flex items-center gap-4">
                {/* Preview */}
                <div className="flex-shrink-0">
                  {iconPreview ? (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-700 bg-gray-800">
                      <img
                        src={iconPreview}
                        alt="Service icon preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveIcon}
                        className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                        aria-label="Remove icon"
                      >
                        <svg
                          className="w-3 h-3"
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
                  ) : (
                    <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-700 bg-gray-900/50 flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <div className="flex-1">
                  <label
                    htmlFor="service-icon"
                    className="block w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-sm text-center cursor-pointer hover:bg-gray-800 transition-all"
                  >
                    {iconPreview ? "Change Icon" : "Upload Icon"}
                  </label>
                  <input
                    id="service-icon"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    aria-describedby={errors.icon ? "icon-error" : "icon-help"}
                  />
                  {errors.icon ? (
                    <p id="icon-error" className="text-red-400 text-xs mt-1">
                      {errors.icon}
                    </p>
                  ) : (
                    <p id="icon-help" className="text-xs text-gray-500 mt-1">
                      PNG, JPG, or GIF (max 2MB)
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Price */}
            <div>
              <label
                htmlFor="service-price"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Price *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base font-medium">
                  €
                </span>
                <input
                  id="service-price"
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  required
                  onInvalid={(e) => e.target.setCustomValidity("Please enter a valid price")}
                  onInput={(e) => e.target.setCustomValidity("")}
                  aria-invalid={errors.price ? "true" : "false"}
                  aria-describedby={errors.price ? "price-error" : undefined}
                  className={`w-full pl-9 pr-4 py-3 bg-gray-900/50 border ${
                    errors.price ? "border-red-500" : "border-gray-700"
                  } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all`}
                />
              </div>
              {errors.price && (
                <p id="price-error" className="text-red-400 text-xs mt-1">
                  {errors.price}
                </p>
              )}
            </div>

            {/* Billing */}
            <div>
              <label
                htmlFor="service-billing"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
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
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label
                htmlFor="service-dueDate"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Next Due Date *
              </label>
              <input
                id="service-dueDate"
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                required
                onInvalid={(e) => e.target.setCustomValidity("Please select a date")}
                onInput={(e) => e.target.setCustomValidity("")}
                aria-invalid={errors.dueDate ? "true" : "false"}
                aria-describedby={
                  errors.dueDate ? "dueDate-error" : "dueDate-help"
                }
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
              <label
                htmlFor="service-category"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Category *
              </label>
              <input
                id="service-category"
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g. Streaming, Fitness, Software"
                required
                onInvalid={(e) => e.target.setCustomValidity("Please enter a category")}
                onInput={(e) => e.target.setCustomValidity("")}
                aria-invalid={errors.category ? "true" : "false"}
                aria-describedby={errors.category ? "category-error" : undefined}
                className={`w-full px-4 py-3 bg-gray-900/50 border ${
                  errors.category ? "border-red-500" : "border-gray-700"
                } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all`}
              />
              {errors.category && (
                <p id="category-error" className="text-red-400 text-xs mt-1">
                  {errors.category}
                </p>
              )}
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
    icon: PropTypes.string,
    dueDate: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    billing: PropTypes.string,
    category: PropTypes.string,
  }),
};
