# SubTracker

A React + Firebase app for tracking subscriptions, reviewing spending trends, and managing renewal reminders.

## What it does

- Track subscriptions with name, price, billing cycle, category, and renewal date
- Show monthly and yearly totals in a dashboard
- Filter and search the subscription list
- View category and spending charts
- Receive in-app reminders for upcoming renewals
- Protect each user’s data with Firebase Auth + Firestore rules

## Tech stack

- React 19
- Firebase Auth + Firestore
- Vite
- Tailwind CSS 4
- Vitest + Testing Library

## Quick start

### 1) Install dependencies

```bash
git clone <repository-url>
cd subscription-tracker
npm install
```

### 2) Set up Firebase environment variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Then fill in the required values:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

> Do not put Discord webhook secrets in the browser. Browser-side code cannot safely hold them. Use a secure backend or Firebase Function for Discord delivery if you want that feature.

### 3) Run the app locally

```bash
npm run dev
```

Then open the local URL shown in the terminal.

## Useful commands

```bash
npm run dev        # start the app locally
npm run build      # production build
npm run preview    # preview the production build
npm run lint       # lint the project
npm test           # run the test suite
```

## Firebase setup

1. Create a Firebase project.
2. Enable Firebase Authentication.
3. Enable Firestore.
4. Deploy the rules:

```bash
firebase deploy --only firestore
```

## Project structure

```text
subscription-tracker/
├── docs/
├── src/
│   ├── components/
│   ├── contexts/
│   ├── firebase/
│   ├── hooks/
│   ├── services/
│   └── utils/
├── .env.example
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── package.json
├── README.md
└── vite.config.js
```

## Security notes

- Firebase config is validated before app startup so missing values fail fast.
- Firestore rules restrict each user to their own documents.
- Browser secrets are avoided by design, including Discord webhook URLs.
- Any server-side notification feature should live behind Firebase Functions or another trusted backend service.

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/SETUP_AND_DEPLOYMENT.md](docs/SETUP_AND_DEPLOYMENT.md)
- [docs/PROJECT_DOCUMENTATION.md](docs/PROJECT_DOCUMENTATION.md)

## Key Design Decisions

- **Feature-based folder structure** — components, hooks, and services organized by feature, not file type
- **Custom hooks for separation of concerns** — HomePage delegates all data logic to hooks, keeping the component focused on UI
- **Pure SVG charts** — no charting library dependency; pie chart and line chart are hand-built SVG for a smaller bundle
- **Lazy-loaded chart modals** — `React.lazy` + `Suspense` keeps the initial bundle small
- **Real-time over polling** — Firestore `onSnapshot` listeners provide instant updates across devices
- **Firestore-backed notifications** — reminders are stored and tracked in Firestore when subscriptions change, without exposing secrets in the browser
- **Graceful error handling** — notification failures never block subscription operations; the ErrorBoundary catches uncaught errors app-wide
- **Secure server-side expansion** — Discord delivery should be implemented through a trusted backend or Firebase Function rather than browser code
- **Comprehensive security rules** — field-level validation, type checking, and immutable fields enforced at the database level

## License

This project was built as a final project for educational purposes.
