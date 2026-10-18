/**
 * Firebase initialization module.
 * Sets up the Firebase app, Auth, and Firestore instances used across the entire application.
 * All Firebase services (auth.js, firestore.js) import from here to share a single app instance.
 *
 * Environment variables are defined in .env (see .env.example for the required keys).
 */
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFirebaseConfig } from "./config";

const firebaseConfig = getFirebaseConfig();

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
