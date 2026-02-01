# Subscription Tracker - Notification System Guide

A comprehensive guide to understanding and setting up the in-app notification system.

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Firebase Setup](#firebase-setup)
4. [Code Implementation](#code-implementation)
5. [How It Works](#how-it-works)
6. [Troubleshooting](#troubleshooting)

---

## System Overview

The notification system alerts users 3 days before their subscriptions renew. It consists of:

- **Firestore Database**: Stores notifications in user-specific subcollections
- **Real-time Listeners**: Updates UI instantly when notifications change
- **Bell Icon Component**: Displays notification count and dropdown
- **Composite Indexes**: Enables fast queries on notification data

### Key Features
- ✅ Real-time updates (no page refresh needed)
- ✅ Automatic notification generation when subscriptions are added/updated
- ✅ 3-day advance warning before renewals
- ✅ Dismiss notifications individually
- ✅ Accurate renewal date calculations for monthly/yearly subscriptions

---

## Architecture

### Data Flow

```
User adds/updates subscription
         ↓
generateNotification() calculates next renewal date
         ↓
Creates notification document in Firestore
         ↓
Real-time listener (subscribeToNotifications) detects new notification
         ↓
NotificationBell component receives update
         ↓
Bell icon shows red badge with count
         ↓
User clicks bell → sees notification details
         ↓
User dismisses → notification marked as dismissed in Firestore
```

### Database Structure

```
users/
  {userId}/
    subscriptions/
      {subscriptionId}/
        - name: "Netflix"
        - price: 12.99
        - billing: "Monthly"
        - dueDate: "2026-01-01"
        - category: "Entertainment"

    notifications/
      {notificationId}/
        - subscriptionId: "abc123"
        - subscriptionName: "Netflix"
        - dueDate: "2026-01-01"
        - billing: "Monthly"
        - renewalDate: "2026-02-01T00:00:00.000Z"
        - sendAt: "2026-01-29T00:00:00.000Z"  # 3 days before renewal
        - notifyDaysBefore: 3
        - read: false
        - dismissed: false
        - createdAt: "2026-01-15T10:30:00.000Z"
```

---

## Firebase Setup

### Step 1: Firestore Security Rules

**File:** `firestore.rules`

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Users collection
    match /users/{userId} {

      // Allow users to read/write their own user doc
      allow read, write: if request.auth != null
                          && request.auth.uid == userId;

      // Subscriptions subcollection
      match /subscriptions/{subscriptionId} {
        allow read, write: if request.auth != null
                            && request.auth.uid == userId;
      }

      // Notifications subcollection
      match /notifications/{notificationId} {
        allow read, write: if request.auth != null
                            && request.auth.uid == userId;
      }
    }
  }
}
```

**What it does:**
- Users can only access their own data
- Each user's notifications are private
- Authenticated users can create, read, update, and delete their own notifications

### Step 2: Firestore Composite Index

**File:** `firestore.indexes.json`

```json
{
  "indexes": [
    {
      "collectionGroup": "notifications",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "dismissed",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "sendAt",
          "order": "ASCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

**Why we need this index:**

The notification query filters by two fields:
```javascript
where("dismissed", "==", false)  // Equality filter
where("sendAt", "<=", today)     // Range filter
```

**Important:** Field order matters!
1. **Equality filters** (`dismissed`) must come FIRST
2. **Range filters** (`sendAt`) must come SECOND

This specific order is required by Firestore's query engine.

### Step 3: Deploy to Firebase

```bash
# 1. Authenticate (opens browser)
npx firebase login

# 2. Deploy security rules and indexes
npx firebase deploy --only firestore

# 3. Wait for indexes to build (1-5 minutes)
# Check status: Firebase Console → Firestore → Indexes
```

**Verify deployment:**
- Go to [Firebase Console](https://console.firebase.google.com)
- Navigate to Firestore → Indexes
- Confirm status shows **"Enabled"** (green checkmark)

---

## Code Implementation

### Component 1: Notification Generator

**File:** `src/firebase/firestore.js`

```javascript
/**
 * Generate notification for a subscription
 * Called when subscription is added or updated
 */
export const generateNotification = async (
  userId,
  subscription,
  notifyDaysBefore = 3
) => {
  // Step 1: Calculate next renewal date
  const renewalDate = calculateNextRenewal(
    subscription.dueDate,
    subscription.billing
  );

  // Step 2: Calculate when to show notification (3 days before renewal)
  const sendAt = new Date(renewalDate);
  sendAt.setDate(sendAt.getDate() - notifyDaysBefore);

  // Step 3: Create notification document
  const notificationsRef = getUserNotificationsRef(userId);
  await addDoc(notificationsRef, {
    subscriptionId: subscription.id,
    subscriptionName: subscription.name,
    dueDate: subscription.dueDate,
    billing: subscription.billing,
    renewalDate: renewalDate.toISOString(),
    sendAt: sendAt.toISOString(),
    notifyDaysBefore,
    read: false,
    dismissed: false,
    createdAt: new Date().toISOString(),
  });
};
```

**How it works:**
1. Takes subscription data (due date, billing cycle)
2. Calculates when subscription will renew next
3. Subtracts 3 days to get notification send date
4. Creates notification document in Firestore

**Example:**
- Subscription starts: January 1, 2026 (Monthly)
- Next renewal: February 1, 2026
- Notification `sendAt`: January 29, 2026 (3 days before)
- Notification appears on: January 29 or later

### Component 2: Real-time Notification Listener

**File:** `src/firebase/firestore.js`

```javascript
/**
 * Subscribe to real-time notifications for a user
 * Returns unsubscribe function to stop listening
 */
export const subscribeToNotifications = (userId, onSuccess) => {
  const notificationsRef = getUserNotificationsRef(userId);
  const today = new Date().toISOString();

  // Query: Get non-dismissed notifications that should show today
  const q = query(
    notificationsRef,
    where("dismissed", "==", false),  // Not dismissed
    where("sendAt", "<=", today)      // Send date is today or earlier
  );

  // Listen for changes in real-time
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort by date (newest first) in JavaScript
    notifications.sort((a, b) => new Date(b.sendAt) - new Date(a.sendAt));

    // Send to callback
    onSuccess(notifications);
  });
};
```

**How it works:**
1. Creates a query for notifications where:
   - `dismissed` is false (not dismissed)
   - `sendAt` is less than or equal to today
2. Sets up real-time listener using `onSnapshot`
3. Whenever data changes in Firestore, callback fires
4. Sorts notifications by date
5. Passes notifications array to component

**Real-time updates:**
- New notification created → callback fires
- Notification dismissed → callback fires
- Works automatically, no polling needed

### Component 3: Bell Icon UI

**File:** `src/components/home/NotificationBell.jsx`

```javascript
export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  // Setup real-time listener on mount
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToNotifications(userId, (notifs) => {
      setNotifications(notifs);
      setLoading(false);
    });

    // Cleanup: stop listening when component unmounts
    return () => unsubscribe();
  }, [userId]);

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button onClick={() => setShowDropdown(!showDropdown)}>
        <BellIcon />
        {/* Red Badge with Count */}
        {unreadCount > 0 && (
          <span className="badge">{unreadCount}</span>
        )}
      </button>

      {/* Dropdown with Notifications */}
      {showDropdown && (
        <div className="dropdown">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onDismiss={handleDismiss}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

**How it works:**
1. **On mount:** Sets up real-time listener
2. **On update:** Receives new notifications array
3. **Display:** Shows count badge if unread > 0
4. **Dropdown:** Shows notification details on click
5. **Cleanup:** Unsubscribes when component unmounts

### Component 4: Integration with Subscription Management

**File:** `src/firebase/firestore.js`

```javascript
/**
 * Add a new subscription
 * Automatically generates notification
 */
export const addSubscription = async (userId, subscriptionData) => {
  const subscriptionsRef = getUserSubscriptionsRef(userId);

  // Create subscription document
  const docRef = await addDoc(subscriptionsRef, {
    ...subscriptionData,
    createdAt: new Date().toISOString(),
  });

  // Generate notification (don't fail if this errors)
  try {
    await generateNotification(userId, {
      ...subscriptionData,
      id: docRef.id,
    });
  } catch (error) {
    console.warn("Could not generate notification:", error);
    // Don't throw - subscription creation succeeded
  }

  return docRef.id;
};
```

**Automatic notification generation:**
- When subscription is **added** → `generateNotification()` called
- When subscription is **updated** → Old notifications deleted, new one created
- When subscription is **deleted** → Associated notifications deleted

---

## How It Works

### Step-by-Step Flow

#### 1. User Adds Subscription

```javascript
// User fills form and clicks "Save"
await addSubscription(userId, {
  name: "Netflix",
  price: 12.99,
  billing: "Monthly",
  dueDate: "2026-01-01",  // Start date
  category: "Entertainment"
});
```

#### 2. System Calculates Renewal Date

```javascript
// calculateNextRenewal() logic
const startDate = new Date("2026-01-01");  // Due date
const today = new Date("2026-01-15");      // Current date

// For Monthly billing:
let nextRenewal = new Date(startDate);
nextRenewal.setMonth(nextRenewal.getMonth() + 1);  // Feb 1, 2026

// Keep adding months until we're in the future
while (nextRenewal <= today) {
  nextRenewal.setMonth(nextRenewal.getMonth() + 1);
}

// Result: February 1, 2026
```

#### 3. System Creates Notification

```javascript
// generateNotification() creates document
{
  subscriptionId: "abc123",
  subscriptionName: "Netflix",
  renewalDate: "2026-02-01T00:00:00.000Z",
  sendAt: "2026-01-29T00:00:00.000Z",  // 3 days before Feb 1
  dismissed: false,
  read: false
}
```

#### 4. Real-time Listener Activates

```javascript
// On January 29, 2026:
const today = "2026-01-29T10:00:00.000Z";

// Query finds notification:
where("dismissed", "==", false)  // ✓ false
where("sendAt", "<=", today)     // ✓ Jan 29 <= Jan 29

// Listener fires → NotificationBell receives update
```

#### 5. UI Updates Automatically

```javascript
// NotificationBell component:
setNotifications([{
  id: "notif123",
  subscriptionName: "Netflix",
  sendAt: "2026-01-29T00:00:00.000Z",
  dismissed: false,
  read: false
}]);

// Badge appears:
unreadCount = 1  // One unread notification
```

#### 6. User Sees Notification

```
┌─────────────────────────────┐
│  SubTracker          🔔 [1] │
└─────────────────────────────┘
              ↓ (clicks bell)
┌─────────────────────────────┐
│ Notifications               │
├─────────────────────────────┤
│ Netflix               [X]   │
│ Renews in 3 days           │
│ Feb 1, 2026                │
└─────────────────────────────┘
```

#### 7. User Dismisses Notification

```javascript
// User clicks [X] button
await dismissNotification(userId, "notif123");

// Firestore updates:
{
  dismissed: true,
  dismissedAt: "2026-01-29T10:05:00.000Z"
}

// Real-time listener fires with empty array
// Badge disappears automatically
```

---

## Troubleshooting

### Issue 1: "The query requires an index" Error

**Symptoms:**
```
FirebaseError: [code=failed-precondition]:
The query requires an index
```

**Cause:** Firestore composite index not deployed or not finished building

**Solution:**
```bash
# 1. Deploy indexes
npx firebase deploy --only firestore:indexes

# 2. Check Firebase Console → Firestore → Indexes
# Wait until status shows "Enabled" (1-5 minutes)

# 3. Refresh your app
```

**Important:** Field order matters!
```json
// ✓ CORRECT (equality filter first)
{
  "fields": [
    { "fieldPath": "dismissed", "order": "ASCENDING" },
    { "fieldPath": "sendAt", "order": "ASCENDING" }
  ]
}

// ✗ WRONG (range filter first)
{
  "fields": [
    { "fieldPath": "sendAt", "order": "ASCENDING" },
    { "fieldPath": "dismissed", "order": "ASCENDING" }
  ]
}
```

### Issue 2: Bell Icon Shows No Badge

**Symptoms:**
- Notification exists in Firestore
- Bell icon shows no red badge
- Console shows: "Notifications received: 0"

**Possible Causes:**

**A. Index still building**
```bash
# Check index status
npx firebase firestore:indexes

# Look for "Enabled" status
```

**B. Notification `sendAt` is in the future**
```javascript
// Check notification data:
sendAt: "2026-02-05T00:00:00.000Z"
today:  "2026-02-01T10:00:00.000Z"

// sendAt > today → Won't show yet
```

**C. Notification is dismissed**
```javascript
// Check notification data:
dismissed: true  // ← Won't show
```

**Solutions:**
1. Wait for index to build
2. Delete and re-add subscription (regenerates notification)
3. Check Firestore data directly in Firebase Console

### Issue 3: Wrong Renewal Date Calculation

**Symptoms:**
- Notification shows wrong "days until renewal"
- Renewal date doesn't match expected date

**Cause:** Incorrect due date or billing cycle

**Example:**
```javascript
// User enters:
dueDate: "2026-01-15"
billing: "Monthly"

// Expected renewal: February 15, 2026
// Actual renewal: February 15, 2026 ✓

// But if entered as:
dueDate: "2025-01-15"  // ← Wrong year
// Actual renewal: Will keep adding months until future
```

**Solution:**
- Verify due date is correct
- Due date = first payment date, not signup date
- For monthly: Renewal is same day next month
- For yearly: Renewal is same date next year

### Issue 4: Notifications Not Auto-Generated

**Symptoms:**
- Add subscription
- No notification created in Firestore

**Cause:** Error in `generateNotification()` function

**Debug:**
```javascript
// Check browser console for errors
// Look for:
console.warn("Could not generate notification:", error);

// Common causes:
// - Firestore rules blocking writes
// - Invalid date format
// - Missing required fields
```

**Solution:**
```javascript
// Verify subscription data has all required fields:
{
  id: "abc123",        // ✓ Required
  name: "Netflix",     // ✓ Required
  dueDate: "2026-01-01", // ✓ Required
  billing: "Monthly"   // ✓ Required
}
```

### Issue 5: Duplicate Notifications

**Symptoms:**
- Bell shows count of 2 for same subscription
- Dropdown shows duplicate entries

**Cause:** Old notifications not deleted when subscription updated

**Solution:**
```javascript
// Update subscription function includes:
await deleteNotificationsBySubscription(userId, subscriptionId);
await generateNotification(userId, updatedSubscription);

// If duplicates exist, manually delete in Firebase Console:
// Firestore → users/{userId}/notifications
// Delete old notification documents
```

---

## Best Practices

### 1. Testing Notifications

**Quick Test Setup:**
```javascript
// To test "Renews tomorrow":
const today = new Date("2026-02-01");
const dueDate = new Date("2026-01-02");  // 1 month ago + 1 day

// Add subscription with this due date
// Notification will show "Renews tomorrow"
```

### 2. Production Considerations

**Set realistic notification windows:**
```javascript
// Current: 3 days before renewal
const notifyDaysBefore = 3;

// Could be configurable:
const userSettings = await getUserProfile(userId);
const notifyDaysBefore = userSettings.reminderDays || 3;
```

**Handle edge cases:**
```javascript
// What if renewal date is in the past?
const renewalDate = calculateNextRenewal(dueDate, billing);
const today = new Date();

if (renewalDate < today) {
  // Subscription already renewed
  // Show immediate notification or skip
}
```

### 3. Performance Optimization

**Index only active notifications:**
```javascript
// Instead of storing all historical notifications
// Clean up old dismissed notifications periodically

// Option 1: Delete on dismiss
await deleteDoc(notificationRef);

// Option 2: Scheduled cleanup (requires Cloud Functions)
// Delete notifications dismissed > 30 days ago
```

**Limit query results:**
```javascript
// Add limit to query
const q = query(
  notificationsRef,
  where("dismissed", "==", false),
  where("sendAt", "<=", today),
  limit(10)  // Only fetch 10 most recent
);
```

---

## Summary

### What We Built

1. **Database Structure**
   - Notifications stored in user-specific subcollections
   - Composite index enables fast queries
   - Security rules protect user data

2. **Notification Generation**
   - Automatic when subscriptions are added/updated
   - Calculates accurate renewal dates
   - 3-day advance warning

3. **Real-time UI Updates**
   - Bell icon shows notification count
   - Dropdown shows notification details
   - Updates instantly when data changes

4. **User Interactions**
   - Click bell to see notifications
   - Dismiss individual notifications
   - Badge count updates automatically

### Key Learnings

- **Firestore Composite Indexes**: Field order matters (equality before range)
- **Real-time Listeners**: Use `onSnapshot` for live updates
- **Security Rules**: Match structure protects nested collections
- **Date Calculations**: Always normalize to UTC for consistency
- **Error Handling**: Non-critical errors (notifications) shouldn't block critical operations (subscriptions)

---

## Resources

- [Firestore Composite Indexes](https://firebase.google.com/docs/firestore/query-data/index-overview)
- [Real-time Updates with onSnapshot](https://firebase.google.com/docs/firestore/query-data/listen)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Date Calculations in JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)

---

## Need Help?

If you encounter issues:
1. Check browser console for errors
2. Verify Firestore indexes are "Enabled" in Firebase Console
3. Check Firestore data directly to see if notifications exist
4. Review this troubleshooting guide

Happy coding! 🔔
