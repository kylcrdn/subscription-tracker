import { useNavigate } from "react-router-dom";
import ThemeToggle from "../../common/ThemeToggle";
import { Icon } from "@iconify/react";
import pieChart from "@iconify-icons/codicon/pie-chart";
import bellDot from "@iconify-icons/codicon/bell-dot";
import lineGraph from "@iconify-icons/codicon/graph-line";
import "./LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Dashboard Overview",
      description:
        "See your monthly and yearly totals at a glance with real-time stat cards and a clean subscription list.",
      color: "emerald",
      icon: <Icon icon={lineGraph} />,
    },
    {
      title: "Spending Analytics",
      description:
        "Interactive pie charts and monthly trend lines help you understand where your money goes over time.",
      color: "teal",
      icon: <Icon icon={pieChart} />,
    },
    {
      title: "Renewal Reminders",
      description:
        "Get notified before subscriptions renew — in-app, by email, or through Discord so you never miss a date.",
      color: "lime",
      icon: <Icon icon={bellDot} />,
    },
  ];

  const subscriptions = [
    { name: "Netflix", price: "€13.99", cycle: "Monthly", days: "5 days" },
    { name: "Spotify", price: "€9.99", cycle: "Monthly", days: "12 days" },
    {
      name: "iCloud+",
      price: "€5.99",
      cycle: "Monthly",
      days: "Today",
      isOverdue: true,
    },
  ];

  const stats = [
    { label: "Monthly", value: "€29.97" },
    { label: "Yearly", value: "€359.64" },
    { label: "Active Subs", value: "3" },
  ];

  return (
    <div className="landing-page">
      <div className="landing-page__ambient" aria-hidden="true">
        <div className="landing-page__glow landing-page__glow--emerald" />
        <div className="landing-page__glow landing-page__glow--teal" />
      </div>

      <nav className="landing-nav">
        <h1 className="landing-brand">SubTracker</h1>

        <div className="landing-nav__actions">
          <ThemeToggle />
          <button
            onClick={() => navigate("/login")}
            className="ui-button ui-button--quiet landing-button--small"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/register")}
            className="ui-button ui-button--primary landing-button--small"
          >
            Get Started
          </button>
        </div>
      </nav>

      <main>
        <section className="landing-hero">
          <div className="landing-hero__eyebrow">
            Track every subscription in one place
          </div>

          <h2 className="landing-hero__title">
            Know where your
            <br />
            <span className="landing-brand">money goes</span>
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
              Start Tracking Free
            </button>

            <button
              onClick={() => navigate("/login")}
              className="ui-button ui-button--quiet landing-button--large"
            >
              Sign In
            </button>
          </div>
        </section>

        <section
          className="landing-dashboard landing-content-width"
          aria-label="Subscription dashboard preview"
        >
          <div className="landing-panel landing-dashboard__panel">
            <div className="landing-dashboard__header">
              <div>
                <div className="landing-brand landing-dashboard__brand">
                  SubTracker
                </div>
                <div className="landing-caption">user@example.com</div>
              </div>
              <div className="landing-dashboard__avatar" aria-hidden="true" />
            </div>

            <div className="landing-stats">
              {stats.map((stat) => (
                <div className="landing-stat" key={stat.label}>
                  <div className="landing-caption landing-stat__label">
                    {stat.label}
                  </div>
                  <div className="landing-stat__value">{stat.value}</div>
                </div>
              ))}
            </div>

            <div className="landing-subscriptions">
              {subscriptions.map((sub) => (
                <div className="landing-subscription" key={sub.name}>
                  <div className="landing-subscription__identity">
                    <div className="landing-subscription__avatar">
                      {sub.name[0]}
                    </div>

                    <div>
                      <div className="landing-subscription__name">
                        {sub.name}
                      </div>
                      <div className="landing-caption">{sub.cycle}</div>
                    </div>
                  </div>

                  <div className="landing-subscription__details">
                    <div className="landing-subscription__price">
                      {sub.price}
                    </div>
                    <div
                      className={`landing-caption landing-subscription__renewal${sub.isOverdue ? " landing-subscription__renewal--today" : ""}`}
                    >
                      {sub.days}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-features landing-content-width">
          <div className="landing-section-heading">
            <h3>Everything you need</h3>
            <p>Simple tools to take control of your recurring expenses.</p>
          </div>

          <div className="landing-feature-grid">
            {features.map((feature) => (
              <article
                key={feature.title}
                className={`landing-panel landing-feature landing-feature--${feature.color}`}
              >
                <div className="landing-feature__icon">{feature.icon}</div>

                <h4>{feature.title}</h4>

                <p>{feature.description}</p>
              </article>
            ))}
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
