# Cloud Functions Setup Guide

## Overview

This subscription tracker now has **Firebase Cloud Functions** that automatically:
- ✅ Send email reminders before subscriptions renew
- ✅ Generate in-app notifications 3 days before renewal (configurable)
- ✅ Run daily checks at 9 AM UTC to catch all upcoming renewals
- ✅ Sync dynamically when subscriptions are created or updated
- ✅ Store user emails automatically on signup

## How It Works

### 1. **Scheduled Daily Check** (Main Reminder System)

**Function**: `checkSubscriptionReminders`
**Schedule**: Every day at 9:00 AM UTC
**What it does**:
- Scans ALL users and their subscriptions
- Calculates next renewal dates dynamically
- Finds subscriptions renewing within the notification window (default: 3 days)
- Creates in-app notifications in Firestore
- Sends email reminders to users

**Example Flow**:
```
9:00 AM UTC Daily:
1. User has Netflix subscription with renewal on Feb 15
2. Today is Feb 12 (3 days before)
3. Function creates notification in Firestore: users/{userId}/notifications
4. Function sends email to user's registered email
5. User sees notification in the app bell icon
6. User receives email reminder
```

### 2. **Real-time Triggers** (Instant Updates)

**On Subscription Created**: `onSubscriptionCreated`
- Triggers immediately when user adds a subscription
- Calculates next renewal date
- Generates future notification

**On Subscription Updated**: `onSubscriptionUpdated`
- Triggers when user edits a subscription
- Deletes old notifications
- Generates new notifications with updated data

**On User Created**: `onUserCreated`
- Triggers when user signs up
- Stores email from Firebase Auth into Firestore
- Sets default preferences (emailNotifications: true, reminderDays: 3)

### 3. **Client-Side Integration**

**Auth Context** ([index.jsx](src/contexts/authContext/index.jsx:33))
- Automatically creates user profile in Firestore when user signs in
- Stores email, displayName, photoURL

**Notification Bell** ([NotificationBell.jsx](src/components/home/NotificationBell.jsx))
- Listens to notifications in real-time
- Shows unread count
- Displays notifications 3 days before renewal

## Installation Steps

### Step 1: Install Function Dependencies

```bash
cd functions
npm install
```

### Step 2: Configure Email Service

You have 3 options for sending emails:

#### Option A: Gmail (Quick Setup for Testing)

1. Enable 2-Factor Authentication on your Gmail
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Create `functions/.env`:

```env
EMAIL_SERVICE=gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
EMAIL_FROM=your-email@gmail.com
```

#### Option B: SendGrid (Recommended for Production)

1. Sign up: https://sendgrid.com/
2. Create API key with "Mail Send" permission
3. Create `functions/.env`:

```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

#### Option C: Custom SMTP

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=username
SMTP_PASSWORD=password
EMAIL_FROM=noreply@yourdomain.com
```

### Step 3: Set Production Environment Variables

For production deployment, use Firebase environment config:

```bash
# For Gmail
firebase functions:config:set \
  email.service=gmail \
  email.user=your-email@gmail.com \
  email.password=your-app-password \
  email.from=your-email@gmail.com

# For SendGrid
firebase functions:config:set \
  email.service=sendgrid \
  sendgrid.key=your-api-key \
  email.from=noreply@yourdomain.com
```

Or use Secret Manager (more secure):

```bash
firebase functions:secrets:set SENDGRID_API_KEY
# Paste your key when prompted

firebase functions:config:set email.service=sendgrid email.from=noreply@yourdomain.com
```

### Step 4: Update Firestore Security Rules

Add rules to allow Cloud Functions to access notifications:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Allow users to read/write their own profile
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /subscriptions/{subscriptionId} {
        // Allow users to manage their subscriptions
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /notifications/{notificationId} {
        // Allow users to read/update their notifications
        allow read, update: if request.auth != null && request.auth.uid == userId;
        // Allow Cloud Functions to create/delete notifications
        allow create, delete: if request.auth != null;
      }
    }
  }
}
```

### Step 5: Deploy Cloud Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Or deploy specific functions
firebase deploy --only functions:checkSubscriptionReminders
firebase deploy --only functions:onSubscriptionCreated
firebase deploy --only functions:onSubscriptionUpdated
firebase deploy --only functions:onUserCreated
```

**Note**: First deployment may take 3-5 minutes.

### Step 6: Enable Cloud Scheduler (Required for Scheduled Functions)

1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Select your Firebase project
3. Enable Cloud Scheduler API
4. Verify billing is enabled (required for scheduled functions, but free tier covers most usage)

### Step 7: Test the Setup

#### Test User Profile Creation
1. Register a new user or sign in
2. Check Firestore Console → users collection
3. Verify user document has email field

#### Test Notification Generation
1. Add a subscription with a due date 3 days from now
2. Check Firestore Console → users/{userId}/notifications
3. Verify notification was created

#### Test Scheduled Function Manually
```bash
# In Firebase Console → Functions → checkSubscriptionReminders → Testing tab
# Click "Run Test" to trigger manually
```

Or via CLI:
```bash
firebase functions:log --only checkSubscriptionReminders --follow
```

#### Test Email Sending
1. Wait for scheduled function to run (9 AM UTC)
2. Or manually trigger the function
3. Check your email inbox for reminder

## Data Structures

### User Document
```javascript
{
  email: "user@example.com",
  displayName: "John Doe",
  photoURL: "https://...",
  emailNotifications: true,     // Enable/disable emails
  reminderDays: 3,               // Days before renewal to notify
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Subscription Document
```javascript
{
  name: "Netflix",
  amount: 15.99,
  billing: "Monthly",            // or "Yearly"
  dueDate: "2024-01-15",        // Original start date
  description: "Premium plan",
  category: "Entertainment",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:30:00Z"
}
```

### Notification Document
```javascript
{
  subscriptionId: "abc123",
  subscriptionName: "Netflix",
  subscriptionAmount: 15.99,
  dueDate: "2024-01-15",
  billing: "Monthly",
  renewalDate: "2024-02-15T00:00:00Z",  // Calculated next renewal
  sendAt: "2024-02-12T00:00:00Z",        // When to show notification
  notifyDaysBefore: 3,
  read: false,
  dismissed: false,
  emailSent: true,
  emailSentAt: Timestamp,
  createdAt: Timestamp
}
```

## Dynamic Configuration

### Per-User Customization

Users can customize their reminder preferences by updating their user document:

```javascript
// Update in Firestore Console or via app
{
  emailNotifications: false,   // Disable email reminders
  reminderDays: 7              // Get notified 7 days before instead of 3
}
```

### Global Configuration

Edit [functions/index.js](functions/index.js:17-25):

```javascript
const REMINDER_CONFIG = {
  defaultDaysBefore: 3,  // Change default reminder days
  email: {
    from: "noreply@subscriptiontracker.app"
  }
};
```

## Monitoring & Debugging

### View Function Logs

```bash
# All functions
firebase functions:log

# Specific function
firebase functions:log --only checkSubscriptionReminders

# Real-time logs
firebase functions:log --follow
```

### Check Function Execution

Firebase Console → Functions → Dashboard shows:
- Invocation count
- Execution time
- Error rate
- Memory usage

### Common Issues

**Emails not sending?**
- Check function logs: `firebase functions:log`
- Verify environment variables: `firebase functions:config:get`
- For Gmail: Ensure App Password (not regular password)
- For SendGrid: Verify API key has "Mail Send" permission

**Scheduled function not running?**
- Enable Cloud Scheduler API
- Enable billing (required for scheduled functions)
- Check Cloud Scheduler: https://console.cloud.google.com/cloudscheduler

**Notifications not appearing?**
- Check Firestore indexes are created
- Verify notification query: `sendAt <= today AND dismissed == false`
- Check browser console for errors

## Cost Estimate

**Free Tier Coverage**:
- Scheduled function: 30 invocations/month (1/day × 30 days)
- Trigger functions: ~100-1000/month depending on usage
- SendGrid: 100 emails/day free
- Total: **$0/month** for most users

**Paid Usage** (if exceeding free tier):
- Cloud Functions: $0.40 per million invocations
- Firestore: $0.18 per 100K reads
- SendGrid: $14.95/month for 40K emails

## Security

✅ User emails stored securely in Firestore
✅ Email credentials in environment variables (not in code)
✅ Functions run with Admin SDK (server-side)
✅ SMTP passwords never exposed to client
✅ User data access controlled by Firestore rules

## Architecture Diagram

```
User Signs Up
    ↓
[Auth Context] → createUserProfile()
    ↓
[Firestore] users/{userId} created with email
    ↓
[Cloud Function] onUserCreated triggered
    ↓
User email stored ✓

User Adds Subscription
    ↓
[Client] addSubscription()
    ↓
[Firestore] subscription created
    ↓
[Cloud Function] onSubscriptionCreated triggered
    ↓
Initial notification generated ✓

Daily at 9 AM UTC
    ↓
[Cloud Scheduler] triggers checkSubscriptionReminders
    ↓
[Cloud Function] scans all users & subscriptions
    ↓
Calculates next renewal dates dynamically
    ↓
Generates notifications for renewals within 3 days
    ↓
Sends emails + creates in-app notifications ✓
    ↓
[Client] NotificationBell shows new notifications ✓
```

## Next Steps

1. ✅ Deploy functions: `firebase deploy --only functions`
2. ✅ Configure email service
3. ✅ Test with a sample subscription
4. ✅ Monitor logs for first scheduled run
5. ✅ Customize reminder days per user if needed

## Support

For issues or questions:
- Check function logs: `firebase functions:log`
- Review [functions/README.md](functions/README.md)
- Firebase documentation: https://firebase.google.com/docs/functions
