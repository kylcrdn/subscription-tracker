/**
 * Registration page — supports email/password sign-up and Google OAuth.
 *
 * Registration flow (email/password):
 *  1. User fills in email, password, and confirm password.
 *  2. Client-side validation runs (password match + minimum length).
 *  3. Firebase creates the account.
 *  4. The user is immediately signed out and redirected to /login so they can
 *     log in explicitly. This ensures the AuthProvider's onAuthStateChanged
 *     flow runs cleanly on first login.
 *
 * Registration flow (Google):
 *  - Google OAuth creates the account and logs in at the same time.
 *  - The useEffect redirect sends the user to /home automatically.
 *
 * Error handling: Firebase error codes are mapped to user-friendly messages.
 */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../contexts/authContext";
import {
  doCreateUserWithEmailAndPassword,
  doSignInWithGoogle,
  doSignOut,
} from "../../../../firebase/auth";
import ThemeToggle from "../../../common/ThemeToggle";
import GoogleLogo from "../../../common/GoogleLogo";
import "../auth.css";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { userLoggedIn } = useAuth();
  const navigate = useNavigate();

  // Redirect to /home if user is already logged in (e.g. after Google sign-up)
  useEffect(() => {
    if (userLoggedIn) {
      navigate("/home");
    }
  }, [userLoggedIn, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }

    if (!isRegistering) {
      setIsRegistering(true);
      setErrorMessage("");

      try {
        await doCreateUserWithEmailAndPassword(email, password);

        // Sign out immediately so the user must explicitly log in.
        // This ensures a clean first-login flow through AuthProvider.
        await doSignOut();
        navigate("/login");
      } catch (error) {
        let message = "Failed to register. Please try again.";

        if (error.code === "auth/email-already-in-use") {
          message = "This email is already registered. Try logging in instead.";
        } else if (error.code === "auth/invalid-email") {
          message = "Invalid email address.";
        } else if (error.code === "auth/weak-password") {
          message = "Password is too weak. Use at least 6 characters.";
        }

        setErrorMessage(message);
        setIsRegistering(false);
      }
    }
  };

  // Google sign-in
  const onGoogleSignIn = async (e) => {
    e.preventDefault();

    if (!isRegistering) {
      setIsRegistering(true);
      setErrorMessage("");

      try {
        await doSignInWithGoogle();
      } catch (error) {
        let message = "Failed to sign in with Google.";

        if (error.code === "auth/popup-closed-by-user") {
          message = "Sign-in cancelled.";
        }

        setErrorMessage(message);
        setIsRegistering(false);
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__theme">
        <ThemeToggle />
      </div>
      <div className="auth-page__content">
        <div className="auth-page__heading">
          <h1 className="auth-page__title">Create Account</h1>
          <p className="ui-muted">Sign up to get started</p>
        </div>

        <div className="auth-page__card ui-panel">
          {/* Display error message */}
          {errorMessage && (
            <div className="ui-error auth-page__error">
              {errorMessage}
            </div>
          )}

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
                disabled={isRegistering}
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
                disabled={isRegistering}
                className="ui-input"
                placeholder="••••••••"
              />
              <p className="auth-page__hint ui-muted">
                Must be at least 6 characters
              </p>
            </div>

            <div className="ui-field">
              <label
                htmlFor="confirmPassword"
                className="ui-label"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isRegistering}
                className="ui-input"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isRegistering}
              className="ui-button ui-button--primary auth-page__submit"
            >
              {isRegistering ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="ui-divider auth-page__divider">or</div>

          <button
            onClick={onGoogleSignIn}
            disabled={isRegistering}
            className="ui-button ui-button--secondary auth-page__google"
          >
            <GoogleLogo />
            {isRegistering ? "Creating account..." : "Continue with Google"}
          </button>

          <div className="auth-page__footer ui-muted">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              type="button"
              disabled={isRegistering}
              className="ui-link-button"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
