/**
 * Global authentication context.
 * Provides the current user's auth state to the entire component tree via React Context.
 *
 * Usage in any component:
 *   const { currentUser, userLoggedIn, loading } = useAuth();
 *
 * How it works:
 *  1. AuthProvider wraps the app (see App.jsx).
 *  2. On mount, it subscribes to Firebase's onAuthStateChanged listener.
 *  3. When a user logs in/out (or on page refresh), the listener fires and updates state.
 *  4. On first login, a Firestore user profile document is created (see firestore.js).
 *  5. Children are not rendered until the initial auth check completes (while loading === true).
 */
import React, { useContext, useEffect, useState } from "react";
import { auth } from "../../firebase/Firebase";
import { onAuthStateChanged } from "firebase/auth";
import { createUserProfile } from "../../firebase/firestore";

const AuthContext = React.createContext();

/** Hook to access auth state from any component. */
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * Called by Firebase whenever the auth state changes (login, logout, page refresh).
     * Creates/updates the user's Firestore profile, then updates React state.
     */
    async function initializeUser(user) {
      if (user) {
        try {
          await createUserProfile(user.uid, {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          });
        } catch (error) {
          console.error("Error creating user profile:", error);
        }

        setCurrentUser({ ...user });
        setUserLoggedIn(true);
      } else {
        setCurrentUser(null);
        setUserLoggedIn(false);
      }
      setLoading(false);
    }

    const unsubscribe = onAuthStateChanged(auth, initializeUser);
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userLoggedIn,
    loading,
  };

  // Children are only rendered after the initial auth check completes
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
