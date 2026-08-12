# Orbit

Orbit is a campus-exclusive social app for **Manipal University Jaipur** students — one platform that merges student-created **communities**, official college **clubs**, campus **events**, direct messaging, and an anonymous 48-hour confession feed ("Locali-Tea"). Access is restricted to verified `@muj.manipal.edu` students.

This repo is the **frontend only** (React + Vite). There is no backend yet — every piece of data (communities, events, chats, notifications, posts) currently lives in in-memory React state, seeded from mock data, and is lost on page refresh. This document exists to hand the frontend to a backend developer: what the app does, what data it expects, and exactly what currently-fake behavior needs a real implementation.

**Other docs in this repo — read in this order:**
1. `PRODUCT_DESIGN_AND_FEATURES.docx` — what Orbit is and every feature, for anyone getting oriented without reading code.
2. `FRONTEND_ARCHITECTURE.docx` — a deeper dive into exactly how this codebase is built (this README's §2–§6 summarize it).
3. `BACKEND_ARCHITECTURE_FIREBASE.docx` — **the current backend plan**, summarized in [§8](#8-planned-backend-stack-firebase) below.
4. `SPEC.md` — the original product spec.
5. `BACKEND_ARCHITECTURE.docx` — an earlier Supabase-based backend proposal. **Superseded by the Firebase doc above** — kept in the repo for reference only, do not build against it.

This README is the map that ties all of the above to the actual code.

---

## 1. Tech stack & running it

- **React 18** + **Vite 5** (dev server, build tool)
- **Tailwind CSS 3** for styling
- **lucide-react** for icons
- **qrcode.react** for generating QR codes on community/club pages
- No router (single `App.jsx` state machine — see [§6](#6-state-management)), no global state library (no Redux/Zustand/Context), no backend SDK wired in yet

```bash
npm install
npm run dev       # starts Vite dev server at http://localhost:5173
npm run build     # production bundle to dist/
npm run preview   # serve the production build locally
```

## 2. Project structure

```
src/
  main.jsx                 React entry point, mounts <App />
  App.jsx                  ALL top-level state + screen routing lives here
  index.css                Tailwind directives + custom animation/utility classes
  data/
    constants.js            Every mock dataset + static config (see §4)
  utils/
    helpers.js               Pure functions: id generation, trend/match scoring, Locali-Tea expiry, handle/member generation
    hooks.js                  useClickOutside (closes dropdowns/menus on outside click/tap)
  components/
    Onboarding.jsx            Email + OTP verification (one page) + profile setup (2-step flow)
    Home.jsx                  Home feed: stories row, category filter, interest-matched picks, community cards
    Explore.jsx                Directory of Clubs / Communities (search + category filter)
    Events.jsx                 Events feed + registration
    Community.jsx               Community/club detail page (posts, chat, members, settings, QR)
    CreateCommunity.jsx          3-step "create a community" flow
    Chat.jsx                     Direct messages: requests inbox, 1:1 threads, new-message picker
    LocaliTea.jsx                Anonymous 48h confession feed + comments
    Profile.jsx                  User's own profile: bio, interests, post grid, joined communities
    SearchOverlay.jsx            Global search across communities + clubs
    ReportModal.jsx               Report-content modal (community, club, or Locali-Tea post)
    TopBar.jsx / BottomNav.jsx    App chrome: top icons + notifications dropdown, bottom tab bar
    Common.jsx                    Shared: Logo, Avatar, Toast, GuestBanner, background/emblem decoration
    Skeleton.jsx                  Loading-state placeholders (shimmer cards/circles)
    EmptyState.jsx                 Reusable "nothing here yet" placeholder (icon + title + subtitle)
```

Two files that existed in earlier commits — `Discover.jsx` and `Nearby.jsx` (a geolocation/"nearby" feature) — have been deleted. They were leftovers from before the product pivoted to campus-only (no geolocation, see `SPEC.md` §2) and were never imported anywhere; `SPEC.md` itself flags them as safe to delete. Distance fields (`dx`/`dy`) were likewise stripped from the seed data in `constants.js` since nothing reads them anymore.

## 3. Navigation model

Bottom tab bar has exactly **4 tabs**: **Home · Explore · Events · Profile**. There is no dedicated "Chat" tab — messaging is contextual:
- **Community/club chat** lives inside that community's own detail page (a tab alongside Posts/Members).
- **Direct messages (1:1) + chat requests** open from a message icon in the top bar.
- **Locali-Tea** (anonymous confessions) opens from a coffee-cup icon in the top bar.

`App.jsx` has no router — it's a manual state machine: `stage` (`"onboarding"` vs `"app"`), `activeTab` (one of the 4 tabs), and a handful of booleans (`selectedCommunity`, `showCreate`, `searchOpen`, `messagesOpen`, `teaOpen`) that each render a full-screen overlay over the tab content when set.

## 4. Screens & what data each one needs

| Screen | Purpose | Data it reads |
|---|---|---|
| **Onboarding** | College-email verification (fake OTP) → name + interest picker. "Browse as guest" skips verification with reduced access. | none in — writes `{ name, verified, interests }` |
| **Home** | Feed of joined-first stories, category filter chips, interest-matched picks, community cards grouped by category, one sponsored ad slot. | `communities`, `joinedIds`, `sparkedIds`, `user.interests` |
| **Explore** | Directory with two sub-tabs: **Clubs** (official, `official: true`) and **Communities** (student-created). Search + category filter. | `clubs`, `communities` |
| **Events** | List of events, sorted with interest-matches first. Registering grants instant access to that event's auto-created community. | `events`, `registeredEventIds`, `user.interests` |
| **Community detail** | Posts feed, group chat, member list (with search), settings (rename/delete, admin-only), QR code + handle. | one `community` object; members/posts/chat are currently generated/local (see §5 caveats) |
| **Create Community** | 3-step flow: pick category → name + description → confirm. Blocked for unverified/guest users. | writes a new community object |
| **Direct Messages** | Tabs for incoming/outgoing chat **requests** and existing **1:1 threads**; a "new message" picker suggests people from shared communities. | `incoming`, `outgoing`, mock suggested people, mock chat list |
| **Locali-Tea** | Anonymous text posts, "True"/"Cap" vote buttons, threaded comments. Every post (and its comments) disappears 48h after posting. | `teaPosts` |
| **Profile** | Editable name/bio, interest tags, "people like you" (shared-interest suggestions), a post grid, and a grid of joined communities. | `user`, `joinedCommunities` |
| **Search** | Global filter across all communities + clubs by name or category. | `communities` + `clubs` combined |

## 5. Data models currently mocked in `src/data/constants.js`

These are the shapes a real API needs to return. Every array below is currently hardcoded and given a generated `id` via `nextId()` (an in-memory counter — **not** a real unique/persistent ID scheme, don't carry that over).

**Community / Club** (`SEED_COMMUNITIES`, `CLUBS` — same shape, clubs just set `official: true`):
```
{
  id: string,
  name: string,
  category: string,          // must match one of CATEGORIES (see below)
  tags: string[],             // usually [category], can include more
  desc: string,
  members: number,            // just a count — no real member list exists server-side yet
  lastActive: number,         // MINUTES ago (not a timestamp) — used to compute "live" badge (<=10) and trend sort
  creator: string,            // "Seed" | "College" | "You" | "EventSystem" (event-linked communities)
  official: boolean,
}
```

**Event** (`MOCK_EVENTS`):
```
{ id, title, when: string ("Tomorrow, 5:00 PM" — NOT a real Date), where: string, category, tags: string[], capacity: number, desc }
```
`when` is a display string today, not a parseable date/time — a real backend should use an actual timestamp and let the frontend format it.

**Notification** (`MOCK_NOTIFICATIONS`): `{ id, text, time: string ("6m ago"), unread: boolean }`

**Chat request** — incoming (`MOCK_INCOMING_REQUESTS`) / outgoing (`MOCK_OUTGOING_REQUESTS`): `{ id, name, context: string, status?: "pending" }` (outgoing only)

**1:1 chat** (`MOCK_INDIVIDUAL_CHATS`): `{ id, name, lastMsg, time, unread }`

**Suggested person** (`MOCK_SUGGESTED_PEOPLE`, for "new message" picker): `{ id, name, context }`

**Ad** (`MOCK_ADS`): `{ id, title, subtitle, cta, color }`

**"People like you"** (`MOCK_SIMILAR_PEOPLE`, Profile screen): `{ id, name, shared: string[] }` — `shared` is a list of category names, matched against the current user's `interests`.

**Locali-Tea post** (`MOCK_TEA`): `{ id, text, trueCount, capCount, comments: [{ who, text, time }], createdAt: number (epoch ms) }`

**Static config, not per-record data:**
- `CATEGORIES` — the fixed list of 16 interest/category names, each with an icon + color. This is the taxonomy communities, clubs, events, and user interests all key off of.
- `COLOR_MAP` — Tailwind class lookup per color name (`indigo`, `rose`, etc.), purely presentational.
- `REPORT_REASONS` — fixed list of 5 report reasons shown in the report modal.
- `ONBOARDING_STEPS` — `["contact", "profile"]`, drives the onboarding progress bar. Email entry and OTP verification share the single "contact" step (the OTP field is revealed inline after "Send OTP", via a local `otpSent` flag in `Onboarding.jsx` — not a separate step).

**Not in `constants.js`, but real state a backend needs to own:**
- `user` (in `App.jsx`): `{ name: string, verified: boolean, interests: string[] }` — no email, password, or user ID is stored client-side at all today.
- Community **posts**, **chat messages**, and **member lists** shown inside `Community.jsx` are currently generated **inside that component** on mount (not passed down from `App.jsx`, not persisted) — see the important caveat in §7.

## 6. State management

Everything lives in local component state (`useState`/`useMemo`/`useCallback`), no Context/Redux/Zustand. Almost all cross-screen state (`communities`, `joinedIds`, `events`, `notifications`, DM requests, Locali-Tea posts, the current `user`) is lifted to `App.jsx` and passed down as props with handler callbacks (`onJoinToggle`, `onCreate`, `onPostTea`, etc.) — that's the seam a backend integration should replace: turn each of those `useState` arrays into data fetched from an API, and each handler into an API call (optimistic-update the local state the same way it does now, then reconcile with the server response).

## 7. Client-side logic a backend needs to replicate or replace

**Email domain lock (`Onboarding.jsx`)** — students only ever type the part of their email *before* `@`; the domain is hardcoded to `muj.manipal.edu` and appended automatically (`COLLEGE_EMAIL_DOMAIN` constant), so there is no way to type a non-Manipal address in the UI at all. **This is a client-side-only restriction — it is not real verification.** The backend must independently re-check the domain server-side before an OTP is even sent (`BACKEND_ARCHITECTURE_FIREBASE.docx` §3: a `requestOtp` Cloud Function re-validates the `@muj.manipal.edu` suffix — never trust the client-side check alone, since anyone can call the API directly).

**OTP verification is entirely fake** — `Onboarding.jsx`'s OTP step accepts *any* 4 digits and never sends or checks anything. The Firebase plan (§3 of the Firebase doc) replaces this with a custom `requestOtp`/`verifyOtp` Cloud Function pair (Firebase's built-in passwordless auth is a magic link, not a 4-digit code, so a small custom layer sits on top of Firebase Auth to keep today's UX).

**Locali-Tea's 48-hour expiry is client-side filtering, not deletion** (`utils/helpers.js`: `TEA_LIFESPAN_MS`, `isTeaExpired`, `teaTimeLeft`) — expired posts are simply filtered out of the rendered list; they still sit in memory. The Firebase plan (§5) uses Firestore's native TTL policy on an `expiresAt` field — no cron job needed — but deletion isn't instant (Google documents "typically within 24 hours"), so the client-side filter-on-read stays in place as a display safeguard even after the backend is live.

**Community members and posts are fabricated, not real** (important) — `Community.jsx`'s `genMembers()` (in `utils/helpers.js`) deterministically generates a fake member list from a static 24-name pool (`NAME_POOL`) based on the community's `id` and its `members` count; it is **not** a real membership list and resets differently every time you view a different community. Likewise, the posts feed and group chat messages shown inside a community are seeded with 2-3 hardcoded entries **inside `Community.jsx` itself** — they are not passed down from `App.jsx`'s state, so they reset every time you navigate away and back. A real backend needs actual `communities/{id}/members/{uid}` and `communities/{id}/messages/{msgId}` collections, plus a real posts source (see §8) — none of what's currently rendered in a community's Members/Posts/Chat tabs reflects real data.

**"Trending" and "matched to your interests" are pure client-side scoring**, not personalization from a backend: `communityTrendScore()` = `members*0.4 + sparks*2 - lastActive*0.6`, and `interestMatchCount()` just counts overlap between a community's `tags` and the user's `interests`. These are cheap to keep as-is or move server-side once real usage data (join events, activity) exists.

**"Sparks"** (the flame/interest counter on communities and posts) is not a real counter either — `baseSparks()` derives a plausible-looking number from `members * 0.55`, and the local "spark" toggle just adds/subtracts 1 visually. There's no real per-user interest signal being recorded.

**Handles** (`handleFor()` in `utils/helpers.js`) are generated client-side by slugifying the name + appending the numeric id (e.g. `dsa-grinders-6am-batch-14`) — fine as a *display* fallback, but the backend should own uniqueness enforcement at creation time (per `SPEC.md` §6), since two communities could otherwise collide or a renamed community would change its handle.

## 8. Planned backend stack (Firebase)

`BACKEND_ARCHITECTURE_FIREBASE.docx` (full doc in this repo) is **the current backend plan** — it replaced an earlier Supabase-based proposal (`BACKEND_ARCHITECTURE.docx`, still in the repo but superseded). It proposes an all-Firebase stack: **Firestore** (data), **Firebase Authentication** + a custom Cloud Function OTP layer (identity — see §7 above), **Cloud Functions** (server logic), **Cloud Storage for Firebase** (media), **Firebase Cloud Messaging** (push), **Firebase Hosting** (deploys the existing Vite build as-is).

Key points a backend dev should know before reading the full doc:
- **Firestore is a document database, not relational** — no `JOIN`s. The schema embeds data where a join would otherwise be needed (e.g. Locali-Tea comments/votes live *inside* the post document, not a subcollection — see below) or duplicates it (a community's member count is stored on the community doc, not computed by counting).
- **Core collections**: `users/{uid}`, `communities/{id}` (with `members/{uid}` and `messages/{msgId}` subcollections), `events/{id}` (with `registrations/{uid}`), `dm_threads/{threadId}` (with `messages/{msgId}`), `chat_requests/{id}`, `users/{uid}/notifications/{id}`, `reports/{id}`, `tea_posts/{id}`.
- **Locali-Tea posts are deliberately denormalized**: comments and votes are embedded directly on the `tea_posts/{id}` document (not a subcollection) specifically so Firestore's native TTL deletion removes the whole post — including every comment — in one shot. If they were modeled as a subcollection, the parent would expire on schedule but the comments would silently become permanent orphaned documents.
- **Security Rules** (`firestore.rules`) are the access-control layer — the Firebase equivalent of Supabase's Postgres RLS. Custom claims (`verified`, `admin`, `clubAdmin:{communityId}`) are set server-side only, via the Admin SDK.
- **Events → community linkage** is a Cloud Function `onCreate` trigger on `events/{id}/registrations/{uid}`, run inside a Firestore transaction so two simultaneous first-registrations can't create duplicate event communities.
- **Realtime chat/notifications** use Firestore's `onSnapshot` listeners directly — no separate WebSocket service needed. Cost caveat: every open listener re-bills a read per changed document, so chat screens must unsubscribe on unmount and paginate with `limitToLast`.
- **Scaling budget**: Spark (free) tier covers local dev, but Cloud Functions requires the pay-as-you-go **Blaze** tier — needed anyway since the OTP flow depends on Cloud Functions, so Blaze is a day-one requirement, not something deferrable. At a ~10,000-student ceiling, expect a low-hundreds-of-dollars-a-month ceiling, not a cliff. Set a Cloud Billing budget alert on day one.
- **5-phase rollout**: (1) Foundation — project setup, custom-OTP auth, core collections wired to this frontend, Security Rules v1; (2) Core social — community/club chat, DMs, Locali-Tea + TTL; (3) Events — registration + auto-community-creation trigger; (4) Media & push — Cloud Storage, FCM; (5) Hardening — App Check, budget alerts, load-test chat listeners, moderation console.

Read the full document for exact field-level schemas, the OTP Cloud Function sequence, and Security Rules examples — this section is a pointer, not a replacement for it.

## 9. What's not implemented — backend TODO checklist

- [ ] Real auth: Firebase Auth + custom `requestOtp`/`verifyOtp` Cloud Functions with server-side domain re-check + session issuance (replaces the fake Onboarding flow in §7 — see Firebase doc §3)
- [ ] Firestore collections for communities, clubs, events, posts, community chat messages, DMs, notifications, reports (all currently in-memory only, lost on refresh — see Firebase doc §4 for exact shapes)
- [ ] Real community membership (`communities/{id}/members/{uid}`) — replaces the fabricated `genMembers()` output
- [ ] Realtime delivery for community chat and DMs via Firestore `onSnapshot` listeners (currently: messages exist only in that one browser tab's state)
- [ ] Push notifications via Firebase Cloud Messaging (the notification bell is 4 hardcoded mock rows)
- [ ] Moderation queue — `ReportModal`'s selected reason now reaches `App.jsx`'s `handleReportSubmit(reason)` (logged via `console.log` as a placeholder), but it's still just a toast, not persisted anywhere. Needs a real `reports/{id}` collection + Security Rules (write-only for regular users, read-only for admins).
- [ ] Server-enforced unique handles for communities/clubs, generated/validated server-side instead of the client-side slug in `handleFor()`
- [ ] Event → community linkage as a Cloud Function `onCreate` trigger + Firestore transaction (register for event ⇒ create/find linked community + add membership), per Firebase doc §6
- [ ] Locali-Tea expiry via Firestore's native TTL policy on `expiresAt`, with comments/votes embedded on the post doc (not a subcollection) so TTL deletes them too — per Firebase doc §5. Client-side filter-on-read stays as a display safeguard since TTL deletion isn't instant.
- [ ] Firestore Security Rules + custom claims (`verified`, `admin`, `clubAdmin:{communityId}`) — the access-control layer, equivalent to what RLS would do on a relational DB
- [ ] App Check enabled before public launch (Firebase doc §10) — without it, Cloud Functions endpoints are callable by anyone who finds the URL
- [ ] Clubs data source is an **open question** per `SPEC.md`: will official club info be entered by an admin, or supplied by the college? This affects whether an admin/moderation screen for clubs is needed at launch.

## 10. Design system reference

Custom animation/utility classes live in `tailwind.config.js` (keyframes) and `src/index.css` (`.no-scrollbar`, `.mono`, `.glass`, `.skeleton-shimmer`, stagger classes `.stagger-1`–`.stagger-8`). Not backend-relevant, but useful context if you end up touching any component markup while wiring up real data.
