import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../../common/ThemeToggle";
import "./LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      title: "All in one place",
      description:
        "See every subscription, renewal date, and monthly cost together in one clear dashboard.",
      visualTitle: "Your subscriptions",
      visualRows: [
        ["N", "Netflix", "€13.99"],
        ["S", "Spotify", "€10.99"],
        ["C", "Cloud storage", "€4.99"],
      ],
    },
    {
      title: "Know your spending",
      description:
        "Understand your monthly and yearly totals with simple, easy-to-read spending insights.",
      highlighted: true,
      visualTitle: "Monthly total",
      visualRows: [
        ["↗", "This month", "€42.97"],
        ["↓", "Compared to last month", "−12%"],
        ["◎", "Yearly estimate", "€515.64"],
      ],
    },
    {
      title: "Never miss a renewal",
      description:
        "Get timely reminders before a subscription renews, so upcoming charges are never a surprise.",
      visualTitle: "Coming up next",
      visualRows: [
        ["S", "Spotify Premium", "In 3 days"],
        ["N", "Netflix", "In 8 days"],
        ["i", "We'll remind you", "On time"],
      ],
    },
    {
      title: "Stay organized",
      description:
        "Group subscriptions by category and quickly find the services you want to manage.",
      visualTitle: "A place for everything",
      visualRows: [
        ["01", "Entertainment", "4 services"],
        ["02", "Productivity", "3 services"],
        ["03", "Everyday", "2 services"],
      ],
    },
    {
      title: "You stay in control",
      description:
        "Update or remove subscriptions whenever your needs change, all from one simple place.",
      visualTitle: "Your account, your call",
      visualRows: [
        ["✓", "Change a plan", "Anytime"],
        ["✓", "Cancel a service", "Anytime"],
        ["✓", "Update details", "In seconds"],
      ],
    },
  ];

  return (
    <div className="landing-page">
      <div className="landing-page__theme">
        <ThemeToggle />
      </div>

      <div id="home" className="landing-intro">
        <nav className="landing-nav" aria-label="Main navigation">
          <h1 className="landing-brand">SubTracker</h1>

          <div className="landing-nav__actions">
            <button
              onClick={() => navigate("/login")}
              className="landing-nav__signin"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/register")}
              className="ui-button ui-button--primary landing-button--small"
            >
              Register
            </button>
          </div>
        </nav>

        <section className="landing-hero">
          <h2 className="landing-hero__title">
            Manage money with
            <br />
            <span className="landing-brand">confidence everyday</span>
          </h2>
          <p className="landing-hero__description">
            Stop losing track of recurring payments. SubTracker gives you a
            clear overview of all your subscriptions, spending insights, and
            timely renewal reminders.
          </p>
          <div className="landing-hero__actions">
            <button
              onClick={() => navigate("/register")}
              className="ui-button ui-button--primary landing-button--large"
            >
              Start Tracking Now
            </button>
          </div>
        </section>
      </div>

      <main>
        <section
          id="showcase"
          className="landing-showcase landing-content-width"
          aria-label="Subscription tracking in everyday life"
        >
          <article className="landing-showcase__card landing-showcase__card--portrait">
            <img
              className="landing-showcase__image"
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85"
              alt="Woman looking confidently toward the camera"
              loading="lazy"
            />
            <div className="landing-showcase__scrim" aria-hidden="true" />
            <div className="landing-showcase__spend">
              <span className="landing-showcase__eyebrow">Monthly spend</span>
              <strong>€29.97</strong>
              <span className="landing-showcase__caption">
                Across 3 subscriptions
              </span>
            </div>
          </article>

          <article className="landing-showcase__card landing-showcase__card--wide">
            <img
              className="landing-showcase__image"
              src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=85"
              alt="Friends spending time together outdoors"
              loading="lazy"
            />
            <div className="landing-showcase__scrim" aria-hidden="true" />
            <div className="landing-showcase__message">
              <span className="landing-showcase__eyebrow">
                Make room for what matters
              </span>
              <strong>Know what leaves your wallet.</strong>
            </div>
            <div className="landing-showcase__renewal">
              <span className="landing-showcase__eyebrow">
                Next renewal
              </span>
              <strong>Spotify · €9.99</strong>
              <span className="landing-showcase__caption">In 5 days</span>
            </div>
          </article>
        </section>

        <section id="features" className="landing-features landing-content-width">
          <div className="landing-section-heading">
            <span className="landing-section-heading__rule" aria-hidden="true" />
            <span className="landing-section-heading__eyebrow">
              A clearer picture
            </span>
            <h3>Subscriptions,<br />sorted.</h3>
          </div>

          <div
            className="landing-feature-carousel"
            role="region"
            aria-roledescription="carousel"
            aria-label="SubTracker features"
          >
            <div className="landing-feature-carousel__stage">
              {features.map((feature, index) => {
                const offset =
                  (index - activeFeature + features.length) % features.length;
                const position = offset < 3 ? `stack-${offset}` : "hidden";

                return (
                  <article
                    key={feature.title}
                    className={`landing-feature-card landing-feature-card--${position}${feature.highlighted ? " landing-feature-card--highlighted" : ""}`}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${index + 1} of ${features.length}`}
                    aria-hidden={position !== "stack-0"}
                    aria-live={position === "stack-0" ? "polite" : "off"}
                  >
                    <div className="landing-feature-card__visual">
                      <div className="landing-feature-card__visual-top">
                        <span className="landing-feature-card__visual-label">
                          SUBTRACKER
                        </span>
                        <span className="landing-feature-card__visual-count">
                          {String(index + 1).padStart(2, "0")} /{" "}
                          {String(features.length).padStart(2, "0")}
                        </span>
                      </div>
                      <div className="landing-feature-card__mockup">
                        <div className="landing-feature-card__mockup-heading">
                          <span>{feature.visualTitle}</span>
                          <span aria-hidden="true">•••</span>
                        </div>
                        <div className="landing-feature-card__mockup-rows">
                          {feature.visualRows.map(([symbol, label, value]) => (
                            <div
                              className="landing-feature-card__mockup-row"
                              key={label}
                            >
                              <span className="landing-feature-card__mockup-icon">
                                {symbol}
                              </span>
                              <span className="landing-feature-card__mockup-label">
                                {label}
                              </span>
                              <strong>{value}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="landing-feature-card__content">
                      <span className="landing-feature-card__eyebrow">
                        FEATURE {String(index + 1).padStart(2, "0")}
                      </span>
                      <h4>{feature.title}</h4>
                      <p>{feature.description}</p>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="landing-feature-carousel__controls">
              <div
                className="landing-feature-carousel__indicators"
                role="group"
                aria-label="Choose a feature"
              >
                {features.map((feature, index) => (
                  <button
                    key={feature.title}
                    type="button"
                    className={`landing-feature-carousel__indicator${index === activeFeature ? " landing-feature-carousel__indicator--active" : ""}`}
                    aria-label={`Show feature ${index + 1}: ${feature.title}`}
                    aria-current={index === activeFeature ? "true" : undefined}
                    onClick={() => setActiveFeature(index)}
                  />
                ))}
              </div>
              <div className="landing-feature-carousel__arrows">
                <button
                  type="button"
                  className="landing-feature-carousel__arrow"
                  aria-label="Previous feature"
                  onClick={() =>
                    setActiveFeature(
                      (activeFeature - 1 + features.length) % features.length,
                    )
                  }
                >
                  <span aria-hidden="true">←</span>
                </button>
                <button
                  type="button"
                  className="landing-feature-carousel__arrow"
                  aria-label="Next feature"
                  onClick={() =>
                    setActiveFeature((activeFeature + 1) % features.length)
                  }
                >
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-cta">
          <div className="landing-panel landing-cta__panel">
            <h3>Ready to take control?</h3>

            <p>
              Join SubTracker and stop letting forgotten subscriptions drain
              your wallet.
            </p>

            <button
              onClick={() => navigate("/register")}
              className="ui-button ui-button--primary landing-button--large"
            >
              Create Free Account
            </button>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-footer__content">
          <span className="landing-brand landing-footer__brand">SubTracker</span>

          <span className="landing-footer__copyright">
            &copy; {new Date().getFullYear()} All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
