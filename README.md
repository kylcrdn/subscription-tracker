# SubTracker

A React app for tracking subscriptions, spending, and renewal reminders. Data is stored in Firebase.

## Run locally

Requires Node.js 20+ and a Firebase project with Authentication and Firestore enabled.

1. Install dependencies: `npm install`
2. Create a `.env` file in the project root with your Firebase web app values:

   ```env
   VITE_FIREBASE_API_KEY=
   VITE_FIREBASE_AUTH_DOMAIN=
   VITE_FIREBASE_PROJECT_ID=
   VITE_FIREBASE_STORAGE_BUCKET=
   VITE_FIREBASE_MESSAGING_SENDER_ID=
   VITE_FIREBASE_APP_ID=
   ```

3. Start the app: `npm run dev`

## Checks

```bash
npm test
npm run lint
npm run build
```

For deployment, add the same Firebase variables in your Vercel project settings and deploy Firestore rules with `firebase deploy --only firestore`.
