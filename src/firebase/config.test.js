import { describe, it, expect } from "vitest";
import { getFirebaseConfig } from "./config";

describe("getFirebaseConfig", () => {
  it("returns the provided Firebase configuration when all required values exist", () => {
    const config = getFirebaseConfig({
      VITE_FIREBASE_API_KEY: "test-api-key",
      VITE_FIREBASE_AUTH_DOMAIN: "test-project.firebaseapp.com",
      VITE_FIREBASE_PROJECT_ID: "test-project-id",
      VITE_FIREBASE_STORAGE_BUCKET: "test-project.firebasestorage.app",
      VITE_FIREBASE_MESSAGING_SENDER_ID: "123456789",
      VITE_FIREBASE_APP_ID: "1:123456789:web:abc",
      VITE_FIREBASE_MEASUREMENT_ID: "G-ABC123",
    });

    expect(config.apiKey).toBe("test-api-key");
    expect(config.projectId).toBe("test-project-id");
  });

  it("throws a clear error when required Firebase values are missing", () => {
    expect(() =>
      getFirebaseConfig({
        VITE_FIREBASE_API_KEY: "",
        VITE_FIREBASE_AUTH_DOMAIN: "test-project.firebaseapp.com",
        VITE_FIREBASE_PROJECT_ID: "test-project-id",
      }),
    ).toThrow(/Missing required Firebase environment variables/i);
  });
});
