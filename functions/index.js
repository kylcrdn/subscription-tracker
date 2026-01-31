/**
 * Firebase Cloud Functions for Subscription Tracker
 * Handles automated reminders, notifications, and email alerts
 */

const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const nodemailer = require("nodemailer");

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

// ============= CONFIGURATION =============

/**
 * Configuration for reminder notifications
 * Can be customized per user in future iterations
 */
const REMINDER_CONFIG = {
  // Default days before renewal to send reminders
  defaultDaysBefore: 3,

  // Email configuration (set via environment variables)
  email: {
    from: process.env.EMAIL_FROM || "noreply@subscriptiontracker.app",
    // For production, use services like SendGrid, Mailgun, or Gmail with App Password
  },
};

// ============= EMAIL SERVICE =============

/**
 * Create email transporter
 * Configure this with your email service credentials
 * Options:
 * 1. Gmail with App Password (development)
 * 2. SendGrid (recommended for production)
 * 3. Mailgun, AWS SES, etc.
 */
function createEmailTransporter() {
  // Method 1: Gmail (for testing - requires App Password)
  if (process.env.EMAIL_SERVICE === "gmail") {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  // Method 2: SendGrid (recommended for production)
  if (process.env.EMAIL_SERVICE === "sendgrid") {
    return nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  }

  // Method 3: Custom SMTP
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  console.warn("No email service configured. Emails will not be sent.");
  return null;
}

/**
 * Send reminder email to user
 */
async function sendReminderEmail(userEmail, userName, subscription, daysUntil, renewalDate) {
  const transporter = createEmailTransporter();

  if (!transporter) {
    console.log(`Email not configured - would have sent to ${userEmail}`);
    return { sent: false, reason: "No email service configured" };
  }

  const subject = daysUntil === 0
    ? `${subscription.name} renews today!`
    : daysUntil === 1
      ? `${subscription.name} renews tomorrow`
      : `${subscription.name} renews in ${daysUntil} days`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .subscription-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Subscription Reminder</h1>
        </div>
        <div class="content">
          <p>Hi ${userName || "there"},</p>
          <p>This is a friendly reminder about your upcoming subscription renewal:</p>

          <div class="subscription-card">
            <h2 style="margin-top: 0; color: #667eea;">${subscription.name}</h2>
            <p><strong>Amount:</strong> $${subscription.amount}</p>
            <p><strong>Billing Cycle:</strong> ${subscription.billing}</p>
            <p><strong>Renewal Date:</strong> ${renewalDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
            ${subscription.description ? `<p><strong>Description:</strong> ${subscription.description}</p>` : ""}
          </div>

          ${daysUntil === 0
            ? "<p><strong>Your subscription renews today!</strong> Make sure you have sufficient funds available.</p>"
            : daysUntil === 1
              ? "<p><strong>Your subscription renews tomorrow!</strong> Make sure you have sufficient funds available.</p>"
              : `<p>Your subscription will renew in <strong>${daysUntil} days</strong>. Make sure you have sufficient funds available.</p>`
          }

          <p>If you want to cancel or modify this subscription, please do so before the renewal date.</p>
        </div>
        <div class="footer">
          <p>You're receiving this email because you subscribed to reminders in Subscription Tracker.</p>
          <p style="font-size: 12px; color: #9ca3af;">This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Subscription Reminder

Hi ${userName || "there"},

This is a friendly reminder about your upcoming subscription renewal:

${subscription.name}
Amount: $${subscription.amount}
Billing Cycle: ${subscription.billing}
Renewal Date: ${renewalDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
${subscription.description ? `Description: ${subscription.description}` : ""}

${daysUntil === 0
  ? "Your subscription renews today! Make sure you have sufficient funds available."
  : daysUntil === 1
    ? "Your subscription renews tomorrow! Make sure you have sufficient funds available."
    : `Your subscription will renew in ${daysUntil} days. Make sure you have sufficient funds available.`
}

If you want to cancel or modify this subscription, please do so before the renewal date.

---
You're receiving this email because you subscribed to reminders in Subscription Tracker.
  `.trim();

  try {
    const info = await transporter.sendMail({
      from: `"Subscription Tracker" <${REMINDER_CONFIG.email.from}>`,
      to: userEmail,
      subject: subject,
      text: textContent,
      html: htmlContent,
    });

    console.log(`Email sent to ${userEmail}: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Failed to send email to ${userEmail}:`, error);
    return { sent: false, error: error.message };
  }
}

// ============= UTILITY FUNCTIONS =============

/**
 * Calculate the next renewal date for a subscription
 */
function calculateNextRenewal(dueDate, billing) {
  const startDate = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  startDate.setHours(0, 0, 0, 0);

  let nextRenewal = new Date(startDate);

  if (billing === "Monthly") {
    nextRenewal.setMonth(nextRenewal.getMonth() + 1);
    while (nextRenewal <= today) {
      nextRenewal.setMonth(nextRenewal.getMonth() + 1);
    }
  } else if (billing === "Yearly") {
    nextRenewal.setFullYear(nextRenewal.getFullYear() + 1);
    while (nextRenewal <= today) {
      nextRenewal.setFullYear(nextRenewal.getFullYear() + 1);
    }
  }

  return nextRenewal;
}

/**
 * Calculate days until a specific date
 */
function getDaysUntil(targetDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Check if a notification already exists for this subscription and time period
 */
async function notificationExists(userId, subscriptionId, sendAtDate) {
  const sendAtISO = sendAtDate.toISOString().split("T")[0]; // Just the date part

  const snapshot = await db
    .collection("users")
    .doc(userId)
    .collection("notifications")
    .where("subscriptionId", "==", subscriptionId)
    .where("sendAt", ">=", sendAtISO)
    .where("sendAt", "<", sendAtISO + "Z") // Same day
    .limit(1)
    .get();

  return !snapshot.empty;
}

/**
 * Generate in-app notification for a subscription
 */
async function generateInAppNotification(userId, subscription, renewalDate, notifyDaysBefore) {
  // Calculate sendAt = renewalDate - notifyDaysBefore
  const sendAt = new Date(renewalDate);
  sendAt.setDate(sendAt.getDate() - notifyDaysBefore);
  sendAt.setHours(0, 0, 0, 0);

  // Check if notification already exists
  const exists = await notificationExists(userId, subscription.id, sendAt);
  if (exists) {
    console.log(`Notification already exists for subscription ${subscription.id}`);
    return null;
  }

  const notificationData = {
    subscriptionId: subscription.id,
    subscriptionName: subscription.name,
    subscriptionAmount: subscription.amount,
    dueDate: subscription.dueDate,
    billing: subscription.billing,
    renewalDate: renewalDate.toISOString(),
    sendAt: sendAt.toISOString(),
    notifyDaysBefore,
    read: false,
    dismissed: false,
    emailSent: false,
    createdAt: FieldValue.serverTimestamp(),
  };

  const docRef = await db
    .collection("users")
    .doc(userId)
    .collection("notifications")
    .add(notificationData);

  console.log(`Created notification ${docRef.id} for user ${userId}`);
  return docRef.id;
}

// ============= CLOUD FUNCTIONS =============

/**
 * SCHEDULED FUNCTION - Runs daily to check for upcoming renewals
 * Triggers: Every day at 9:00 AM UTC
 *
 * This function:
 * 1. Queries all users and their subscriptions
 * 2. Finds subscriptions renewing in the next N days
 * 3. Generates in-app notifications
 * 4. Sends email reminders
 */
exports.checkSubscriptionReminders = onSchedule({
  schedule: "0 9 * * *", // Every day at 9:00 AM UTC
  timeZone: "UTC",
  memory: "256MiB",
  timeoutSeconds: 540, // 9 minutes
}, async (event) => {
  console.log("Starting scheduled subscription reminder check...");

  const stats = {
    usersChecked: 0,
    subscriptionsChecked: 0,
    notificationsCreated: 0,
    emailsSent: 0,
    errors: 0,
  };

  try {
    // Get all users
    const usersSnapshot = await db.collection("users").get();

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      stats.usersChecked++;

      try {
        // Get user's subscriptions
        const subscriptionsSnapshot = await db
          .collection("users")
          .doc(userId)
          .collection("subscriptions")
          .get();

        for (const subDoc of subscriptionsSnapshot.docs) {
          const subscription = { id: subDoc.id, ...subDoc.data() };
          stats.subscriptionsChecked++;

          // Calculate next renewal date
          const renewalDate = calculateNextRenewal(
            subscription.dueDate,
            subscription.billing
          );

          const daysUntil = getDaysUntil(renewalDate);

          // Get reminder days (use user preference or default)
          const notifyDaysBefore = userData.reminderDays || REMINDER_CONFIG.defaultDaysBefore;

          // Check if we should send a reminder today
          if (daysUntil >= 0 && daysUntil <= notifyDaysBefore) {
            console.log(
              `Subscription ${subscription.name} for user ${userId} renews in ${daysUntil} days`
            );

            // Generate in-app notification
            const notificationId = await generateInAppNotification(
              userId,
              subscription,
              renewalDate,
              notifyDaysBefore
            );

            if (notificationId) {
              stats.notificationsCreated++;

              // Send email if user has email and hasn't been sent today
              if (userData.email && userData.emailNotifications !== false) {
                try {
                  const emailResult = await sendReminderEmail(
                    userData.email,
                    userData.displayName || userData.name,
                    subscription,
                    daysUntil,
                    renewalDate
                  );

                  if (emailResult.sent) {
                    stats.emailsSent++;

                    // Update notification to mark email as sent
                    await db
                      .collection("users")
                      .doc(userId)
                      .collection("notifications")
                      .doc(notificationId)
                      .update({
                        emailSent: true,
                        emailSentAt: FieldValue.serverTimestamp(),
                      });
                  }
                } catch (emailError) {
                  console.error(`Error sending email for subscription ${subscription.id}:`, emailError);
                  stats.errors++;
                }
              }
            }
          }
        }
      } catch (userError) {
        console.error(`Error processing user ${userId}:`, userError);
        stats.errors++;
      }
    }

    console.log("Scheduled reminder check complete:", stats);
    return stats;
  } catch (error) {
    console.error("Fatal error in scheduled function:", error);
    throw error;
  }
});

/**
 * TRIGGER FUNCTION - When a subscription is created
 * Automatically generates future notifications
 */
exports.onSubscriptionCreated = onDocumentCreated(
  "users/{userId}/subscriptions/{subscriptionId}",
  async (event) => {
    const userId = event.params.userId;
    const subscriptionId = event.params.subscriptionId;
    const subscription = { id: subscriptionId, ...event.data.data() };

    console.log(`New subscription created: ${subscription.name} for user ${userId}`);

    try {
      // Get user data for preferences
      const userDoc = await db.collection("users").doc(userId).get();
      const userData = userDoc.data() || {};

      // Calculate next renewal
      const renewalDate = calculateNextRenewal(subscription.dueDate, subscription.billing);
      const notifyDaysBefore = userData.reminderDays || REMINDER_CONFIG.defaultDaysBefore;

      // Generate notification
      await generateInAppNotification(userId, subscription, renewalDate, notifyDaysBefore);

      console.log(`Notification generated for new subscription ${subscriptionId}`);
    } catch (error) {
      console.error(`Error generating notification for new subscription:`, error);
      // Don't throw - subscription creation should succeed even if notification fails
    }
  }
);

/**
 * TRIGGER FUNCTION - When a subscription is updated
 * Regenerates notifications with updated data
 */
exports.onSubscriptionUpdated = onDocumentUpdated(
  "users/{userId}/subscriptions/{subscriptionId}",
  async (event) => {
    const userId = event.params.userId;
    const subscriptionId = event.params.subscriptionId;
    const subscription = { id: subscriptionId, ...event.data.after.data() };

    console.log(`Subscription updated: ${subscription.name} for user ${userId}`);

    try {
      // Delete old notifications for this subscription
      const notificationsSnapshot = await db
        .collection("users")
        .doc(userId)
        .collection("notifications")
        .where("subscriptionId", "==", subscriptionId)
        .where("dismissed", "==", false)
        .get();

      const batch = db.batch();
      notificationsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      // Get user data for preferences
      const userDoc = await db.collection("users").doc(userId).get();
      const userData = userDoc.data() || {};

      // Generate new notification with updated data
      const renewalDate = calculateNextRenewal(subscription.dueDate, subscription.billing);
      const notifyDaysBefore = userData.reminderDays || REMINDER_CONFIG.defaultDaysBefore;

      await generateInAppNotification(userId, subscription, renewalDate, notifyDaysBefore);

      console.log(`Notifications regenerated for updated subscription ${subscriptionId}`);
    } catch (error) {
      console.error(`Error regenerating notification for updated subscription:`, error);
      // Don't throw - subscription update should succeed even if notification fails
    }
  }
);

/**
 * HELPER FUNCTION - Store user email when they sign up
 * This should be called from the client after user registration
 * Or you can create an Auth trigger to do this automatically
 */
exports.onUserCreated = onDocumentCreated(
  "users/{userId}",
  async (event) => {
    const userId = event.params.userId;
    const userData = event.data.data();

    console.log(`New user created: ${userId}`);

    try {
      // Get user email from Firebase Auth
      const userRecord = await getAuth().getUser(userId);

      if (userRecord.email) {
        // Update user document with email and default preferences
        await db.collection("users").doc(userId).update({
          email: userRecord.email,
          emailNotifications: true, // Enable by default
          reminderDays: REMINDER_CONFIG.defaultDaysBefore,
          updatedAt: FieldValue.serverTimestamp(),
        });

        console.log(`User ${userId} email stored: ${userRecord.email}`);
      }
    } catch (error) {
      console.error(`Error storing user email:`, error);
      // Don't throw - user creation should succeed
    }
  }
);
