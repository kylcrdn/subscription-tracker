import { useState, useEffect } from "react";
import PropTypes from "prop-types";

// Popular subscription services for autocomplete
const POPULAR_SERVICES = [
  { name: "Netflix", domain: "netflix.com" },
  { name: "Spotify", domain: "spotify.com" },
  { name: "Disney+", domain: "disneyplus.com" },
  { name: "Amazon Prime", domain: "amazon.com" },
  { name: "YouTube Premium", domain: "youtube.com" },
  { name: "Apple Music", domain: "apple.com" },
  { name: "HBO Max", domain: "hbomax.com" },
  { name: "Hulu", domain: "hulu.com" },
  { name: "Adobe Creative Cloud", domain: "adobe.com" },
  { name: "Microsoft 365", domain: "microsoft.com" },
  { name: "Google One", domain: "google.com" },
  { name: "Dropbox", domain: "dropbox.com" },
  { name: "iCloud", domain: "icloud.com" },
  { name: "GitHub", domain: "github.com" },
  { name: "LinkedIn Premium", domain: "linkedin.com" },
  { name: "Slack", domain: "slack.com" },
  { name: "Notion", domain: "notion.so" },
  { name: "Figma", domain: "figma.com" },
  { name: "Canva", domain: "canva.com" },
  { name: "ChatGPT Plus", domain: "openai.com" },
  { name: "Claude Pro", domain: "anthropic.com" },
  { name: "Twitch", domain: "twitch.tv" },
  { name: "PlayStation Plus", domain: "playstation.com" },
  { name: "Xbox Game Pass", domain: "xbox.com" },
  { name: "Nintendo Online", domain: "nintendo.com" },
  { name: "Crunchyroll", domain: "crunchyroll.com" },
  { name: "Paramount+", domain: "paramountplus.com" },
  { name: "Peacock", domain: "peacocktv.com" },
  { name: "ESPN+", domain: "espn.com" },
  { name: "Audible", domain: "audible.com" },
  { name: "Kindle Unlimited", domain: "kindle.com" },
  { name: "NordVPN", domain: "nordvpn.com" },
  { name: "ExpressVPN", domain: "expressvpn.com" },
  { name: "1Password", domain: "1password.com" },
  { name: "LastPass", domain: "lastpass.com" },
  { name: "Grammarly", domain: "grammarly.com" },
  { name: "Duolingo", domain: "duolingo.com" },
  { name: "Headspace", domain: "headspace.com" },
  { name: "Calm", domain: "calm.com" },
  { name: "Strava", domain: "strava.com" },
  { name: "Peloton", domain: "onepeloton.com" },
  { name: "Tidal", domain: "tidal.com" },
  { name: "Deezer", domain: "deezer.com" },
  { name: "SoundCloud", domain: "soundcloud.com" },
  { name: "Medium", domain: "medium.com" },
  { name: "Substack", domain: "substack.com" },
  { name: "Patreon", domain: "patreon.com" },
];

// Logo API helper
const getLogoUrl = (domain) => {
  if (!domain) return "";
  const cleanDomain = domain
    .replace(/^(https?:\/\/)?(www\.)?/, "")
    .split("/")[0]
    .toLowerCase()
    .trim();
  return `https://logos-api.apistemic.com/domain:${cleanDomain}`;
};

export default function SubscriptionModal({
  isOpen,
  onClose,
  onSave,
  subscription,
}) {
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
  const [brandSearch, setBrandSearch] = useState("");
  const [logoError, setLogoError] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredServices, setFilteredServices] = useState([]);
  const [failedLogos, setFailedLogos] = useState(new Set());
  const [selectOpen, setSelectOpen] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
      setIconPreview(subscription?.icon ?? "");
      setErrors({});
      setBrandSearch("");
      setLogoError(false);
      setShowSuggestions(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, subscription?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle brand search with autocomplete
  const handleBrandSearch = (e) => {
    const value = e.target.value;
    setBrandSearch(value);
    setLogoError(false);

    if (value.trim()) {
      // Filter matching services
      const matches = POPULAR_SERVICES.filter(
        (service) =>
          service.name.toLowerCase().includes(value.toLowerCase()) ||
          service.domain.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredServices(matches.slice(0, 6));
      setShowSuggestions(matches.length > 0);

      // Check if input looks like a domain (contains a dot)
      if (value.includes(".")) {
        const logoUrl = getLogoUrl(value);
        setIconPreview(logoUrl);
        setFormData((prev) => ({ ...prev, icon: logoUrl }));
      }
    } else {
      setFilteredServices([]);
      setShowSuggestions(false);
      setIconPreview("");
      setFormData((prev) => ({ ...prev, icon: "" }));
    }
  };

  // Select a service from suggestions
  const handleSelectService = (service) => {
    setBrandSearch(service.domain);
    const logoUrl = getLogoUrl(service.domain);
    setIconPreview(logoUrl);
    setFormData((prev) => ({ ...prev, icon: logoUrl }));
    setShowSuggestions(false);
  };

  // Remove icon
  const handleRemoveIcon = () => {
    setFormData((prev) => ({ ...prev, icon: "" }));
    setIconPreview("");
    setBrandSearch("");
    setLogoError(false);
  };

  const handleLogoError = () => setLogoError(true);
  const handleLogoLoad = () => setLogoError(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Service name is required";
    if (!formData.price || parseFloat(formData.price) <= 0)
      newErrors.price = "Valid price is required";
    if (!formData.dueDate.trim()) newErrors.dueDate = "Date created is required";
    if (!formData.category.trim()) newErrors.category = "Category is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSave({
      ...formData,
      price: parseFloat(formData.price),
      id: subscription
        ? subscription.id
        : `sub_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    });

    setFormData({
      name: "",
      icon: "",
      dueDate: "",
      price: "",
      billing: "Monthly",
      category: "",
    });
    setIconPreview("");
    setBrandSearch("");
    setErrors({});
    onClose();
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
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
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all">
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
                onInvalid={(e) =>
                  e.target.setCustomValidity("Please fill out this field")
                }
                onInput={(e) => e.target.setCustomValidity("")}
                className={`w-full px-4 py-3 bg-gray-900/50 border ${
                  errors.name ? "border-red-500" : "border-gray-700"
                } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all`}
              />
              {errors.name && (
                <p className="text-red-400 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Service Icon */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Service Icon (optional)
              </label>

              <div className="flex items-center gap-4">
                {/* Preview */}
                <div className="flex-shrink-0">
                  {iconPreview && !logoError ? (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-700 bg-white">
                      <img
                        src={iconPreview}
                        alt="Service icon preview"
                        className="w-full h-full object-contain p-1"
                        onError={handleLogoError}
                        onLoad={handleLogoLoad}
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

                {/* Search Input */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={brandSearch}
                    onChange={handleBrandSearch}
                    onFocus={() =>
                      brandSearch &&
                      filteredServices.length > 0 &&
                      setShowSuggestions(true)
                    }
                    placeholder="Search: Netflix, Spotify..."
                    className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                  />

                  {/* Autocomplete Suggestions */}
                  {showSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                      {filteredServices
                        .filter((service) => !failedLogos.has(service.domain))
                        .map((service) => (
                          <button
                            key={service.domain}
                            type="button"
                            onClick={() => handleSelectService(service)}
                            className="w-full px-3 py-2.5 text-left text-sm text-white hover:bg-blue-600 flex items-center gap-3 transition-colors cursor-pointer"
                          >
                            <img
                              src={getLogoUrl(service.domain)}
                              alt=""
                              className="w-8 h-8 object-contain bg-white rounded p-0.5"
                              onError={() => {
                                setFailedLogos(
                                  (prev) => new Set([...prev, service.domain]),
                                );
                              }}
                            />
                            <div className="flex-1">
                              <span className="font-medium">
                                {service.name}
                              </span>
                              <span className="text-gray-400 text-xs block">
                                {service.domain}
                              </span>
                            </div>
                          </button>
                        ))}
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mt-1">
                    {logoError
                      ? "Logo not found, try adding .com"
                      : "Type a service name or domain (e.g. netflix.com)"}
                  </p>
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
                  onInvalid={(e) =>
                    e.target.setCustomValidity("Please enter a valid price")
                  }
                  onInput={(e) => e.target.setCustomValidity("")}
                  className={`w-full pl-9 pr-4 py-3 bg-gray-900/50 border ${
                    errors.price ? "border-red-500" : "border-gray-700"
                  } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all`}
                />
              </div>
              {errors.price && (
                <p className="text-red-400 text-xs mt-1">{errors.price}</p>
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
              <div className={`select-wrapper ${selectOpen ? "open" : ""}`}>
                <select
                  id="service-billing"
                  name="billing"
                  value={formData.billing}
                  onChange={(e) => {
                    handleChange(e);
                    setTimeout(() => setSelectOpen(false), 150);
                  }}
                  onClick={() => setSelectOpen(!selectOpen)}
                  onBlur={() => setTimeout(() => setSelectOpen(false), 100)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>
            </div>

            {/* Date Created */}
            <div>
              <label
                htmlFor="service-dueDate"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Date Created *
              </label>
              <input
                id="service-dueDate"
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                required
                onInvalid={(e) =>
                  e.target.setCustomValidity("Please select a date")
                }
                onInput={(e) => e.target.setCustomValidity("")}
                className={`w-full px-4 py-3 bg-gray-900/50 border ${
                  errors.dueDate ? "border-red-500" : "border-gray-700"
                } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all`}
              />
              {errors.dueDate ? (
                <p className="text-red-400 text-xs mt-1">{errors.dueDate}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  When did this subscription start?
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
                onInvalid={(e) =>
                  e.target.setCustomValidity("Please enter a category")
                }
                onInput={(e) => e.target.setCustomValidity("")}
                className={`w-full px-4 py-3 bg-gray-900/50 border ${
                  errors.category ? "border-red-500" : "border-gray-700"
                } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all`}
              />
              {errors.category && (
                <p className="text-red-400 text-xs mt-1">{errors.category}</p>
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

      {/* Click outside to close suggestions */}
      {showSuggestions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSuggestions(false)}
        />
      )}
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
