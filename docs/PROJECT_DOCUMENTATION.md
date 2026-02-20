# SubTracker — Project Documentation

## 1. Project Description

SubTracker is a web application that helps users track and manage their recurring subscription services. It provides a centralized dashboard where users can monitor all their active subscriptions, visualize spending patterns through interactive charts, and receive timely renewal reminders so they never miss a payment or forget to cancel an unwanted service.

The application is entirely client-side rendered (SPA) and uses Firebase as its backend-as-a-service for authentication, database, and hosting.

## 2. Technologies Used

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19 | UI library — component-based architecture with hooks |
| **React Router** | 7 | Client-side routing with protected/public route guards |
| **Vite** | 5 | Build tool and development server |
| **Tailwind CSS** | 4 | Utility-first CSS framework (via `@tailwindcss/vite` plugin) |
| **Firebase Authentication** | 12 | User authentication (email/password + Google OAuth) |
| **Cloud Firestore** | 12 | NoSQL document database with real-time listeners |
| **Vercel** | — | Static site hosting with SPA rewrites |
| **react-hot-toast** | 2.6 | Toast notification system for user feedback |
| **prop-types** | 15 | Runtime type checking for React component props |
| **Vitest** | 4 | Unit testing framework |
| **Testing Library** | 16 | React component testing utilities |
| **ESLint** | 9 | Code linting and style enforcement |

### Notable Technical Decisions

- **No charting library**: All charts (pie chart, line chart) are rendered as pure SVG using trigonometry, avoiding heavy dependencies like Chart.js or Recharts.
- **No icon library**: SVG icons are defined inline as small React components, keeping the bundle lean.
- **Tailwind CSS 4**: Uses the new `@tailwindcss/vite` plugin instead of a `tailwind.config.js` file. Theme customization is done via `@theme` directives and CSS custom properties in `index.css`.
- **Real-time data**: Firestore `onSnapshot` listeners keep the UI in sync without manual refreshing.

## 3. Project Structure

```
subscription-tracker/
├── public/                          # Static assets
├── src/
│   ├── components/
│   │   ├── common/                  # Shared/reusable components
│   │   │   ├── ConfirmDialog.jsx    #   Confirmation modal for destructive actions
│   │   │   ├── ErrorBoundary.jsx    #   Global error boundary (class component)
│   │   │   └── ThemeToggle.jsx      #   Light/dark mode toggle button
│   │   └── features/
│   │       ├── auth/
│   │       │   ├── login/
│   │       │   │   └── LoginPage.jsx        # Email/password + Google sign-in + password reset
│   │       │   └── register/
│   │       │       └── RegisterPage.jsx     # Account creation + Google sign-up
│   │       ├── landing/
│   │       │   └── LandingPage.jsx          # Public marketing/landing page
│   │       └── subscriptions/
│   │           ├── HomePage.jsx             # Main dashboard (protected)
│   │           ├── SubscriptionCard.jsx     # Individual subscription row
│   │           ├── SubscriptionModal.jsx    # Add/edit subscription form with icon picker
│   │           ├── CategoryPieChartModal.jsx    # Pie chart — cost by category (lazy-loaded)
│   │           ├── MonthlyExpensesChartModal.jsx # Line chart — monthly trend (lazy-loaded)
│   │           ├── SubscriptionOverviewModal.jsx # Quick-stats overview (lazy-loaded)
│   │           └── NotificationBell.jsx     # Header notification bell + dropdown
│   ├── contexts/
│   │   ├── authContext/
│   │   │   └── index.jsx            # AuthProvider — global auth state via React Context
│   │   └── themeContext.jsx          # ThemeProvider — light/dark mode state + localStorage
│   ├── firebase/
│   │   ├── Firebase.js              # Firebase app initialization (reads .env variables)
│   │   ├── auth.js                  # Auth helper functions (sign in, sign up, sign out, reset)
│   │   └── firestore.js             # Firestore CRUD operations + notification generation
│   ├── hooks/
│   │   ├── useSubscriptions.js      # Real-time subscription data + CRUD handlers
│   │   ├── useSubscriptionFilters.js # Client-side search and category filtering
│   │   ├── useSubscriptionStats.js  # Memoized cost totals and chart data
│   │   └── useScrollToTop.js        # Scroll-to-top button visibility logic
│   ├── services/
│   │   └── discord.js               # Discord webhook notifications for renewal reminders
│   ├── App.jsx                      # Root component — routing, providers, error boundary
│   ├── main.jsx                     # Entry point — renders App + theme flash prevention
│   └── index.css                    # Global styles, Tailwind imports, theme CSS variables
├── docs/                            # Project documentation
├── firestore.rules                  # Firestore security rules
├── firestore.indexes.json           # Firestore composite index definitions
├── firebase.json                    # Firebase project configuration (Firestore rules + indexes)
├── vercel.json                      # Vercel deployment config (SPA rewrites)
├── vite.config.js                   # Vite build configuration
├── vitest.config.js                 # Test runner configuration
├── eslint.config.js                 # Linting configuration
├── .env.example                     # Template for environment variables
└── package.json                     # Dependencies and scripts
```

## 4. Database Design

SubTracker uses **Cloud Firestore** (NoSQL document database). Data is organized into collections and subcollections under each user, ensuring complete data isolation between users.

### Data Model

```
Firestore Root
└── users (collection)
    └── {userId} (document) — User Profile
        ├── email: string | null
        ├── displayName: string | null
        ├── photoURL: string | null
        ├── emailNotifications: boolean (default: true)
        ├── reminderDays: number (1–30, default: 3)
        ├── createdAt: timestamp (server)
        ├── updatedAt: timestamp (server)
        │
        ├── subscriptions (subcollection)
        │   └── {subscriptionId} (document)
        │       ├── name: string (required, max 100 chars)
        │       ├── icon: string (logo URL or empty)
        │       ├── dueDate: string (ISO date — subscription start date)
        │       ├── price: number (0–99,999)
        │       ├── billing: "Monthly" | "Yearly"
        │       ├── category: string (required, max 50 chars)
        │       ├── createdAt: string (ISO timestamp, immutable)
        │       └── updatedAt: string (ISO timestamp, set on edit)
        │
        └── notifications (subcollection)
            └── {notificationId} (document)
                ├── subscriptionId: string (FK to subscription)
                ├── subscriptionName: string
                ├── dueDate: string (copied from subscription)
                ├── billing: "Monthly" | "Yearly"
                ├── renewalDate: string (ISO — next calculated renewal)
                ├── sendAt: string (ISO — when to show the notification)
                ├── notifyDaysBefore: number (0–30)
                ├── read: boolean (default: false)
                ├── dismissed: boolean (default: false)
                ├── createdAt: string (ISO timestamp)
                ├── readAt: string (set when marked read)
                └── dismissedAt: string (set when dismissed)
```

### Security Rules

Firestore security rules enforce:

- **Authentication**: All reads and writes require the user to be authenticated.
- **Ownership**: Users can only access their own data (`request.auth.uid == userId`).
- **Field validation**: Required fields, type checking, value ranges, and allowed field lists are enforced on every create and update operation.
- **Immutability**: The `createdAt` field cannot be changed after document creation.
- **Notification integrity**: Notification updates can only modify `read`/`dismissed` status fields — no other fields can change.

### Composite Indexes

A composite index is defined for the notifications subcollection on `(dismissed ASC, sendAt ASC)` to support the query that fetches undismissed notifications whose send date has passed.

## 5. Implemented Functionalities

### 5.1 Authentication

- **Email/password registration** — Creates a Firebase Auth account and a Firestore user profile.
- **Email/password login** — Signs in and redirects to the dashboard.
- **Google OAuth** — One-click sign-in/sign-up via Google popup.
- **Password reset** — Sends a Firebase password reset email from the login page.
- **Route protection** — `ProtectedRoute` blocks unauthenticated access to the dashboard; `PublicRoute` redirects authenticated users away from login/register.
- **Auth state persistence** — Firebase's `onAuthStateChanged` listener keeps the user signed in across page refreshes.

### 5.2 Subscription Management (CRUD)

- **Add subscription** — Modal form with fields for name, icon, price, billing cycle, start date, and category.
- **Edit subscription** — Same modal pre-populated with existing data.
- **Delete subscription** — Confirmation dialog before deletion; also removes associated notifications.
- **Bulk delete** — Selection mode with checkboxes to delete multiple subscriptions at once.
- **Real-time sync** — Firestore `onSnapshot` listeners update the UI instantly when data changes (including from other tabs/devices).

### 5.3 Icon Picker

- **Autocomplete search** — Type a service name (e.g., "Netflix") to see suggestions from a curated list of 40+ popular services.
- **Domain-based logo lookup** — Type a domain (e.g., "netflix.com") to auto-fetch the logo.
- **Dual logo source** — Attempts Clearbit Logo API first (high-quality), falls back to Google S2 Favicons (always available).

### 5.4 Filtering and Search

- **Text search** — Filter subscriptions by name in real time.
- **Category filter** — Dropdown populated dynamically from the user's existing categories.
- Both filters work together and are computed client-side via memoized hooks (`useMemo`).

### 5.5 Dashboard Statistics

- **Monthly cost** — Total normalized monthly cost (yearly subscriptions divided by 12).
- **Yearly cost** — Total normalized yearly cost (monthly subscriptions multiplied by 12).
- **Active subscription count** — Total number of tracked subscriptions.
- All stats are clickable to open the corresponding chart modal.

### 5.6 Data Visualization

- **Category pie chart** — SVG pie chart showing the monthly cost distribution across categories. Opened from the "Monthly" stat card.
- **Monthly expenses line chart** — SVG line chart showing monthly expense trends for the current year (Jan–Dec), with a dashed projection line for future months. Opened from the "Yearly" stat card.
- **Subscription overview** — Quick-stats panel showing billing cycle split, most/least expensive subscriptions, top category, and upcoming renewals within the next 7 days. Opened from the "Active Subs" stat card.
- All chart modals are **lazy-loaded** (`React.lazy` + `Suspense`) to minimize initial bundle size.

### 5.7 Renewal Notifications

- **In-app notifications** — A bell icon in the header shows a badge with the unread count. Clicking it opens a dropdown listing upcoming renewals (within 7 days).
- **Auto-generation** — Notifications are automatically created/updated/deleted whenever subscriptions change.
- **Read/dismiss** — Notifications are auto-marked as read when the dropdown opens. Individual notifications can be dismissed permanently.
- **Real-time** — Notifications use Firestore `onSnapshot` listeners for instant updates.

### 5.8 Discord Webhook Integration

- **Optional** — Enabled by setting `VITE_DISCORD_WEBHOOK_URL` in the `.env` file.
- **Rich embeds** — Sends color-coded Discord messages at 7, 3, 1, and 0 days before renewal with subscription details.
- **Deduplication** — Uses `localStorage` to prevent duplicate messages on the same day; old entries are cleaned up automatically.

### 5.9 Theming (Light/Dark Mode)

- **Dark mode by default** — Light mode activated by adding the `.light` class to `<html>`.
- **CSS custom properties** — Semantic tokens (canvas, panel, surface, control, overlay, content, etc.) defined via Tailwind's `@theme` directive.
- **Persistent** — Theme preference is stored in `localStorage` and applied before React hydration to prevent a flash of incorrect theme.
- **Toggle** — Sun/moon button in the header and on the landing page.

### 5.10 Error Handling

- **ErrorBoundary** — A class-based React error boundary wraps the entire application and displays a friendly fallback UI if an unhandled error occurs.
- **Toast notifications** — Success/error toasts for all CRUD operations using react-hot-toast.
- **Firebase error mapping** — Firebase Auth error codes are mapped to human-readable messages on the login/register pages.
- **Graceful degradation** — Notification side-effects (generation, deletion) are wrapped in try/catch so that primary CRUD operations still succeed even if notification logic fails.

## 6. Installation and Usage Instructions

### Prerequisites

- **Node.js** (v18 or later)
- **npm** (v9 or later)
- A **Firebase project** with Authentication (Email/Password + Google) and Firestore enabled

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd subscription-tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy the example file and fill in your Firebase credentials:

   ```bash
   cp .env.example .env
   ```

   Required variables:

   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

   Optional (for Discord notifications):

   ```env
   VITE_DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
   ```

4. **Deploy Firestore rules and indexes**

   ```bash
   npx firebase deploy --only firestore:rules,firestore:indexes
   ```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite development server with hot reload |
| `npm run build` | Create optimized production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint on all source files |
| `npm test` | Run unit tests with Vitest |
| `npm run test:ui` | Run tests with Vitest's browser UI |
| `npm run test:coverage` | Run tests with code coverage report |

### Production Deployment

The frontend is hosted on **Vercel**. Firestore rules and indexes are still deployed via the Firebase CLI.

1. Build the project:

   ```bash
   npm run build
   ```

2. Deploy the frontend to Vercel (push to the connected Git branch, or use the CLI):

   ```bash
   npx vercel --prod
   ```

3. Deploy Firestore security rules and indexes:

   ```bash
   npx firebase deploy --only firestore
   ```
