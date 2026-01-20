// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

/**
 * 
const firebaseConfig = {
  apiKey: "AIzaSyBDcFWW1xwOc9_504QBKRX9idbMP9tr1qw",
  authDomain: "subscription-tracker-400c0.firebaseapp.com",
  projectId: "subscription-tracker-400c0",
  storageBucket: "subscription-tracker-400c0.firebasestorage.app",
  messagingSenderId: "821038498308",
  appId: "1:821038498308:web:cb55075a68f9e81ac1eb51",
  measurementId: "G-D7LVWZ2GE7",
};
 * 
 * */

const firebaseConfig = {
  apiKey: "AIzaSyBDcFWW1xwOc9_504QBKRX9idbMP9tr1qw",
  authDomain: "subscription-tracker-400c0.firebaseapp.com",
  projectId: "subscription-tracker-400c0",
  storageBucket: "subscription-tracker-400c0.firebasestorage.app",
  messagingSenderId: "821038498308",
  appId: "1:821038498308:web:cb55075a68f9e81ac1eb51",
  measurementId: "G-D7LVWZ2GE7",
};

// const firebaseConfig = {
//   apiKey: "your_apiKey",
//   authDomain: "your_authDomain",
//   projectId: "your_projectId",
//   storageBucket: "your_storageBucket",
//   messagingSenderId: "your_messagingSenderId",
//   appId: "your_appId",
// };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
