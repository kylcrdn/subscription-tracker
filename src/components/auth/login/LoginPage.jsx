import React, { useState } from "react";
import {
  doSignInWithEmailAndPassword,
  doSignInWithGoogle,
} from "../../../firebase/auth";
import { useAuth } from "../../../contexts/authContext";

export default function LoginPage() {
  const { userLoggedIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Check if user is logged in
  React.useEffect(() => {
    console.log("User logged in status:", userLoggedIn);
    if (userLoggedIn) {
      console.log("User is now logged in! Redirect to home would happen here.");
    }
  }, [userLoggedIn]);

  // Implement the sign-in with error handling
  const onSubmit = async (e) => {
    e.preventDefault();
    console.log("Attempting to sign in with:", { email });

    if (!isSigningIn) {
      setIsSigningIn(true);
      setErrorMessage(""); // Clear previous errors

      try {
        const result = await doSignInWithEmailAndPassword(email, password);
        console.log("Sign-in successful!", result);
        console.log("Email:", email);
      } catch (err) {
        console.error("Sign-in failed:", err);
        console.error("Error message:", err.message);
        console.error("Error code:", err.code);
        setErrorMessage(
          err.message || "Failed to sign in. Please check your credentials."
        );
        setIsSigningIn(false);
      }
    }
  };

  // Implement the sign-in with Google
  const onGoogleSignIn = (e) => {
    e.preventDefault();
    console.log("Attempting to sign in with Google");

    if (!isSigningIn) {
      setIsSigningIn(true);
      setErrorMessage(""); // Clear previous errors

      doSignInWithGoogle()
        .then((result) => {
          console.log("Google sign-in successful!", result);
        })
        .catch((err) => {
          console.error("Google sign-in failed:", err);
          console.error("Error message:", err.message);
          console.error("Error code:", err.code);
          setErrorMessage(err.message || "Failed to sign in with Google.");
          setIsSigningIn(false);
        });
    }
  };

  // Handle navigation to register page (placeholder for now)
  const handleRegister = () => {
    console.log("📝 Register button clicked - would navigate to /register");
    alert("Register page not yet implemented. Check console for details.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-white mb-2">Welcome</h1>
          <p className="text-gray-400">Sign in to your account</p>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-8">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {errorMessage}
            </div>
          )}
          <div className="space-y-6">
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
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition placeholder-gray-400"
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
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition placeholder-gray-400"
                placeholder="••••••••"
              />
            </div>

            <button
              onClick={onSubmit}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Sign in
            </button>
          </div>

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
            className="w-full flex items-center justify-center gap-3 bg-gray-700 border border-gray-600 text-white py-2.5 rounded-lg font-medium hover:bg-gray-600 transition"
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
            Continue with Google
          </button>

          <div className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <button
              onClick={handleRegister}
              disabled={isSigningIn}
              className="text-blue-400 font-medium hover:text-blue-300 disabled:opacity-50"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
