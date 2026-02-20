# Architecture

## Data Flow

```
User signs up
    → AuthContext creates profile in Firestore (email, preferences)

User adds/edits subscription
    → Client writes to Firestore
    → Client generates notification document (sendAt = renewal - 7 days)
    → useSubscriptions hook receives real-time update via onSnapshot
    → checkAndNotifyDiscord() sends Discord webhook if within threshold

User opens app
    → NotificationBell subscribes to notifications via onSnapshot
    → Query: dismissed == false AND sendAt <= today
    → Bell badge shows unread count, dropdown shows details
    → User can mark as read or dismiss
```

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
- Generated client-side in `firestore.js` when subscriptions are added or updated
- `NotificationBell` component subscribes via `onSnapshot`
- Composite index on `[dismissed ASC, sendAt ASC]` required for the equality + range query (`where dismissed == false` + `where sendAt <= today`); `orderBy` is intentionally omitted from the Firestore query — results are sorted client-side by `sendAt` descending
- User can mark as read or dismiss; badge count updates in real-time

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
        ├── dueDate, billing
        ├── renewalDate, sendAt
        ├── notifyDaysBefore
        ├── read, dismissed
        └── createdAt, readAt, dismissedAt
```

## Security Rules

The `firestore.rules` file enforces:

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
- **Discord failures** are caught per-subscription and logged without blocking
- **Orphan cleanup** — deleting a subscription removes its associated notifications

## Performance

- **Lazy-loaded chart modals** — `CategoryPieChartModal`, `MonthlyExpensesChartModal`, and `SubscriptionOverviewModal` use `React.lazy` + `Suspense`
- **Memoized computations** — all stats and filter results use `useMemo`, recalculate only when subscriptions change
- **Firestore composite indexes** — notification queries use indexed fields for efficient reads
- **Batched operations** — bulk deletes use `Promise.all` for concurrent Firestore writes
- **Pure SVG charts** — no charting library dependency keeps the bundle small

## Feature Matrix

| Feature | Client | Status |
|---------|--------|--------|
| Auth (register, login, Google OAuth, password reset) | x | Complete |
| Subscription CRUD + bulk delete | x | Complete |
| In-app notifications (bell icon) | x | Complete |
| Discord webhook alerts | x | Complete |
| Category pie chart | x | Complete |
| Monthly expenses chart | x | Complete |
| Subscription overview stats | x | Complete |
| Search + category filter | x | Complete |
| Dark / light theme | x | Complete |
| Landing page | x | Complete |
| Error boundary | x | Complete |
| Lazy-loaded chart modals | x | Complete |
| Firestore security rules | x | Complete |
