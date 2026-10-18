/**
 * Discord notifications are intentionally disabled in the browser.
 * Webhook URLs are secrets and must never be exposed to client-side code.
 *
 * Use a server-side integration (Firebase Cloud Functions, a backend service,
 * or another trusted API layer) if you want Discord delivery.
 */
export function checkAndNotifyDiscord() {
  if (import.meta.env.DEV) {
    console.info(
      "Discord notifications are disabled in the browser for security reasons. Configure a server-side webhook instead.",
    );
  }

  return Promise.resolve();
}
