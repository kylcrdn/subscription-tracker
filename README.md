# SubTracker - Subscription Management Web App

A full-stack web application for tracking personal subscriptions, visualizing spending, and receiving renewal reminders through multiple notification channels.

Built with **React 19**, **Firebase** (Auth, Firestore, Cloud Functions), and **Tailwind CSS**.

## Features

### Subscription Management
- Add, edit, and delete subscriptions with name, price, billing cycle (Monthly/Yearly), category, and due date
- Bulk-select and delete multiple subscriptions at once
- Real-time data sync via Firestore listeners — no page refresh needed
- Search subscriptions by name and filter by category

### Dashboard & Analytics
- **Stat cards** showing monthly cost, yearly cost, and active subscription count
- **Category pie chart** — click the monthly stat card to see cost breakdown by category
- **Monthly expenses trend** — click the yearly stat card to see a month-by-month spending visualization with yearly projection
- Chart modals are lazy-loaded for optimal performance

### Multi-Channel Notification System
- **In-app notifications** — bell icon with badge count, dropdown with upcoming renewals (3 days before), mark as read / dismiss
- **Email reminders** — Firebase Cloud Functions send HTML-formatted email reminders via Gmail, SendGrid, or custom SMTP
- **Discord notifications** — optional webhook integration that sends rich embeds at 7, 3, 1, and 0 days before renewal with color-coded urgency
- Scheduled daily check at 9 AM UTC catches all upcoming renewals
- Per-user configurable reminder window (1-30 days)

### Authentication & Security
- Email/password registration and login with Firebase Auth
- Password reset functionality
- Protected routes — unauthenticated users are redirected to login
- Comprehensive Firestore security rules with field validation, type checking, and user-isolated data
- No secrets in client code — all credentials stored server-side

### User Experience
- Dark theme with gradient backgrounds
- Responsive design (mobile to desktop)
- Toast notifications for all user actions (success/error feedback)
- Error boundary catches uncaught JavaScript errors and displays a fallback UI
- Floating "back to top" button on scroll
- Loading states during async operations

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router 7, Tailwind CSS 4 |
| Backend | Firebase Cloud Functions (Node.js) |
| Database | Cloud Firestore (NoSQL, real-time) |
| Authentication | Firebase Auth |
| Hosting | Firebase Hosting |
| Email | Nodemailer (Gmail / SendGrid / SMTP) |
| Notifications | Discord Webhooks |
| Build Tool | Vite 5 |
| Testing | Vitest, React Testing Library |
| Linting | ESLint 9 |

## Project Structure

```
subscription-tracker/
├── docs/                              # Project documentation
├── functions/                         # Firebase Cloud Functions
│   └── index.js                       # Scheduled + trigger functions
├── src/
│   ├── components/
│   │   ├── common/                    # Shared components
│   │   │   ├── ConfirmDialog.jsx      # Reusable confirmation modal
│   │   │   └── ErrorBoundary.jsx      # Global error catcher
│   │   └── features/
│   │       ├── auth/                  # Login & Register pages
│   │       └── subscriptions/         # Main dashboard & components
│   │           ├── HomePage.jsx               # Dashboard page
│   │           ├── SubscriptionCard.jsx       # Subscription display card
│   │           ├── SubscriptionModal.jsx      # Add/edit form modal
│   │           ├── NotificationBell.jsx       # Notification dropdown
│   │           ├── CategoryPieChartModal.jsx  # Category pie chart
│   │           └── MonthlyExpensesChartModal.jsx  # Monthly trend chart
│   ├── contexts/authContext/          # Authentication state (Context API)
│   ├── firebase/                      # Firebase init, auth, and Firestore CRUD
│   ├── hooks/                         # Custom React hooks
│   │   ├── useSubscriptions.js        # Real-time data + CRUD handlers
│   │   ├── useSubscriptionFilters.js  # Client-side search & category filter
│   │   ├── useSubscriptionStats.js    # Memoized totals & chart data
│   │   └── useScrollToTop.js          # Scroll-to-top button logic
│   └── services/
│       └── discord.js                 # Discord webhook notifications
├── firestore.rules                    # Security rules (163 lines)
├── firestore.indexes.json             # Composite indexes
├── firebase.json                      # Firebase project config
└── package.json                       # Dependencies & scripts
```

## Getting Started

### Prerequisites
- Node.js 20+
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project with Firestore, Auth, and Cloud Functions enabled

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd subscription-tracker

# Install frontend dependencies
npm install

# Install Cloud Functions dependencies
cd functions && npm install && cd ..
```

### Environment Setup

Create a `.env` file in the project root with your Firebase config:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

Optional — for Discord notifications, add:

```env
VITE_DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-url
```

### Development

```bash
npm run dev        # Start dev server with HMR
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run test       # Run tests with Vitest
```

### Deployment

```bash
# Deploy everything (hosting + functions + rules + indexes)
firebase deploy

# Deploy only the frontend
firebase deploy --only hosting

# Deploy only Cloud Functions
firebase deploy --only functions

# Deploy only Firestore rules and indexes
firebase deploy --only firestore
```

## Architecture

### Data Flow

```
User Action (add/edit/delete subscription)
        |
        v
  Client (React) ──writes──> Firestore
        |                        |
        |                  Cloud Function triggers
        |                  (onSubscriptionCreated/Updated)
        |                        |
        v                        v
  Real-time listener      Generate notification
  (onSnapshot)            in Firestore
        |                        |
        v                        v
  UI updates instantly    NotificationBell receives
                          update via onSnapshot
```

### Cloud Functions

| Function | Trigger | Purpose |
|----------|---------|---------|
| `checkSubscriptionReminders` | Scheduled (daily 9 AM UTC) | Scans all users, creates notifications, sends emails |
| `onSubscriptionCreated` | Firestore document create | Generates initial notification |
| `onSubscriptionUpdated` | Firestore document update | Deletes old notifications, creates new ones |
| `onUserCreated` | Firebase Auth trigger | Stores user email in Firestore |

### Custom Hooks

| Hook | Responsibility |
|------|---------------|
| `useSubscriptions` | Real-time Firestore listener + CRUD handlers + Discord webhook checks |
| `useSubscriptionFilters` | Client-side search by name and category filter (memoized) |
| `useSubscriptionStats` | Computed monthly/yearly totals and chart data (memoized) |
| `useScrollToTop` | Floating "back to top" button visibility and scroll logic |

### Firestore Data Model

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

## Documentation

| Document | Description |
|----------|-------------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture, data flow, notification channels, security rules, feature matrix |
| [docs/SETUP_AND_DEPLOYMENT.md](docs/SETUP_AND_DEPLOYMENT.md) | Installation, environment config, deployment, troubleshooting |

## Key Design Decisions

- **Feature-based folder structure** — components, hooks, and services organized by feature, not file type
- **Custom hooks for separation of concerns** — HomePage delegates all data logic to hooks, keeping the component focused on UI
- **Lazy-loaded chart modals** — `React.lazy` + `Suspense` keeps the initial bundle small
- **Real-time over polling** — Firestore `onSnapshot` listeners provide instant updates across devices
- **Graceful error handling** — notification failures never block subscription operations; the ErrorBoundary catches uncaught errors app-wide
- **Discord deduplication via localStorage** — prevents duplicate webhook messages without server-side state
- **Comprehensive security rules** — field-level validation, type checking, and immutable fields enforced at the database level

## License

This project was built as a final project for educational purposes.
