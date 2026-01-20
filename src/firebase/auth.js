// contains all the functions for authentication
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "./Firebase";

// creating a new account
export const doCreateUserWithEmailAndPassword = async (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// sign-in
export const doSignInWithEmailAndPassword = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// sign-in with a Google account
export const doSignInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  // this is IMPORTANT so that a popup will show that you can sign-in with your google account
  const result = await signInWithPopup(auth, provider);
  return result;
};

// sign-out
export const doSignOut = () => {
  return auth.signOut();
};
