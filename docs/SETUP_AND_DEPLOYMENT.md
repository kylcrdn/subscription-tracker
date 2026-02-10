# Setup & Deployment

## Prerequisites

- Node.js 20+
- Firebase CLI: `npm install -g firebase-tools`
- A Firebase project with Firestore and Auth enabled

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

## 3. Deploy

```bash
# Deploy everything (hosting + rules + indexes)
firebase deploy

# Or deploy individually
firebase deploy --only hosting              # Frontend only
firebase deploy --only firestore            # Rules + indexes only
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
| "The query requires an index" | Run `firebase deploy --only firestore:indexes` and wait 1-5 minutes for index to build. |
| Notifications not appearing | Check Firestore indexes are "Enabled". Verify notification `sendAt` is not in the future. Check `dismissed` is `false`. |
| Discord notifications not sending | Verify `VITE_DISCORD_WEBHOOK_URL` is set in `.env`. Check browser console for errors. |
| Google sign-in not working | Enable Google as a sign-in provider in Firebase Console > Authentication > Sign-in method. |

## Useful Commands

```bash
firebase use <project-id>                 # Switch Firebase project
firebase emulators:start                  # Start local emulators
firebase deploy --only firestore:rules    # Deploy security rules only
firebase deploy --only firestore:indexes  # Deploy indexes only
```

## Cost

Entirely within Firebase free tier for typical usage:
- Firestore: 1M reads/month free
- Firebase Auth: free for email/password and Google sign-in
- Firebase Hosting: 10 GB storage, 360 MB/day transfer free
- **Expected cost: $0/month**
