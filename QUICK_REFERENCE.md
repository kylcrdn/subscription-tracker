# Quick Reference - Cloud Functions

## 🚀 Quick Start

```bash
# Install dependencies
cd functions && npm install

# Configure email (choose one)
# Option 1: Gmail
echo "EMAIL_SERVICE=gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
EMAIL_FROM=your-email@gmail.com" > .env

# Option 2: SendGrid (recommended)
echo "EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com" > .env

# Deploy
firebase deploy --only functions
```

## 📋 Cloud Functions Overview

| Function | Type | Trigger | Purpose |
|----------|------|---------|---------|
| `checkSubscriptionReminders` | Scheduled | Daily 9 AM UTC | Check all subscriptions, send reminders |
| `onSubscriptionCreated` | Firestore | Document created | Generate initial notification |
| `onSubscriptionUpdated` | Firestore | Document updated | Regenerate notifications |
| `onUserCreated` | Firestore | User created | Store email from Auth |

## 🔧 Common Commands

```bash
# View logs
firebase functions:log
firebase functions:log --only checkSubscriptionReminders
firebase functions:log --follow

# Deploy functions
firebase deploy --only functions
firebase deploy --only functions:checkSubscriptionReminders

# Test locally
cd functions && npm run serve

# Get environment config
firebase functions:config:get

# Set environment config
firebase functions:config:set email.service=sendgrid
```

## 📊 File Structure

```
subscription-tracker/
├── functions/                      # Cloud Functions
│   ├── index.js                   # Main functions file
│   ├── package.json               # Dependencies
│   ├── .env                       # Local environment variables
│   ├── .env.example              # Example configuration
│   └── README.md                  # Functions documentation
├── src/
│   ├── contexts/authContext/
│   │   └── index.jsx             # Creates user profiles
│   └── firebase/
│       ├── firestore.js          # Client-side Firestore functions
│       └── auth.js               # Authentication functions
├── firebase.json                  # Firebase configuration
├── CLOUD_FUNCTIONS_SETUP.md      # Detailed setup guide
├── DEPLOYMENT_CHECKLIST.md       # Deployment steps
└── SYSTEM_VERIFICATION.md        # Architecture verification
```

## 📦 Key Dependencies

```json
{
  "firebase-admin": "^12.0.0",     // Server-side Firebase SDK
  "firebase-functions": "^6.2.0",  // Cloud Functions framework
  "nodemailer": "^6.9.16"          // Email sending
}
```

## 🔑 Environment Variables

### Local Development (.env file)

```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.your-key-here
EMAIL_FROM=noreply@yourdomain.com
```

### Production (Firebase Config)

```bash
firebase functions:config:set \
  email.service=sendgrid \
  sendgrid.key=SG.your-key-here \
  email.from=noreply@yourdomain.com
```

## 📅 Data Structures

### User Document (`users/{userId}`)
```javascript
{
  email: "user@example.com",
  emailNotifications: true,        // Toggle emails
  reminderDays: 3,                 // Days before renewal
  displayName: "John Doe",
  createdAt: Timestamp
}
```

### Notification Document (`users/{userId}/notifications/{id}`)
```javascript
{
  subscriptionId: "abc123",
  subscriptionName: "Netflix",
  renewalDate: "2024-02-15T00:00:00Z",
  sendAt: "2024-02-12T00:00:00Z",  // 3 days before
  emailSent: true,
  dismissed: false,
  read: false
}
```

## 🎯 Configuration

### Change Default Reminder Days

Edit [functions/index.js](functions/index.js:17):
```javascript
const REMINDER_CONFIG = {
  defaultDaysBefore: 7,  // Change from 3 to 7 days
  // ...
};
```

### Per-User Customization

Update user document in Firestore:
```javascript
{
  reminderDays: 7,              // Custom reminder window
  emailNotifications: false     // Disable emails
}
```

## 🐛 Troubleshooting

### Emails Not Sending?

```bash
# Check logs
firebase functions:log --only checkSubscriptionReminders

# Verify config
firebase functions:config:get

# Test email service
# For Gmail: Verify App Password (not regular password)
# For SendGrid: Check API key has "Mail Send" permission
```

### Scheduled Function Not Running?

1. Enable Cloud Scheduler API in Google Cloud Console
2. Enable billing (required for scheduled functions)
3. Check schedule: Cloud Console → Cloud Scheduler

### Notifications Not Appearing?

1. Check Firestore indexes created
2. Verify query: `sendAt <= today AND dismissed == false`
3. Check browser console for errors
4. Ensure user is authenticated

## 📈 Monitoring

### Check Function Status
```bash
# Firebase Console
Functions → Dashboard

# Cloud Console
Cloud Functions → Metrics
```

### View Execution Stats
```bash
firebase functions:log

# Stats shown in logs:
# - usersChecked
# - subscriptionsChecked
# - notificationsCreated
# - emailsSent
# - errors
```

## 💰 Cost Estimates

**Free Tier:**
- 2M function invocations/month
- 1M Firestore reads/month
- 100 SendGrid emails/day

**Typical Usage:**
- Scheduled function: ~30/month
- Trigger functions: ~100-1000/month
- **Total: $0/month** (within free tier)

## 🔒 Security Checklist

- [x] Email credentials in environment variables
- [x] Firestore rules enforce user isolation
- [x] SMTP passwords never in client code
- [x] Functions use Admin SDK (server-side)
- [x] User emails private (not exposed to client)

## 🧪 Testing

### Test Locally
```bash
cd functions
npm run serve

# Use Firebase emulators
firebase emulators:start --only functions,firestore
```

### Test in Production
```bash
# Deploy to test project first
firebase use test-project
firebase deploy --only functions

# Test, then deploy to production
firebase use production
firebase deploy --only functions
```

## 📞 Quick Help

| Issue | Solution |
|-------|----------|
| "Email not configured" in logs | Set EMAIL_SERVICE in .env or config |
| "Billing not enabled" | Enable in Google Cloud Console |
| "Permission denied" | Check Firestore rules |
| "Index not found" | Wait 2 minutes or create manually |
| Functions not deploying | Check Node version (use 20) |

## 🎓 Learn More

- [Cloud Functions Setup Guide](CLOUD_FUNCTIONS_SETUP.md)
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)
- [System Verification](SYSTEM_VERIFICATION.md)
- [Functions Documentation](functions/README.md)
- [Firebase Docs](https://firebase.google.com/docs/functions)

## 🚦 Status Indicators

### Healthy System
✅ Function logs show successful executions
✅ Cloud Scheduler job is "Enabled"
✅ Emails being delivered
✅ Notifications appearing in app
✅ No errors in logs

### Needs Attention
⚠️ High error rate in logs
⚠️ Cloud Scheduler job "Paused"
⚠️ Email service credentials expired
⚠️ Firestore indexes missing
⚠️ Costs exceeding expected

## 📝 Common Tasks

### Update Email Template
Edit [functions/index.js](functions/index.js:88-145) → `sendReminderEmail()`

### Change Schedule Time
Edit [functions/index.js](functions/index.js:425):
```javascript
exports.checkSubscriptionReminders = onSchedule({
  schedule: "0 18 * * *",  // 6 PM UTC instead of 9 AM
  // ...
});
```

### Add SMS Notifications
1. Install Twilio: `npm install twilio`
2. Add SMS function similar to email
3. Store phone numbers in user documents

### Export Notification Data
```javascript
// Add to functions/index.js
exports.exportNotifications = onRequest(async (req, res) => {
  const notifications = await getAllNotifications();
  res.json(notifications);
});
```

---

**Version:** 1.0.0
**Last Updated:** 2026-01-31
**Status:** ✅ Production Ready
