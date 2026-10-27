import { useNavigate } from "react-router-dom";
import ThemeToggle from "../../common/ThemeToggle";
import "./LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      title: "All in one place",
      description:
        "See every subscription, renewal date, and monthly cost together in one clear dashboard.",
    },
    {
      title: "Know your spending",
      description:
        "Understand your monthly and yearly totals with simple, easy-to-read spending insights.",
      highlighted: true,
    },
    {
      title: "Never miss a renewal",
      description:
        "Get timely reminders before a subscription renews, so upcoming charges are never a surprise.",
    },
    {
      title: "Stay organized",
      description:
        "Group subscriptions by category and quickly find the services you want to manage.",
    },
    {
      title: "You stay in control",
      description:
        "Update or remove subscriptions whenever your needs change, all from one simple place.",
    },
  ];

  return (
    <div className="landing-page">
      <div className="landing-page__theme">
        <ThemeToggle />
      </div>

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

      <main id="home">
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
            <h3>Why<br />choose us</h3>
          </div>

          <ol className="landing-feature-list">
            {features.map((feature, index) => (
              <li
                key={feature.title}
                className={`landing-feature${feature.highlighted ? " landing-feature--highlighted" : ""}`}
              >
                <span className="landing-feature__number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h4>{feature.title}</h4>
                <p>{feature.description}</p>
              </li>
            ))}
          </ol>
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
