/**
 * Add/Edit subscription modal.
 *
 * Features:
 *  - Form fields: name, icon, price, billing cycle (Monthly/Yearly), start date, category.
 *  - Icon picker with autocomplete: type a service name (e.g. "Netflix") or a domain
 *    (e.g. "netflix.com") to auto-fetch the logo.
 *  - Logo lookup strategy:
 *      1. Clearbit Logo API (primary — high-quality brand logos)
 *      2. Google S2 Favicons (fallback — lower resolution but always works)
 *  - The POPULAR_SERVICES list below powers the autocomplete dropdown.
 *  - Form resets each time the modal opens (controlled by the isOpen/subscription props).
 *  - Closes on Escape key or clicking the backdrop.
 */
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./subscriptions.css";

/** Well-known services for autocomplete suggestions. Add new entries here to expand the list. */
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

/**
 * Builds a logo URL for a given domain.
 * @param {string} domain — e.g. "netflix.com"
 * @param {boolean} useFallback — if true, uses Google S2 instead of Clearbit
 */
const getLogoUrl = (domain, useFallback = false) => {
  if (!domain) return "";
  const cleanDomain = domain
    .replace(/^(https?:\/\/)?(www\.)?/, "")
    .split("/")[0]
    .toLowerCase()
    .trim();

  // Primary: Clearbit Logo API - free, high-quality, comprehensive brand coverage
  if (!useFallback) {
    return `https://logo.clearbit.com/${cleanDomain}`;
  }

  // Fallback: Google S2 Favicons - always works but lower resolution
  return `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=128`;
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

  // As the user types, filter POPULAR_SERVICES for matching names/domains.
  // If the input contains a dot (looks like a domain), immediately fetch the logo.
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

  // If Clearbit fails to load, swap to the Google S2 fallback URL.
  // If both fail, show the "logo not found" state.
  const handleLogoError = () => {
    // If current icon is using Clearbit, try Google fallback
    if (iconPreview && iconPreview.includes("clearbit.com")) {
      const domain = brandSearch || iconPreview.split("clearbit.com/")[1];
      const fallbackUrl = getLogoUrl(domain, true);
      setIconPreview(fallbackUrl);
      setFormData((prev) => ({ ...prev, icon: fallbackUrl }));
    } else {
      setLogoError(true);
    }
  };

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
      className="ui-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="ui-overlay__backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="ui-overlay__alignment">
        <div className="ui-dialog subscription-modal">
          <div className="subscription-modal__header">
            <h2
              id="modal-title"
              className="subscription-modal__title"
            >
              {subscription ? "Edit Subscription" : "Add Subscription"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="ui-icon-button"
            >
              <svg
                className="ui-icon"
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

          <form onSubmit={handleSubmit} className="subscription-modal__form">
            {/* Name */}
            <div className="ui-field">
              <label
                htmlFor="service-name"
                className="ui-label"
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
                className={`ui-input${errors.name ? " ui-input--invalid" : ""}`}
              />
              {errors.name && (
                <p className="subscription-modal__field-error">{errors.name}</p>
              )}
            </div>

            {/* Service Icon */}
            <div className="ui-field">
              <label className="ui-label">
                Service Icon (optional)
              </label>

              <div className="subscription-modal__icon-field">
                {/* Preview */}
                <div className="subscription-modal__preview">
                  {iconPreview && !logoError ? (
                    <div className="subscription-modal__preview-image">
                      <img
                        src={iconPreview}
                        alt="Service icon preview"
                        className="subscription-modal__service-image"
                        onError={handleLogoError}
                        onLoad={handleLogoLoad}
                      />
                      <button
                        type="button"
                        onClick={handleRemoveIcon}
                        className="subscription-modal__remove-icon"
                        aria-label="Remove icon"
                      >
                        <svg
                          className="subscription-modal__remove-icon-svg"
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
                    <div className="subscription-modal__empty-preview">
                      <svg
                        className="subscription-modal__empty-preview-icon"
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
                <div className="subscription-modal__brand-search">
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
                    className="ui-input subscription-modal__brand-input"
                  />

                  {/* Autocomplete Suggestions */}
                  {showSuggestions && (
                    <div className="subscription-modal__suggestions">
                      {filteredServices
                        .filter((service) => !failedLogos.has(service.domain))
                        .map((service) => (
                          <button
                            key={service.domain}
                            type="button"
                            onClick={() => handleSelectService(service)}
                            className="subscription-modal__suggestion"
                          >
                            <img
                              src={getLogoUrl(service.domain)}
                              alt=""
                              className="subscription-modal__suggestion-logo"
                              onError={(e) => {
                                // Try Google fallback if Clearbit fails
                                if (
                                  e.target.src.includes("clearbit.com")
                                ) {
                                  e.target.src = getLogoUrl(
                                    service.domain,
                                    true,
                                  );
                                } else {
                                  // Both failed, hide this suggestion
                                  setFailedLogos(
                                    (prev) =>
                                      new Set([...prev, service.domain]),
                                  );
                                }
                              }}
                            />
                            <div className="subscription-modal__suggestion-copy">
                              <span className="subscription-modal__suggestion-name">
                                {service.name}
                              </span>
                              <span className="subscription-modal__suggestion-domain">
                                {service.domain}
                              </span>
                            </div>
                          </button>
                        ))}
                    </div>
                  )}

                  <p className="subscription-modal__help">
                    {logoError
                      ? "Logo not found, try adding .com"
                      : "Type a service name or domain (e.g. netflix.com)"}
                  </p>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="ui-field">
              <label
                htmlFor="service-price"
                className="ui-label"
              >
                Price *
              </label>
              <div className="subscription-modal__price-field">
                <span className="subscription-modal__currency">
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
                  className={`ui-input subscription-modal__price-input${errors.price ? " ui-input--invalid" : ""}`}
                />
              </div>
              {errors.price && (
                <p className="subscription-modal__field-error">{errors.price}</p>
              )}
            </div>

            {/* Billing */}
            <div className="ui-field">
              <label
                htmlFor="service-billing"
                className="ui-label"
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
                  className="ui-select"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>
            </div>

            {/* Date Created */}
            <div className="ui-field">
              <label
                htmlFor="service-dueDate"
                className="ui-label"
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
                className={`ui-input${errors.dueDate ? " ui-input--invalid" : ""}`}
              />
              {errors.dueDate ? (
                <p className="subscription-modal__field-error">{errors.dueDate}</p>
              ) : (
                <p className="subscription-modal__help">
                  When did this subscription start?
                </p>
              )}
            </div>

            {/* Category */}
            <div className="ui-field">
              <label
                htmlFor="service-category"
                className="ui-label"
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
                className={`ui-input${errors.category ? " ui-input--invalid" : ""}`}
              />
              {errors.category && (
                <p className="subscription-modal__field-error">{errors.category}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="subscription-modal__actions">
              <button
                type="button"
                onClick={onClose}
                className="ui-button ui-button--secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="ui-button ui-button--primary"
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
          className="subscription-modal__suggestions-backdrop"
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
