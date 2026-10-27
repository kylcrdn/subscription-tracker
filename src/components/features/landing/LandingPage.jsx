import { useNavigate } from "react-router-dom";
import ThemeToggle from "../../common/ThemeToggle";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-canvas via-panel to-canvas">
      {/* Ambient Material color glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-accent-emerald/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-accent-teal/10 blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-6">
        <h1 className={`text-2xl font-bold ${brandGradient}`}>SubTracker</h1>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <button
            onClick={() => navigate("/login")}
            className="rounded-lg border border-edge px-5 py-2 text-sm text-content-dim transition-all duration-200 hover:border-accent-lime/50 hover:text-content"
          >
            Sign In
          </button>

          <button
            onClick={() => navigate("/register")}
            className={`${primaryButton} rounded-lg px-5 py-2 text-sm`}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-32 pt-20 text-center">
        <div className="mb-8 inline-flex items-center rounded-full border border-edge/50 bg-surface/30 px-4 py-1.5 text-sm text-content-dim backdrop-blur-sm">
          Track every subscription in one place
        </div>

        <h2 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-content md:text-7xl">
          Know where your
          <br />
          <span className={brandGradient}>money goes</span>
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-content-dim md:text-xl">
          Stop losing track of recurring payments. SubTracker gives you a clear
          overview of all your subscriptions, spending insights, and timely
          renewal reminders.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => navigate("/register")}
            className={`${primaryButton} px-8 py-3.5 text-lg hover:scale-[1.02]`}
          >
            Start Tracking Free
          </button>

          <button
            onClick={() => navigate("/login")}
            className="rounded-xl border border-edge px-8 py-3.5 text-lg font-medium text-content-dim transition-all duration-200 hover:border-accent-lime/50 hover:text-content"
          >
            Sign In
          </button>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="relative z-10 mx-auto mb-32 max-w-5xl px-6">
        <div className="rounded-2xl border border-edge/50 bg-linear-to-br from-surface/50 to-surface/30 p-6 shadow-2xl backdrop-blur-sm md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className={`text-lg font-bold ${brandGradient}`}>
                SubTracker
              </div>
              <div className="mt-0.5 text-xs text-content-faint">
                user@example.com
              </div>
            </div>
            <div className="h-8 w-8 rounded-lg bg-control/50" />
          </div>

          {/* Stats */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-edge/30 bg-linear-to-br from-surface/80 to-surface/40 p-4"
              >
                <div className="mb-1 text-xs uppercase tracking-wider text-content-faint">
                  {stat.label}
                </div>
                <div className="text-xl font-bold text-content md:text-2xl">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Subscription rows */}
          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <div
                key={sub.name}
                className="flex items-center justify-between rounded-xl border border-edge/30 bg-surface/40 px-5 py-3.5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-control/50 text-xs font-bold text-content-dim">
                    {sub.name[0]}
                  </div>

                  <div>
                    <div className="text-sm font-medium text-content">
                      {sub.name}
                    </div>
                    <div className="text-xs text-content-faint">
                      {sub.cycle}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-semibold text-content">
                    {sub.price}
                  </div>
                  <div className={`text-xs ${sub.color}`}>{sub.days}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 mx-auto mb-32 max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h3 className="mb-4 text-3xl font-bold text-content md:text-4xl">
            Everything you need
          </h3>
          <p className="mx-auto max-w-xl text-lg text-content-dim">
            Simple tools to take control of your recurring expenses.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map((feature) => {
            const style = featureStyles[feature.color];

            return (
              <div
                key={feature.title}
                className={`rounded-2xl border border-edge/50 bg-linear-to-br from-surface/50 to-surface/30 p-8 backdrop-blur-sm transition-all duration-300 ${style.border}`}
              >
                <div
                  className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${style.background} ${style.text}`}
                >
                  {feature.icon}
                </div>

                <h4 className="mb-3 text-lg font-semibold text-content">
                  {feature.title}
                </h4>

                <p className="text-sm leading-relaxed text-content-dim">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Call to action */}
      <section className="relative z-10 mx-auto mb-20 max-w-3xl px-6">
        <div className="rounded-2xl border border-edge/50 bg-linear-to-br from-surface/50 to-surface/30 p-8 text-center backdrop-blur-sm md:p-12">
          <h3 className="mb-4 text-3xl font-bold text-content">
            Ready to take control?
          </h3>

          <p className="mx-auto mb-8 max-w-md text-content-dim">
            Join SubTracker and stop letting forgotten subscriptions drain your
            wallet.
          </p>

          <button
            onClick={() => navigate("/register")}
            className={`${primaryButton} px-8 py-3.5 text-lg hover:scale-[1.02]`}
          >
            Create Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-edge/50 py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6">
          <span className={`text-sm font-semibold ${brandGradient}`}>
            SubTracker
          </span>

          <span className="text-right text-sm text-content-faint">
            &copy; {new Date().getFullYear()} All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
