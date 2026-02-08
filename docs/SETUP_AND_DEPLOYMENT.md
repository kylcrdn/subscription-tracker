# Setup & Deployment

## Prerequisites

- Node.js 20+
- Firebase CLI: `npm install -g firebase-tools`
- A Firebase project with Firestore, Auth, and Cloud Functions enabled
- Billing enabled in Google Cloud Console (required for scheduled functions, free tier covers usage)
- Cloud Scheduler API enabled in Google Cloud Console

## 1. Install Dependencies

```bash
npm install                          # Frontend
cd functions && npm install && cd .. # Cloud Functions
```

## 2. Configure Environment Variables

### Frontend (.env in project root)

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Optional: Discord webhook for renewal alerts
VITE_DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-url
```

### Email Service (functions/.env)

Choose one option:

**Gmail** (for development):
```env
EMAIL_SERVICE=gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
EMAIL_FROM=your-email@gmail.com
```
Requires 2FA enabled + App Password from https://myaccount.google.com/apppasswords

**SendGrid** (for production):
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

**Custom SMTP**:
```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=username
SMTP_PASSWORD=password
EMAIL_FROM=noreply@yourdomain.com
```

### Production Environment (Firebase Config)

```bash
# Use Firebase config instead of .env for deployed functions
firebase functions:config:set \
  email.service=sendgrid \
  sendgrid.key=SG.your-key-here \
  email.from=noreply@yourdomain.com

# Verify
firebase functions:config:get
```

## 3. Deploy

```bash
# Deploy everything
firebase deploy

# Or deploy individually
firebase deploy --only hosting              # Frontend only
firebase deploy --only functions            # Cloud Functions only
firebase deploy --only firestore            # Rules + indexes only
```

First function deployment takes 3-5 minutes. Verify all 4 functions are active:
- `checkSubscriptionReminders` (scheduled)
- `onSubscriptionCreated` (Firestore trigger)
- `onSubscriptionUpdated` (Firestore trigger)
- `onUserCreated` (Auth trigger)

After deployment, check Cloud Scheduler in Google Cloud Console — verify the job exists with schedule `0 9 * * *` and status "Enabled".

## 4. Development

```bash
npm run dev                  # Start dev server with HMR
npm run build                # Production build
npm run lint                 # ESLint
npm run test                 # Vitest
firebase emulators:start     # Local Firebase emulators
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Emails not sending | Check `firebase functions:log --only checkSubscriptionReminders`. Verify credentials with `firebase functions:config:get`. For Gmail use App Password, not regular password. |
| Scheduled function not running | Enable Cloud Scheduler API + billing in Google Cloud Console. Check Cloud Scheduler job status. |
| "The query requires an index" | Run `firebase deploy --only firestore:indexes` and wait 1-5 minutes for index to build. |
| Notifications not appearing | Check Firestore indexes are "Enabled". Verify notification `sendAt` is not in the future. Check `dismissed` is `false`. |
| Functions not deploying | Verify Node.js version is 20. Check `firebase login` is authenticated. |

## Useful Commands

```bash
firebase functions:log                    # View all function logs
firebase functions:log --follow           # Stream logs in real-time
firebase functions:log --only <function>  # Logs for specific function
firebase functions:config:get             # View production config
firebase use <project-id>                 # Switch Firebase project
```

## Cost

Entirely within Firebase free tier for typical usage:
- Cloud Functions: 2M invocations/month free (typical: ~130/month)
- Firestore: 1M reads/month free
- SendGrid: 100 emails/day free
- **Expected cost: $0/month**
