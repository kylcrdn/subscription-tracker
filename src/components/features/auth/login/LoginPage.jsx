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
import GoogleLogo from "../../../common/GoogleLogo";
import "../auth.css";

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
    <div className="auth-page">
      <div className="auth-page__theme">
        <ThemeToggle />
      </div>
      <div className="auth-page__content">
        <div className="auth-page__heading">
          <h1 className="auth-page__title">Welcome Back</h1>
          <p className="ui-muted">Sign in to your account</p>
        </div>

        <div className="auth-page__card ui-panel">
          {/* Error Message */}
          {errorMessage && (
            <div className="ui-error auth-page__error">
              {errorMessage}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={onSubmit} className="auth-page__form">
            <div className="ui-field">
              <label
                htmlFor="email"
                className="ui-label"
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
                className="ui-input"
                placeholder="you@example.com"
              />
            </div>

            <div className="ui-field">
              <label
                htmlFor="password"
                className="ui-label"
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
                className="ui-input"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => {
                  setShowResetPassword(true);
                  setResetEmail(email);
                  setResetMessage("");
                }}
                className="ui-link-button auth-page__forgot"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isSigningIn}
              className="ui-button ui-button--primary auth-page__submit"
            >
              {isSigningIn ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="ui-divider auth-page__divider">or</div>

          <button
            onClick={onGoogleSignIn}
            disabled={isSigningIn}
            className="ui-button ui-button--secondary auth-page__google"
          >
            <GoogleLogo />
            {isSigningIn ? "Signing in..." : "Continue with Google"}
          </button>

          <div className="auth-page__footer ui-muted">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              type="button"
              disabled={isSigningIn}
              className="ui-link-button"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showResetPassword && (
        <div className="auth-reset-overlay">
          <div className="auth-reset-dialog ui-panel">
            <h2 className="auth-reset-dialog__title">
              Reset Password
            </h2>

            {resetMessage === "success" ? (
              <div>
                <p className="auth-reset-dialog__success">
                  If an account exists with this email, you'll receive a password reset link.
                </p>
                <p className="auth-reset-dialog__note ui-muted">
                  Note: If you signed up with Google, use "Continue with Google" instead - no password reset needed.
                </p>
                <button
                  onClick={() => setShowResetPassword(false)}
                  className="ui-button ui-button--primary auth-page__submit"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={onPasswordReset}>
                <p className="auth-reset-dialog__description ui-muted">
                  Enter your email and we'll send you a link to reset your
                  password.
                </p>

                {resetMessage && resetMessage !== "success" && (
                  <div className="ui-error auth-page__error">
                    {resetMessage}
                  </div>
                )}

                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  disabled={isResetting}
                  className="ui-input auth-reset-dialog__email"
                  placeholder="you@example.com"
                />

                <div className="auth-reset-dialog__actions">
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(false)}
                    disabled={isResetting}
                    className="ui-button ui-button--secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="ui-button ui-button--primary"
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
