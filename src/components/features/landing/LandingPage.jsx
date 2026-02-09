import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-hidden">
      {/* Ambient glow effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
          SubTracker
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="px-5 py-2 text-sm text-gray-300 hover:text-white border border-gray-700 hover:border-gray-500 rounded-lg transition-all duration-200"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-5 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-medium"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-gray-700/50 bg-gray-800/30 backdrop-blur-sm text-sm text-gray-400">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          Track every subscription in one place
        </div>

        <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
          Know where your
          <br />
          <span className="bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            money goes
          </span>
        </h2>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          Stop losing track of recurring payments. SubTracker gives you a
          clear overview of all your subscriptions, spending insights, and
          timely renewal reminders.
        </p>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => navigate("/register")}
            className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all duration-200 font-medium text-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            Start Tracking Free
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-8 py-3.5 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white rounded-xl transition-all duration-200 font-medium text-lg"
          >
            Sign In
          </button>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 mb-32">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 md:p-8 shadow-2xl">
          {/* Mock header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-lg font-bold bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                SubTracker
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                user@example.com
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-gray-700/50" />
          </div>

          {/* Mock stat cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Monthly", value: "€29.97" },
              { label: "Yearly", value: "€359.64" },
              { label: "Active Subs", value: "3" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-gradient-to-br from-gray-800/80 to-gray-800/40 border border-gray-700/30 rounded-xl p-4"
              >
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  {stat.label}
                </div>
                <div className="text-xl md:text-2xl font-bold text-white">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Mock subscription rows */}
          <div className="space-y-3">
            {[
              { name: "Netflix", price: "€13.99", cycle: "Monthly", days: "5 days", color: "text-teal-400" },
              { name: "Spotify", price: "€9.99", cycle: "Monthly", days: "12 days", color: "text-teal-400" },
              { name: "iCloud+", price: "€5.99", cycle: "Monthly", days: "Today", color: "text-red-400" },
            ].map((sub) => (
              <div
                key={sub.name}
                className="flex items-center justify-between bg-gray-800/40 border border-gray-700/30 rounded-xl px-5 py-3.5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center text-xs font-bold text-gray-400">
                    {sub.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {sub.name}
                    </div>
                    <div className="text-xs text-gray-500">{sub.cycle}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">
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
      <section className="relative z-10 max-w-7xl mx-auto px-6 mb-32">
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Everything you need
          </h3>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Simple tools to take control of your recurring expenses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Dashboard Overview",
              description:
                "See your monthly and yearly totals at a glance with real-time stat cards and a clean subscription list.",
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              ),
              color: "emerald",
            },
            {
              title: "Spending Analytics",
              description:
                "Interactive pie charts and monthly trend lines help you understand where your money goes over time.",
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                </svg>
              ),
              color: "teal",
            },
            {
              title: "Renewal Reminders",
              description:
                "Get notified before subscriptions renew — in-app, by email, or through Discord so you never miss a date.",
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              ),
              color: "lime",
            },
          ].map((feature) => {
            const bgMap = {
              emerald: "bg-emerald-500/10",
              teal: "bg-teal-500/10",
              lime: "bg-lime-500/10",
            };
            const textMap = {
              emerald: "text-emerald-400",
              teal: "text-teal-400",
              lime: "text-lime-400",
            };
            const borderMap = {
              emerald: "hover:border-emerald-500/30",
              teal: "hover:border-teal-500/30",
              lime: "hover:border-lime-500/30",
            };

            return (
              <div
                key={feature.title}
                className={`bg-gradient-to-br from-gray-800/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 ${borderMap[feature.color]} rounded-2xl p-8 transition-all duration-300`}
              >
                <div
                  className={`w-12 h-12 rounded-xl ${bgMap[feature.color]} ${textMap[feature.color]} flex items-center justify-center mb-5`}
                >
                  {feature.icon}
                </div>
                <h4 className="text-lg font-semibold text-white mb-3">
                  {feature.title}
                </h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 mb-20">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-12 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to take control?
          </h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Join SubTracker and stop letting forgotten subscriptions drain your
            wallet.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all duration-200 font-medium text-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            Create Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800/50 py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <span className="text-sm bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent font-semibold">
            SubTracker
          </span>
          <span className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
