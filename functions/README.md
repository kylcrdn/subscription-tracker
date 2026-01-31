# Firebase Cloud Functions - Subscription Reminders

This directory contains Firebase Cloud Functions for automated subscription reminders and notifications.

## Features

### 1. **Scheduled Daily Reminder Check** (`checkSubscriptionReminders`)
- Runs every day at 9:00 AM UTC
- Scans all users and their subscriptions
- Generates in-app notifications for upcoming renewals
- Sends email reminders to users

### 2. **Auto-Notification on Subscription Create** (`onSubscriptionCreated`)
- Triggers when a new subscription is added
- Automatically generates notification for future renewal

### 3. **Auto-Update on Subscription Change** (`onSubscriptionUpdated`)
- Triggers when a subscription is updated
- Deletes old notifications
- Generates new notifications with updated data

### 4. **User Email Storage** (`onUserCreated`)
- Triggers when a new user document is created
- Fetches email from Firebase Auth
- Stores in Firestore for email notifications

## Setup Instructions

### 1. Install Dependencies

```bash
cd functions
npm install
```

### 2. Configure Email Service

Choose one of the following email services and configure accordingly:

#### Option A: Gmail (Development/Testing)

1. Create a `.env` file in the `functions` directory
2. Enable 2-Factor Authentication on your Gmail account
3. Generate an App Password: https://myaccount.google.com/apppasswords
4. Add to `.env`:

```env
EMAIL_SERVICE=gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
EMAIL_FROM=your-email@gmail.com
```

#### Option B: SendGrid (Recommended for Production)

1. Sign up for SendGrid: https://sendgrid.com/
2. Create an API key
3. Add to `.env`:

```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com
```

#### Option C: Custom SMTP

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASSWORD=your-password
EMAIL_FROM=noreply@yourdomain.com
```

### 3. Set Environment Variables in Firebase

For production deployment, set environment variables:

```bash
# For Gmail
firebase functions:config:set email.service=gmail email.user=your-email@gmail.com email.password=your-app-password email.from=your-email@gmail.com

# For SendGrid
firebase functions:config:set email.service=sendgrid sendgrid.key=your-api-key email.from=noreply@yourdomain.com

# For Custom SMTP
firebase functions:config:set email.service=smtp smtp.host=smtp.example.com smtp.port=587 smtp.user=username smtp.password=password email.from=noreply@yourdomain.com
```

Or use `.env` file for local development and Firebase's secret manager for production:

```bash
firebase functions:secrets:set EMAIL_SERVICE
firebase functions:secrets:set SENDGRID_API_KEY
```

### 4. Update Firestore Indexes

Add the following composite index to Firestore (if not already exists):

**Collection**: `users/{userId}/notifications`
- Fields:
  - `sendAt` (Ascending)
  - `dismissed` (Ascending)

This can be created automatically when you first run the function, or manually in the Firebase Console.

### 5. Deploy Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:checkSubscriptionReminders
```

### 6. Test Locally

```bash
# Start Firebase emulators
npm run serve

# Or from root directory
firebase emulators:start --only functions,firestore
```

## Function Details

### Daily Scheduled Check

**Schedule**: Every day at 9:00 AM UTC
**Timeout**: 9 minutes
**Memory**: 256MB

The function:
1. Retrieves all users from Firestore
2. For each user, gets their subscriptions
3. Calculates next renewal date for each subscription
4. Checks if renewal is within the reminder window (default: 3 days)
5. Creates in-app notification if needed
6. Sends email reminder if user has email and notifications enabled

### Configuration Options

Users can customize reminder behavior by setting fields in their user document:

```javascript
{
  email: "user@example.com",           // Required for email notifications
  emailNotifications: true,            // Enable/disable email (default: true)
  reminderDays: 3,                     // Days before renewal to notify (default: 3)
  displayName: "John Doe",             // Used in email greeting
}
```

### Notification Data Structure

Generated notifications contain:

```javascript
{
  subscriptionId: "abc123",
  subscriptionName: "Netflix",
  subscriptionAmount: 15.99,
  dueDate: "2024-01-15",              // Original start date
  billing: "Monthly",                  // or "Yearly"
  renewalDate: "2024-02-15T00:00:00Z", // Calculated next renewal
  sendAt: "2024-02-12T00:00:00Z",      // When to show (renewalDate - reminderDays)
  notifyDaysBefore: 3,
  read: false,
  dismissed: false,
  emailSent: true,
  emailSentAt: Timestamp,
  createdAt: Timestamp,
}
```

## Monitoring

### View Logs

```bash
# All functions
firebase functions:log

# Specific function
firebase functions:log --only checkSubscriptionReminders

# Follow logs in real-time
firebase functions:log --only checkSubscriptionReminders --follow
```

### Function Metrics

Check the Firebase Console → Functions to see:
- Invocation count
- Execution time
- Error rate
- Memory usage

## Troubleshooting

### Emails Not Sending

1. Check environment variables are set correctly
2. Verify email service credentials
3. Check function logs for errors: `firebase functions:log`
4. For Gmail, ensure App Password is generated (not regular password)
5. For SendGrid, verify API key has "Mail Send" permission

### Scheduled Function Not Running

1. Verify function is deployed: `firebase deploy --only functions`
2. Check Cloud Scheduler in Google Cloud Console
3. Ensure billing is enabled (Cloud Scheduler requires billing)
4. Manually trigger: Functions → checkSubscriptionReminders → Test

### Notifications Not Appearing

1. Check Firestore indexes are created
2. Verify user has subscriptions with future renewal dates
3. Check notification query in client matches `sendAt <= today`
4. Verify notifications aren't being created: Check Firestore Console

## Cost Considerations

- **Scheduled Function**: Runs once daily = ~30 invocations/month
- **Trigger Functions**: Run per subscription create/update
- **Email Service**:
  - SendGrid: 100 emails/day free
  - Gmail: Free but has daily limits (~100-500/day)

## Security

- Email credentials stored as environment variables
- Functions run with Admin SDK (elevated privileges)
- User emails only accessible to authenticated functions
- SMTP passwords never exposed to client

## Future Enhancements

- [ ] Add SMS notifications via Twilio
- [ ] Support multiple reminder intervals (7 days, 3 days, 1 day)
- [ ] User preference for notification timing
- [ ] Webhook support for third-party integrations
- [ ] Analytics dashboard for notification delivery
- [ ] Batch email sending for better performance
- [ ] Retry logic for failed email sends
