import React, { useContext, useEffect, useState } from "react";
import { auth } from "../../firebase/Firebase";
import { onAuthStateChanged } from "firebase/auth";
import { createUserProfile } from "../../firebase/firestore";
/**
 * authContext folder inside context folder to CENTRALIZE AUTHENTICATION logic and state
 */

// create the AuthContext
const AuthContext = React.createContext();

// expose the auth hook
export function useAuth() {
  return useContext(AuthContext);
}

// component for the AuthProvider
export function AuthProvider({ children }) {
  // state variables for user login
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  /**
   * subscribe to the authstatechange event.
   * listens for login/logout and tells who the current user is, including on page refresh
   */
  useEffect(() => {
    async function initializeUser(user) {
      if (user) {
        // Create or update user profile in Firestore
        try {
          await createUserProfile(user.uid, {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          });
        } catch (error) {
          console.error("Error creating user profile:", error);
          // Don't block user login if profile creation fails
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

  // expose the value obj
  const value = {
    currentUser,
    userLoggedIn,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
