/**
 * Discord webhook notification service.
 *
 * When a Discord webhook URL is configured in .env (VITE_DISCORD_WEBHOOK_URL),
 * this service sends renewal reminders as rich embeds to a Discord channel.
 *
 * Notification thresholds: messages are sent at 7, 3, 1, and 0 days before renewal.
 *
 * Deduplication strategy:
 *  - A "discord_sent" object in localStorage tracks which notifications were already
 *    sent today, keyed by subscriptionId + daysUntil + renewalDate.
 *  - Old entries are cleaned up automatically each day.
 *  - Editing a subscription changes its renewal date, which resets the dedup key
 *    so the notification fires again with the updated info.
 *
 * This service is called automatically by the useSubscriptions hook every time
 * subscription data is loaded from Firestore.
 */
import { calculateNextRenewal } from "../firebase/firestore";

const WEBHOOK_URL = import.meta.env.VITE_DISCORD_WEBHOOK_URL;

/** Days before renewal when Discord notifications should be sent */
const NOTIFY_AT_DAYS = [7, 3, 1, 0];

/**
 * Get today's date as a string key for localStorage dedup
 */
function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

/**
 * Build a dedup key that includes the subscription ID, days until renewal,
 * and renewal date — so editing a subscription resets the dedup.
 */
function buildSentKey(subscriptionId, daysUntil, renewalDate) {
  const dateStr = renewalDate.toISOString().split("T")[0];
  return `${subscriptionId}_${daysUntil}_${dateStr}`;
}

/**
 * Check if a Discord notification was already sent today for this exact scenario
 */
function wasAlreadySent(sentKey) {
  const sent = JSON.parse(localStorage.getItem("discord_sent") || "{}");
  return sent[sentKey] === getTodayKey();
}

/**
 * Mark a notification as sent for today
 */
function markAsSent(sentKey) {
  const sent = JSON.parse(localStorage.getItem("discord_sent") || "{}");
  sent[sentKey] = getTodayKey();

  // Clean up old entries (older than today)
  const today = getTodayKey();
  for (const key of Object.keys(sent)) {
    if (sent[key] !== today) delete sent[key];
  }

  localStorage.setItem("discord_sent", JSON.stringify(sent));
}

/**
 * Send a Discord embed for an upcoming subscription renewal
 */
async function sendDiscordEmbed(subscription, daysUntil, renewalDate) {
  const urgencyColor =
    daysUntil === 0 ? 0xff0000 : daysUntil === 1 ? 0xff9900 : 0x667eea;

  const title =
    daysUntil === 0
      ? `🔴 ${subscription.name} renews today!`
      : daysUntil === 1
        ? `🟠 ${subscription.name} renews tomorrow`
        : `🔵 ${subscription.name} renews in ${daysUntil} days`;

  const embed = {
    title,
    color: urgencyColor,
    fields: [
      {
        name: "💰 Amount",
        value: `€${subscription.price || subscription.amount}`,
        inline: true,
      },
      { name: "🔄 Billing Cycle", value: subscription.billing, inline: true },
      {
        name: "📅 Renewal Date",
        value: renewalDate.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        inline: true,
      },
    ],
    footer: { text: "Subscription Tracker" },
    timestamp: new Date().toISOString(),
  };

  if (subscription.description) {
    embed.fields.push({
      name: "📝 Description",
      value: subscription.description,
    });
  }

  const response = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "Subscription Tracker",
      embeds: [embed],
    }),
  });

  if (!response.ok) {
    throw new Error(`Discord webhook failed: ${response.status}`);
  }
}

/**
 * Check all subscriptions and send Discord notifications for upcoming renewals.
 * Uses localStorage to avoid sending duplicates on the same day.
 */
export async function checkAndNotifyDiscord(subscriptions) {
  if (!WEBHOOK_URL) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const sub of subscriptions) {
    if (!sub.dueDate || !sub.billing) continue;

    const renewalDate = calculateNextRenewal(sub.dueDate, sub.billing);
    const diffTime = renewalDate - today;
    const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (!NOTIFY_AT_DAYS.includes(daysUntil)) continue;

    const sentKey = buildSentKey(sub.id, daysUntil, renewalDate);
    if (wasAlreadySent(sentKey)) continue;

    try {
      await sendDiscordEmbed(sub, daysUntil, renewalDate);
      markAsSent(sentKey);
    } catch (error) {
      console.error(`Discord notification failed for ${sub.name}:`, error);
    }
  }
}
