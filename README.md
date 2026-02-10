# SubTracker - Subscription Management Web App

A web application for tracking personal subscriptions, visualizing spending, and receiving renewal reminders through in-app and Discord notifications.

Built with **React 19**, **Firebase** (Auth, Firestore, Hosting), and **Tailwind CSS 4**.

## Features

### Subscription Management
- Add, edit, and delete subscriptions with name, price, billing cycle (Monthly/Yearly), category, and start date
- Icon autocomplete with 47 popular services — fetches logos from Clearbit / Google Favicons
- Bulk-select and delete multiple subscriptions at once
- Real-time data sync via Firestore listeners — no page refresh needed
- Search subscriptions by name and filter by category

### Dashboard & Analytics
- **Stat cards** showing monthly cost, yearly cost, and active subscription count
- **Subscription overview** — click the active count card to see billing split, cost comparison, top category, and upcoming renewals
- **Category pie chart** — click the monthly stat card to see cost breakdown by category (pure SVG)
- **Monthly expenses trend** — click the yearly stat card to see a month-by-month spending visualization with yearly projection (pure SVG)
- Chart modals are lazy-loaded for optimal performance

### Notification System
- **In-app notifications** — bell icon with badge count, dropdown with upcoming renewals (7 days before), mark as read / dismiss
- **Discord notifications** — optional webhook integration that sends rich embeds at 7, 3, 1, and 0 days before renewal with color-coded urgency
- Notifications auto-generated client-side when subscriptions are added or updated

### Authentication & Security
- Email/password registration and login with Firebase Auth
- Google OAuth sign-in
- Password reset functionality
- Protected routes — unauthenticated users are redirected to login
- Comprehensive Firestore security rules with field validation, type checking, and user-isolated data

### User Experience
- Dark / light theme toggle with CSS custom properties
- Responsive design (mobile to desktop)
- Landing page for unauthenticated visitors
- Toast notifications for all user actions (success/error feedback)
- Error boundary catches uncaught JavaScript errors and displays a fallback UI
- Floating "back to top" button on scroll

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router 7, Tailwind CSS 4 |
| Database | Cloud Firestore (NoSQL, real-time) |
| Authentication | Firebase Auth (email/password + Google OAuth) |
| Hosting | Firebase Hosting |
| Notifications | In-app (Firestore) + Discord Webhooks |
| Build Tool | Vite 5 |
| Testing | Vitest, React Testing Library |
| Linting | ESLint 9 |

## Project Structure

```
subscription-tracker/
├── docs/                              # Project documentation
├── src/
│   ├── components/
│   │   ├── common/                    # Shared components
│   │   │   ├── ConfirmDialog.jsx      # Reusable confirmation modal
│   │   │   ├── ErrorBoundary.jsx      # Global error catcher
│   │   │   └── ThemeToggle.jsx        # Dark/light mode toggle
│   │   └── features/
│   │       ├── auth/                  # Login & Register pages
│   │       ├── landing/
│   │       │   └── LandingPage.jsx    # Public landing page
│   │       └── subscriptions/         # Main dashboard & components
│   │           ├── HomePage.jsx               # Dashboard page
│   │           ├── SubscriptionCard.jsx       # Subscription display card
│   │           ├── SubscriptionModal.jsx      # Add/edit form modal
│   │           ├── SubscriptionOverviewModal.jsx  # Stats overview
│   │           ├── NotificationBell.jsx       # Notification dropdown
│   │           ├── CategoryPieChartModal.jsx  # Category pie chart
│   │           └── MonthlyExpensesChartModal.jsx  # Monthly trend chart
│   ├── contexts/
│   │   ├── authContext/               # Authentication state (Context API)
│   │   └── themeContext.jsx           # Dark/light mode state
│   ├── firebase/                      # Firebase init, auth, and Firestore CRUD
│   ├── hooks/                         # Custom React hooks
│   │   ├── useSubscriptions.js        # Real-time data + CRUD handlers
│   │   ├── useSubscriptionFilters.js  # Client-side search & category filter
│   │   ├── useSubscriptionStats.js    # Memoized totals & chart data
│   │   └── useScrollToTop.js          # Scroll-to-top button logic
│   └── services/
│       └── discord.js                 # Discord webhook notifications
├── firestore.rules                    # Security rules
├── firestore.indexes.json             # Composite indexes
├── firebase.json                      # Firebase project config
└── package.json                       # Dependencies & scripts
```

## Getting Started

### Prerequisites
- Node.js 20+
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project with Firestore and Auth enabled

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd subscription-tracker

# Install dependencies
npm install
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
# Deploy everything (hosting + rules + indexes)
firebase deploy

# Deploy only the frontend
firebase deploy --only hosting

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
        |                  Client generates
        |                  notification document
        |                        |
        v                        v
  Real-time listener      NotificationBell receives
  (onSnapshot)            update via onSnapshot
        |                        |
        v                        v
  UI updates instantly    Bell badge + dropdown update
        |
        v
  Discord webhook fires
  (if configured)
```

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
- **Pure SVG charts** — no charting library dependency; pie chart and line chart are hand-built SVG for a smaller bundle
- **Lazy-loaded chart modals** — `React.lazy` + `Suspense` keeps the initial bundle small
- **Real-time over polling** — Firestore `onSnapshot` listeners provide instant updates across devices
- **Client-side notification generation** — notifications created in Firestore when subscriptions are added/updated, no server-side functions needed
- **Graceful error handling** — notification failures never block subscription operations; the ErrorBoundary catches uncaught errors app-wide
- **Discord deduplication via localStorage** — prevents duplicate webhook messages without server-side state
- **Comprehensive security rules** — field-level validation, type checking, and immutable fields enforced at the database level

## License

This project was built as a final project for educational purposes.
