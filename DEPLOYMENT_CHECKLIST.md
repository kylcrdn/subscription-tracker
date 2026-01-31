# Firebase Cloud Functions Deployment Checklist

Use this checklist to ensure your Cloud Functions are properly configured and deployed.

## Pre-Deployment

### 1. Install Dependencies
- [ ] Navigate to functions directory: `cd functions`
- [ ] Install packages: `npm install`
- [ ] Verify no errors in installation

### 2. Email Service Configuration

Choose ONE option:

#### Option A: Gmail (Development/Testing)
- [ ] Enable 2-Factor Authentication on Gmail account
- [ ] Generate App Password at https://myaccount.google.com/apppasswords
- [ ] Create `functions/.env` file
- [ ] Add the following to `.env`:
  ```env
  EMAIL_SERVICE=gmail
  GMAIL_USER=your-email@gmail.com
  GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
  EMAIL_FROM=your-email@gmail.com
  ```
- [ ] Test credentials are correct

#### Option B: SendGrid (Production)
- [ ] Sign up for SendGrid account
- [ ] Create API key with "Mail Send" permission
- [ ] Create `functions/.env` file
- [ ] Add the following to `.env`:
  ```env
  EMAIL_SERVICE=sendgrid
  SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx
  EMAIL_FROM=noreply@yourdomain.com
  ```
- [ ] Verify SendGrid API key is active

#### Option C: Custom SMTP
- [ ] Get SMTP credentials from your email provider
- [ ] Create `functions/.env` file
- [ ] Add SMTP configuration to `.env`
- [ ] Test SMTP connection

### 3. Firebase Project Setup
- [ ] Firebase CLI installed: `npm install -g firebase-tools`
- [ ] Logged in to Firebase: `firebase login`
- [ ] Project initialized: `firebase init` (if not already done)
- [ ] Correct project selected: `firebase use --add`

### 4. Enable Required APIs
- [ ] Open Google Cloud Console
- [ ] Select your Firebase project
- [ ] Enable **Cloud Scheduler API**
- [ ] Enable **Cloud Functions API** (usually auto-enabled)
- [ ] Verify **billing is enabled** (required for scheduled functions)

### 5. Firestore Security Rules
- [ ] Update `firestore.rules` to allow function access to notifications
- [ ] Test rules in Firestore Rules Playground
- [ ] Deploy rules: `firebase deploy --only firestore:rules`

### 6. Environment Variables (Production)

For local development, `.env` file is sufficient.
For production, set Firebase environment config:

**For Gmail:**
```bash
firebase functions:config:set \
  email.service=gmail \
  email.user=your-email@gmail.com \
  email.password=your-app-password \
  email.from=your-email@gmail.com
```
- [ ] Set email.service
- [ ] Set email.user
- [ ] Set email.password
- [ ] Set email.from
- [ ] Verify config: `firebase functions:config:get`

**For SendGrid:**
```bash
firebase functions:config:set \
  email.service=sendgrid \
  sendgrid.key=your-api-key \
  email.from=noreply@yourdomain.com
```
- [ ] Set email.service
- [ ] Set sendgrid.key
- [ ] Set email.from
- [ ] Verify config: `firebase functions:config:get`

## Deployment

### 7. Deploy Functions
- [ ] From project root, run: `firebase deploy --only functions`
- [ ] Wait for deployment to complete (3-5 minutes for first deploy)
- [ ] Verify no deployment errors
- [ ] Check all 4 functions deployed successfully:
  - [ ] `checkSubscriptionReminders`
  - [ ] `onSubscriptionCreated`
  - [ ] `onSubscriptionUpdated`
  - [ ] `onUserCreated`

### 8. Verify Cloud Scheduler
- [ ] Open Cloud Scheduler in Google Cloud Console
- [ ] Verify scheduled job `checkSubscriptionReminders` exists
- [ ] Check schedule: `0 9 * * *` (9 AM UTC daily)
- [ ] Status should be "Enabled"

## Post-Deployment Testing

### 9. Test User Profile Creation
- [ ] Register a new test user
- [ ] Check Firestore Console → `users` collection
- [ ] Verify user document contains:
  - [ ] `email` field
  - [ ] `emailNotifications: true`
  - [ ] `reminderDays: 3`
  - [ ] `createdAt` timestamp

### 10. Test Subscription Trigger
- [ ] Add a subscription with due date 3 days from today
- [ ] Check Firestore Console → `users/{userId}/notifications`
- [ ] Verify notification was created with:
  - [ ] Correct `subscriptionId`
  - [ ] Correct `renewalDate`
  - [ ] Correct `sendAt` date (today's date)
  - [ ] `emailSent: false` (will be true after scheduled function runs)

### 11. Test Scheduled Function (Manual)
- [ ] Open Firebase Console → Functions
- [ ] Click on `checkSubscriptionReminders`
- [ ] Go to "Logs" tab
- [ ] Click "Test function" or wait for next scheduled run (9 AM UTC)
- [ ] Verify function executes without errors
- [ ] Check logs show:
  - [ ] "Starting scheduled subscription reminder check..."
  - [ ] Users checked count
  - [ ] Subscriptions checked count
  - [ ] Notifications created count
  - [ ] Emails sent count

### 12. Test Email Delivery
- [ ] Use your own email as test user
- [ ] Add subscription with renewal in 3 days
- [ ] Wait for scheduled function or trigger manually
- [ ] Check inbox for reminder email
- [ ] Verify email contains:
  - [ ] Correct subscription name
  - [ ] Correct renewal date
  - [ ] Correct amount
  - [ ] Proper formatting (HTML email)

### 13. Test In-App Notifications
- [ ] Open the web app
- [ ] Sign in as test user
- [ ] Check notification bell icon
- [ ] Verify:
  - [ ] Badge shows unread count
  - [ ] Notification appears in dropdown
  - [ ] Shows correct "Renews in X days" message
  - [ ] Dismiss button works

### 14. Test Subscription Update Trigger
- [ ] Edit an existing subscription
- [ ] Change the due date or amount
- [ ] Check Firestore notifications collection
- [ ] Verify:
  - [ ] Old notification was deleted
  - [ ] New notification created with updated data

## Monitoring Setup

### 15. Configure Alerts (Optional but Recommended)
- [ ] Open Google Cloud Console → Monitoring
- [ ] Create alert for function errors
- [ ] Create alert for high execution time
- [ ] Set up email notifications for alerts

### 16. Set Up Log Exports (Optional)
- [ ] Configure log export to BigQuery for analysis
- [ ] Set log retention period
- [ ] Create dashboard for function metrics

## Validation

### 17. Final Checks
- [ ] All 4 functions deployed and active
- [ ] Cloud Scheduler job running daily
- [ ] Test user receives email reminders
- [ ] In-app notifications appear correctly
- [ ] No errors in function logs
- [ ] Firestore collections populated correctly:
  - [ ] `users` collection has email field
  - [ ] `subscriptions` subcollection working
  - [ ] `notifications` subcollection working

### 18. Documentation
- [ ] Team aware of new features
- [ ] Deployment process documented
- [ ] Environment variables documented
- [ ] Monitoring dashboards shared

## Troubleshooting

If something doesn't work:

1. **Check Function Logs:**
   ```bash
   firebase functions:log --follow
   ```

2. **Verify Environment Config:**
   ```bash
   firebase functions:config:get
   ```

3. **Check Cloud Scheduler:**
   - Google Cloud Console → Cloud Scheduler
   - Verify job exists and is enabled

4. **Test Email Service:**
   - Send test email from functions shell
   - Verify SMTP credentials

5. **Check Firestore Indexes:**
   - Firebase Console → Firestore → Indexes
   - Ensure composite index exists for notifications query

## Rollback Plan

If deployment fails or causes issues:

1. **Rollback Functions:**
   ```bash
   firebase functions:delete checkSubscriptionReminders
   firebase functions:delete onSubscriptionCreated
   firebase functions:delete onSubscriptionUpdated
   firebase functions:delete onUserCreated
   ```

2. **Redeploy Previous Version:**
   ```bash
   git checkout <previous-commit>
   firebase deploy --only functions
   ```

3. **Disable Scheduled Function:**
   - Google Cloud Console → Cloud Scheduler
   - Pause the scheduled job

## Success Criteria

✅ All functions deployed without errors
✅ Cloud Scheduler running daily at 9 AM UTC
✅ Test emails delivered successfully
✅ In-app notifications appear correctly
✅ User profiles created automatically on signup
✅ Notifications sync when subscriptions change
✅ Function logs show no errors
✅ Cost within expected range ($0 for free tier)

## Post-Launch Monitoring

### Week 1
- [ ] Monitor function execution daily
- [ ] Check error rates
- [ ] Verify email delivery rates
- [ ] Review user feedback

### Month 1
- [ ] Analyze function costs
- [ ] Review email open rates
- [ ] Check notification engagement
- [ ] Optimize if needed

---

**Deployment Date:** _______________
**Deployed By:** _______________
**Version:** _______________
**Notes:**
