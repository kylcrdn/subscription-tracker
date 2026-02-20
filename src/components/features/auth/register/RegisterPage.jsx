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
    <div className="min-h-screen flex items-center justify-center bg-panel relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-content mb-2">
            Create Account
          </h1>
          <p className="text-content-dim">Sign up to get started</p>
        </div>

        <div className="bg-surface rounded-lg shadow-xl border border-edge p-8">
          {/* Display error message */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {errorMessage}
            </div>
          )}

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
                disabled={isRegistering}
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
                disabled={isRegistering}
                className="w-full px-4 py-2 bg-control border border-edge text-content rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-content-faint disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-content-dim">
                Must be at least 6 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-content-dim mb-2"
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
                className="w-full px-4 py-2 bg-control border border-edge text-content rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-content-faint disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isRegistering}
              className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRegistering ? "Creating account..." : "Create account"}
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
            disabled={isRegistering}
            className="w-full flex items-center justify-center gap-3 bg-control border border-edge text-content py-2.5 rounded-lg font-medium hover:bg-control/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <GoogleLogo />
            {isRegistering ? "Creating account..." : "Continue with Google"}
          </button>

          <div className="mt-6 text-center text-sm text-content-dim">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              type="button"
              disabled={isRegistering}
              className="text-link font-medium hover:text-link-hover disabled:opacity-50"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
