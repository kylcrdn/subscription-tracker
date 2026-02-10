/**
 * Login page — supports email/password sign-in, Google OAuth, and password reset.
 *
 * Navigation flow:
 *  - On successful sign-in, the useAuth context updates userLoggedIn → useEffect redirects to /home.
 *  - "Forgot password?" opens an inline modal that sends a Firebase password reset email.
 *  - "Sign up" navigates to /register.
 *
 * Error handling: Firebase error codes are mapped to user-friendly messages.
 * The isSigningIn flag prevents duplicate submissions while a request is in flight.
 */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../contexts/authContext";
import {
  doSignInWithEmailAndPassword,
  doSignInWithGoogle,
  doPasswordReset,
} from "../../../../firebase/auth";
import ThemeToggle from "../../../common/ThemeToggle";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const { userLoggedIn } = useAuth();
  const navigate = useNavigate();

  // Redirect to /home once auth state confirms the user is logged in
  useEffect(() => {
    if (userLoggedIn) {
      navigate("/home");
    }
  }, [userLoggedIn, navigate]);

  // Email/password sign-in — navigation is handled by the useEffect above
  const onSubmit = async (e) => {
    e.preventDefault();

    if (!isSigningIn) {
      setIsSigningIn(true);
      setErrorMessage("");

      try {
        await doSignInWithEmailAndPassword(email, password);
        // Don't manually navigate - useEffect will handle it when userLoggedIn changes
      } catch (error) {
        // Map Firebase error codes to user-friendly messages
        let message = "Failed to sign in. Please try again.";

        if (error.code === "auth/user-not-found") {
          message = "No account found with this email.";
        } else if (error.code === "auth/wrong-password") {
          message = "Incorrect password.";
        } else if (error.code === "auth/invalid-email") {
          message = "Invalid email address.";
        } else if (error.code === "auth/user-disabled") {
          message = "This account has been disabled.";
        } else if (error.code === "auth/too-many-requests") {
          message = "Too many failed attempts. Try again later.";
        } else if (error.code === "auth/invalid-credential") {
          message = "Invalid email or password.";
        }

        setErrorMessage(message);
        setIsSigningIn(false);
      }
    }
  };

  // Handle Google sign-in
  const onGoogleSignIn = async (e) => {
    e.preventDefault();

    if (!isSigningIn) {
      setIsSigningIn(true);
      setErrorMessage("");

      try {
        await doSignInWithGoogle();
        // Don't manually navigate - useEffect will handle it
      } catch (error) {
        console.error("Google sign-in error:", error.code, error.message);
        let message = "Failed to sign in with Google.";

        if (error.code === "auth/popup-closed-by-user") {
          message = "Sign-in cancelled.";
        } else if (
          error.code === "auth/account-exists-with-different-credential"
        ) {
          message =
            "An account already exists with this email using a different sign-in method.";
        }

        setErrorMessage(message);
        setIsSigningIn(false);
      }
    }
  };

  // Handle password reset
  const onPasswordReset = async (e) => {
    e.preventDefault();
    setIsResetting(true);
    setResetMessage("");

    try {
      await doPasswordReset(resetEmail);
      setResetMessage("success");
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        setResetMessage("No account found with this email.");
      } else if (error.code === "auth/invalid-email") {
        setResetMessage("Invalid email address.");
      } else {
        setResetMessage("Failed to send reset email. Please try again.");
      }
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-panel relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-content mb-2">
            Welcome Back
          </h1>
          <p className="text-content-dim">Sign in to your account</p>
        </div>

        <div className="bg-surface rounded-lg shadow-xl border border-edge p-8">
          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {errorMessage}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-content-dim mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSigningIn}
                className="w-full px-4 py-2 bg-control border border-edge text-content rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-content-faint disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-content-dim mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSigningIn}
                className="w-full px-4 py-2 bg-control border border-edge text-content rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-content-faint disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => {
                  setShowResetPassword(true);
                  setResetEmail(email);
                  setResetMessage("");
                }}
                className="mt-2 text-sm text-link hover:text-link-hover"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isSigningIn}
              className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSigningIn ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-edge"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-surface text-content-dim">or</span>
            </div>
          </div>

          <button
            onClick={onGoogleSignIn}
            disabled={isSigningIn}
            className="w-full flex items-center justify-center gap-3 bg-control border border-edge text-content py-2.5 rounded-lg font-medium hover:bg-control/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isSigningIn ? "Signing in..." : "Continue with Google"}
          </button>

          <div className="mt-6 text-center text-sm text-content-dim">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              type="button"
              disabled={isSigningIn}
              className="text-link font-medium hover:text-link-hover disabled:opacity-50"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showResetPassword && (
        <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50">
          <div className="bg-surface rounded-lg p-6 w-full max-w-md mx-4 border border-edge">
            <h2 className="text-xl font-semibold text-content mb-4">
              Reset Password
            </h2>

            {resetMessage === "success" ? (
              <div>
                <p className="text-accent-green mb-4">
                  If an account exists with this email, you'll receive a password reset link.
                </p>
                <p className="text-content-dim text-sm mb-4">
                  Note: If you signed up with Google, use "Continue with Google" instead - no password reset needed.
                </p>
                <button
                  onClick={() => setShowResetPassword(false)}
                  className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={onPasswordReset}>
                <p className="text-content-dim text-sm mb-4">
                  Enter your email and we'll send you a link to reset your
                  password.
                </p>

                {resetMessage && resetMessage !== "success" && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    {resetMessage}
                  </div>
                )}

                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  disabled={isResetting}
                  className="w-full px-4 py-2 bg-control border border-edge text-content rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-content-faint disabled:opacity-50 mb-4"
                  placeholder="you@example.com"
                />

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(false)}
                    disabled={isResetting}
                    className="flex-1 bg-control text-content py-2.5 rounded-lg font-medium hover:bg-control/80 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50"
                  >
                    {isResetting ? "Sending..." : "Send Reset Link"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
