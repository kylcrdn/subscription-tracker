/**
 * Root application component — sets up routing, auth, error handling, and toast notifications.
 *
 * Component tree (top-down):
 *   BrowserRouter → ThemeProvider → AuthProvider → ErrorBoundary → Toaster + Routes
 *
 * Route protection:
 *  - ProtectedRoute: wraps pages that require login (redirects to /login if not authenticated).
 *  - PublicRoute: wraps login/register pages (redirects to /home if already logged in).
 *
 * Routes:
 *   /login    → LoginPage    (public)
 *   /register → RegisterPage (public)
 *   /home     → HomePage     (protected — the main dashboard)
 *   /         → LandingPage  (public entry point)
 *   *         → 404 page
 */
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/authContext";
import { ThemeProvider } from "./contexts/themeContext";
import LoginPage from "./components/features/auth/login/LoginPage";
import RegisterPage from "./components/features/auth/register/RegisterPage";
import HomePage from "./components/features/subscriptions/HomePage";
import LandingPage from "./components/features/landing/LandingPage";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { Toaster } from "react-hot-toast";

/** Renders children only if the user is logged in; otherwise redirects to /login. */
function ProtectedRoute({ children }) {
  const { userLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="text-content text-lg">Loading...</div>
      </div>
    );
  }

  return userLoggedIn ? children : <Navigate to="/login" />;
}

/** Renders children only if the user is NOT logged in; otherwise redirects to /home. */
function PublicRoute({ children }) {
  const { userLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="text-content text-lg">Loading...</div>
      </div>
    );
  }

  return !userLoggedIn ? children : <Navigate to="/home" />;
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <ErrorBoundary>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "var(--toast-bg)",
              color: "var(--toast-text)",
              border: "1px solid var(--toast-border)",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "var(--toast-bg)",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "var(--toast-bg)",
              },
            },
          }}
        />
        <Routes>
          {/* Public routes - redirect to /home if already logged in */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Protected routes - require login */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          {/* Landing page - public entry point */}
          <Route path="/" element={<LandingPage />} />

          {/* 404 - catch all unmatched routes */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-canvas">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-content mb-4">404</h1>
                  <p className="text-content-dim mb-6">Page not found</p>
                  <a
                    href="/home"
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors inline-block"
                  >
                    Go Home
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
        </ErrorBoundary>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
