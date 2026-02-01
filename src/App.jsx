import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/authContext";
import LoginPage from "./components/features/auth/login/LoginPage";
import RegisterPage from "./components/features/auth/register/RegisterPage";
import HomePage from "./components/features/subscriptions/HomePage";
import { Toaster } from "react-hot-toast";

// Protected Route - only accessible when logged in
function ProtectedRoute({ children }) {
  const { userLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return userLoggedIn ? children : <Navigate to="/login" />;
}

// Public Route - redirects to home if already logged in
function PublicRoute({ children }) {
  const { userLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return !userLoggedIn ? children : <Navigate to="/home" />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#1f2937",
              color: "#fff",
              border: "1px solid #374151",
            },
            success: {
              iconTheme: {
                primary: "#3b82f6",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
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

          {/* Default route - redirects to home */}
          <Route path="/" element={<Navigate to="/home" />} />

          {/* 404 - catch all unmatched routes */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-white mb-4">404</h1>
                  <p className="text-gray-400 mb-6">Page not found</p>
                  <a
                    href="/home"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors inline-block"
                  >
                    Go Home
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
