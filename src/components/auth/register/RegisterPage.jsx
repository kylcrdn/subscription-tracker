import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/authContext";
import {
  doCreateUserWithEmailAndPassword,
  doSignInWithGoogle,
  doSignOut,
} from "../../../firebase/auth";

export default function RegisterPage() {
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Get auth state from context
  const { userLoggedIn } = useAuth();
  const navigate = useNavigate();

  // Redirect to home if already logged in
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
        // Create user account
        await doCreateUserWithEmailAndPassword(email, password);

        // Sign-out immediately after registration
        await doSignOut();

        // Redirect to login page
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
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-white mb-2">
            Create Account
          </h1>
          <p className="text-gray-400">Sign up to get started</p>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-8">
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
                className="block text-sm font-medium text-gray-300 mb-2"
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
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-2"
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
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-gray-400">
                Must be at least 6 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300 mb-2"
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
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isRegistering}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRegistering ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-800 text-gray-400">or</span>
            </div>
          </div>

          <button
            onClick={onGoogleSignIn}
            disabled={isRegistering}
            className="w-full flex items-center justify-center gap-3 bg-gray-700 border border-gray-600 text-white py-2.5 rounded-lg font-medium hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
            {isRegistering ? "Creating account..." : "Continue with Google"}
          </button>

          <div className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              type="button"
              disabled={isRegistering}
              className="text-blue-400 font-medium hover:text-blue-300 disabled:opacity-50"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
