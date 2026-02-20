# Setup & Deployment

## Prerequisites

- Node.js 20+
- Firebase CLI (for deploying Firestore rules and indexes): `npm install -g firebase-tools`
- A Firebase project with Firestore and Auth enabled
- A Vercel account (for frontend hosting)

## 1. Install Dependencies

```bash
npm install
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

Add the same variables as **Environment Variables** in the Vercel project settings so they are available in production builds.

## 3. Deploy

### Frontend — Vercel

The recommended workflow is to connect the GitHub repository to a Vercel project. Vercel automatically builds and deploys on every push to the main branch.

To deploy manually from the CLI:

```bash
npm run build
npx vercel --prod
```

`vercel.json` contains the SPA rewrite rule so that all routes serve `index.html`.

### Firestore Rules & Indexes — Firebase CLI

```bash
# Deploy both rules and indexes
firebase deploy --only firestore

# Or individually
firebase deploy --only firestore:rules    # Security rules only
firebase deploy --only firestore:indexes  # Composite indexes only
```

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
| "The query requires an index" | Run `firebase deploy --only firestore:indexes` and wait 1-5 minutes for the index to build. |
| Notifications not appearing | Check Firestore indexes are "Enabled". Verify notification `sendAt` is not in the future. Check `dismissed` is `false`. |
| Discord notifications not sending | Verify `VITE_DISCORD_WEBHOOK_URL` is set in `.env` and in Vercel environment variables. Check browser console for errors. |
| Google sign-in not working | Enable Google as a sign-in provider in Firebase Console > Authentication > Sign-in method. |
| Vercel build fails | Confirm all `VITE_*` environment variables are set in the Vercel project settings. |

## Useful Commands

```bash
firebase use <project-id>                 # Switch Firebase project
firebase emulators:start                  # Start local emulators
firebase deploy --only firestore:rules    # Deploy security rules only
firebase deploy --only firestore:indexes  # Deploy indexes only
npx vercel --prod                         # Deploy frontend to Vercel (manual)
```

## Cost

Entirely within free tiers for typical usage:
- Firestore: 1M reads/month free
- Firebase Auth: free for email/password and Google sign-in
- Vercel: free tier includes unlimited personal projects, 100 GB bandwidth/month
- **Expected cost: $0/month**
