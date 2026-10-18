export const REQUIRED_FIREBASE_ENV_KEYS = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
];

export function getFirebaseConfig(env = import.meta.env) {
  const config = {
    apiKey: env.VITE_FIREBASE_API_KEY?.trim(),
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN?.trim(),
    projectId: env.VITE_FIREBASE_PROJECT_ID?.trim(),
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET?.trim(),
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim(),
    appId: env.VITE_FIREBASE_APP_ID?.trim(),
    measurementId: env.VITE_FIREBASE_MEASUREMENT_ID?.trim(),
  };

  const missing = REQUIRED_FIREBASE_ENV_KEYS.filter(
    (key) => !String(env[key] ?? "").trim(),
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required Firebase environment variables: ${missing.join(", ")}. Create a .env file in the project root and add your Firebase values before starting the app.`,
    );
  }

  return config;
}
