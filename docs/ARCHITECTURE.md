# Architecture

## Data Flow

```
User signs up
    → AuthContext creates profile in Firestore (email, preferences)
    → Cloud Function onUserCreated validates data

User adds/edits subscription
    → Client writes to Firestore
    → Cloud Function onSubscriptionCreated/Updated triggers
    → Generates notification document (sendAt = renewal - 3 days)
    → useSubscriptions hook receives real-time update via onSnapshot
    → checkAndNotifyDiscord() sends Discord webhook if within threshold

Daily at 9 AM UTC
    → Cloud Scheduler triggers checkSubscriptionReminders
    → Scans all users and subscriptions
    → Calculates next renewal dates dynamically
    → Creates in-app notifications + sends email reminders

User opens app
    → NotificationBell subscribes to notifications via onSnapshot
    → Query: dismissed == false AND sendAt <= today
    → Bell badge shows unread count, dropdown shows details
    → User can mark as read or dismiss
```

## Cloud Functions

| Function | Trigger | Purpose |
|----------|---------|---------|
| `checkSubscriptionReminders` | Scheduled (daily 9 AM UTC) | Scans all users, creates notifications, sends emails |
| `onSubscriptionCreated` | Firestore document create | Generates initial notification for new subscription |
| `onSubscriptionUpdated` | Firestore document update | Deletes old notifications, creates updated ones |
| `onUserCreated` | Firebase Auth trigger | Stores user email and default preferences in Firestore |

## Custom Hooks

HomePage delegates all data logic to hooks, keeping the component focused on rendering.

| Hook | Responsibility |
|------|---------------|
| `useSubscriptions` | Real-time Firestore listener, CRUD handlers (add/update/delete/bulk-delete), Discord webhook checks |
| `useSubscriptionFilters` | Client-side search by name and category filtering (memoized) |
| `useSubscriptionStats` | Monthly/yearly totals, category breakdown for pie chart, monthly expenses for trend chart (memoized) |
| `useScrollToTop` | Floating "back to top" button visibility and scroll logic |

## Notification Channels

### In-App (Firestore + Real-time Listener)
- Notifications stored in `users/{userId}/notifications/` subcollection
- `NotificationBell` component subscribes via `onSnapshot`
- Composite index on `[dismissed ASC, sendAt ASC]` (equality filter before range filter)
- User can mark as read or dismiss; badge count updates in real-time

### Email (Cloud Functions + Nodemailer)
- Scheduled function sends HTML-formatted emails via Gmail, SendGrid, or custom SMTP
- Respects per-user `emailNotifications` and `reminderDays` preferences
- Email credentials stored in environment variables, never in client code

### Discord (Client-Side Webhooks)
- `services/discord.js` sends rich embed messages at 7, 3, 1, and 0 days before renewal
- Color-coded urgency: red (today), orange (tomorrow), blue (upcoming)
- Deduplication via `localStorage` keyed by `{subscriptionId}_{daysUntil}_{renewalDate}`
- Only active when `VITE_DISCORD_WEBHOOK_URL` is configured

## Firestore Data Model

```
users/{userId}
  ├── email, displayName, photoURL
  ├── emailNotifications: boolean
  ├── reminderDays: number (1-30)
  ├── createdAt, updatedAt
  │
  ├── subscriptions/{subscriptionId}
  │     ├── name, icon, price, dueDate
  │     ├── billing ("Monthly" | "Yearly")
  │     ├── category
  │     └── createdAt, updatedAt
  │
  └── notifications/{notificationId}
        ├── subscriptionId, subscriptionName
        ├── renewalDate, sendAt
        ├── notifyDaysBefore
        ├── read, dismissed
        └── createdAt, readAt, dismissedAt
```

## Security Rules

The `firestore.rules` file (163 lines) enforces:

- **User isolation** — users can only read/write their own documents (`request.auth.uid == userId`)
- **Field validation** — required fields, allowed fields, type checking on every create/update
- **Type constraints** — price 0-99999, name max 100 chars, reminderDays 1-30, billing must be "Monthly" or "Yearly"
- **Immutable fields** — `createdAt` cannot be changed after document creation
- **Notification updates** — only `read`, `readAt`, `dismissed`, `dismissedAt` can be modified after creation
- **New notifications** — must start as `read: false, dismissed: false`
- **Default deny** — any collection not explicitly matched is denied

## Error Handling

- **ErrorBoundary** (class component) wraps the entire app, catches uncaught JS errors, shows fallback UI with retry
- **Notification failures** never block subscription operations — wrapped in try/catch with `console.warn`
- **Email failures** don't stop batch processing — each user is processed independently
- **Discord failures** are caught per-subscription and logged without blocking
- **Duplicate prevention** — `notificationExists()` checks before creating; daily function is idempotent
- **Orphan cleanup** — deleting a subscription removes its associated notifications

## Performance

- **Lazy-loaded chart modals** — `CategoryPieChartModal` and `MonthlyExpensesChartModal` use `React.lazy` + `Suspense`
- **Memoized computations** — all stats and filter results use `useMemo`, recalculate only when subscriptions change
- **Server-side filtering** — Firestore queries use composite indexes, only relevant data is transferred
- **Batched operations** — bulk deletes use `Promise.all` for concurrent Firestore writes

## Feature Matrix

| Feature | Client | Server | Status |
|---------|--------|--------|--------|
| Auth (register, login, password reset) | x | | Complete |
| Subscription CRUD + bulk delete | x | x | In Sync |
| In-app notifications (bell icon) | x | x | In Sync |
| Email reminders | | x | Complete |
| Discord webhook alerts | x | | Complete |
| Daily scheduled check | | x | Complete |
| Category pie chart | x | | Complete |
| Monthly expenses chart | x | | Complete |
| Search + category filter | x | | Complete |
| Error boundary | x | | Complete |
| Lazy-loaded chart modals | x | | Complete |
| Firestore security rules | | x | Complete |
