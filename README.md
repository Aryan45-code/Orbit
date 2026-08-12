# Orbit — project scaffold

This is your original single-file prototype split into a proper Vite + React + Tailwind project, ready to hand to Claude Code (or any local dev setup) for real feature work.

## What changed from the prototype

Nothing behavior-wise — every screen, interaction, and mock dataset is unchanged. What's different is structure:

```
src/
  main.jsx              entry point
  App.jsx                top-level state + routing between screens
  index.css              Tailwind directives
  data/constants.js      CATEGORIES, COLOR_MAP, seed communities, mock data
  utils/helpers.js       id generator, scoring, distance, member-gen helpers
  utils/hooks.js         useClickOutside
  components/
    Common.jsx           Logo, Avatar, Toast, GuestBanner, watermark
    TopBar.jsx, BottomNav.jsx
    SearchOverlay.jsx
    Home.jsx              stories row, ad card, orbit hero/leaderboard, radius bar, cards, HomeScreen
    Nearby.jsx             radar + NearbyScreen
    Discover.jsx           events + orbit leaderboard tab
    Community.jsx          community settings + full detail view
    CreateCommunity.jsx    3-step creation flow
    Chat.jsx                DMs, requests, community chat list
    Profile.jsx
    Onboarding.jsx
    ReportModal.jsx
```

## Running it

```
npm install
npm run dev
```

Opens at `http://localhost:5173`. `npm run build` produces a production bundle in `dist/`.

## What's still a prototype (not launch-ready yet)

Everything currently runs on mock data held in React state — nothing persists past a page refresh, and there's no server. To actually launch this, you'd need to work through each of these with Claude Code in a real dev loop (run the app, test against a real backend, iterate):

**Auth & verification** — OTP flow currently accepts any 4 digits and never sends anything. Needs a real provider (Firebase Auth, Twilio Verify, AWS Cognito, or a custom backend) for phone/email OTP, session tokens, and account storage.

**Backend & database** — communities, posts, members, chats, notifications, requests are all in-memory arrays. Needs a real database (Postgres/Supabase, Firebase, or similar) and an API layer so data survives refreshes and syncs across users' devices.

**Real-time chat** — messages currently only exist locally in the open tab. Needs a real-time layer (WebSockets, Firebase Realtime DB/Firestore, Supabase Realtime, or Pusher/Ably) so messages actually deliver between users.

**Geolocation** — `dx`/`dy` are fake coordinates baked into seed data. Needs real device geolocation (browser Geolocation API or a mobile location library) plus a geospatial query (PostGIS, geohash, or a service like Algolia/Supabase's geo features) to compute real distances.

**Push notifications** — the notification bell is local mock data. Needs a push service (Firebase Cloud Messaging, OneSignal, or native APNs/FCM if this becomes a mobile app) plus a backend trigger system.

**Moderation & reporting** — the report modal currently just shows a toast. Needs reports to actually land somewhere a moderator/admin can review, plus rules for auto-hiding flagged content.

**Web vs. native** — this is a web (React) app styled to look like a mobile app. If you want an actual App Store / Play Store app, it needs a React Native (or Flutter) rewrite of the UI layer — the data/business logic in `utils/` and `data/` would mostly carry over conceptually, but the components would need to be rebuilt with native primitives.

**Deployment** — once there's a backend, you'll need hosting (Vercel/Netlify for the frontend, plus wherever the backend/database lives), environment config, and a CI pipeline.

## Suggested next step

Open this folder in Claude Code and work through the list above one piece at a time — start with auth + a real database, since almost everything else (chat, notifications, moderation) depends on having real user accounts and persistent data first.
