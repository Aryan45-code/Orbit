# Orbit

Orbit is a campus-exclusive social app for **Manipal University Jaipur** students — one platform that merges student-created **communities**, official college **clubs**, campus **events**, direct messaging, and an anonymous 48-hour confession feed ("Locali-Tea"). Access is restricted to verified `@muj.manipal.edu` students.

This repo is the **frontend only** (React + Vite). There is no backend yet — every piece of data (communities, events, chats, notifications, posts) currently lives in in-memory React state, seeded from mock data, and is lost on page refresh. This document exists to hand the frontend to a backend developer: what the app does, what data it expects, and exactly what currently-fake behavior needs a real implementation.

> The product spec (`SPEC.md`) and a proposed backend design (`BACKEND_ARCHITECTURE.docx`, summarized in [§8](#8-planned-backend-stack-supabase) below) already exist in this repo — read those too, this README is the map that ties them to the actual code.

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
    Onboarding.jsx            Email verification + OTP + profile setup (3-step flow)
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
- `ONBOARDING_STEPS` — `["contact", "otp", "profile"]`, drives the onboarding progress bar.

**Not in `constants.js`, but real state a backend needs to own:**
- `user` (in `App.jsx`): `{ name: string, verified: boolean, interests: string[] }` — no email, password, or user ID is stored client-side at all today.
- Community **posts**, **chat messages**, and **member lists** shown inside `Community.jsx` are currently generated **inside that component** on mount (not passed down from `App.jsx`, not persisted) — see the important caveat in §7.

## 6. State management

Everything lives in local component state (`useState`/`useMemo`/`useCallback`), no Context/Redux/Zustand. Almost all cross-screen state (`communities`, `joinedIds`, `events`, `notifications`, DM requests, Locali-Tea posts, the current `user`) is lifted to `App.jsx` and passed down as props with handler callbacks (`onJoinToggle`, `onCreate`, `onPostTea`, etc.) — that's the seam a backend integration should replace: turn each of those `useState` arrays into data fetched from an API, and each handler into an API call (optimistic-update the local state the same way it does now, then reconcile with the server response).

## 7. Client-side logic a backend needs to replicate or replace

**Email domain lock (`Onboarding.jsx`)** — students only ever type the part of their email *before* `@`; the domain is hardcoded to `muj.manipal.edu` and appended automatically (`COLLEGE_EMAIL_DOMAIN` constant), so there is no way to type a non-Manipal address in the UI at all. **This is a client-side-only restriction — it is not real verification.** The backend must independently enforce a domain allow-list on signup (this is exactly what `BACKEND_ARCHITECTURE.docx` §3 describes: reject any email outside the approved domain(s) in a Postgres trigger or edge function, before an OTP is even sent).

**OTP verification is entirely fake** — `Onboarding.jsx`'s OTP step accepts *any* 4 digits and never sends or checks anything. A real OTP send/verify flow (Supabase Auth email OTP, per `BACKEND_ARCHITECTURE.docx`, or equivalent) replaces this step outright.

**Locali-Tea's 48-hour expiry is client-side filtering, not deletion** (`utils/helpers.js`: `TEA_LIFESPAN_MS`, `isTeaExpired`, `teaTimeLeft`) — expired posts are simply filtered out of the rendered list; they still sit in memory. A real implementation needs either a scheduled deletion job (cron/TTL) or continues to filter-on-read server-side, but shouldn't rely on the client to "hide" expired content from other users.

**Community members and posts are fabricated, not real** (important) — `Community.jsx`'s `genMembers()` (in `utils/helpers.js`) deterministically generates a fake member list from a static 24-name pool (`NAME_POOL`) based on the community's `id` and its `members` count; it is **not** a real membership list and resets differently every time you view a different community. Likewise, the posts feed and group chat messages shown inside a community are seeded with 2-3 hardcoded entries **inside `Community.jsx` itself** — they are not passed down from `App.jsx`'s state, so they reset every time you navigate away and back. A real backend needs actual `community_members`, `posts`, and `messages` tables (see §8) — none of what's currently rendered in a community's Members/Posts/Chat tabs reflects real data.

**"Trending" and "matched to your interests" are pure client-side scoring**, not personalization from a backend: `communityTrendScore()` = `members*0.4 + sparks*2 - lastActive*0.6`, and `interestMatchCount()` just counts overlap between a community's `tags` and the user's `interests`. These are cheap to keep as-is or move server-side once real usage data (join events, activity) exists.

**"Sparks"** (the flame/interest counter on communities and posts) is not a real counter either — `baseSparks()` derives a plausible-looking number from `members * 0.55`, and the local "spark" toggle just adds/subtracts 1 visually. There's no real per-user interest signal being recorded.

**Handles** (`handleFor()` in `utils/helpers.js`) are generated client-side by slugifying the name + appending the numeric id (e.g. `dsa-grinders-6am-batch-14`) — fine as a *display* fallback, but the backend should own uniqueness enforcement at creation time (per `SPEC.md` §6), since two communities could otherwise collide or a renamed community would change its handle.

## 8. Planned backend stack (Supabase)

`BACKEND_ARCHITECTURE.docx` (full doc in this repo) proposes: **Supabase** (Postgres + Auth + Realtime + Storage + Edge Functions) for everything, **Firebase Cloud Messaging** for push (Supabase has no native push), **Vercel** for frontend hosting. Core tables it defines: `users`, `communities`, `community_members`, `posts`, `messages` (community chat via `community_id`, DMs via `thread_id`), `dm_threads`/`dm_participants`, `chat_requests`, `events`, `event_registrations`, `notifications`, `reports` — with Row-Level Security enabled on every table from day one. It also lays out a 5-phase rollout (auth+core data → chat → clubs/events → notifications/moderation → scale checkpoint) and a scaling budget (free tier to ~2,000 users, ~$45/mo Supabase+Vercel Pro up to 10,000). Read the full document for schema details, RLS notes, and the realtime/events-registration transaction design — this section is a pointer, not a replacement for it.

## 9. What's not implemented — backend TODO checklist

- [ ] Real auth: college-email domain allow-list + real OTP send/verify + session issuance (replaces the fake Onboarding flow in §7)
- [ ] Persistent storage for communities, clubs, events, posts, community chat messages, DMs, notifications, reports (all currently in-memory only, lost on refresh)
- [ ] Real community membership (`community_members`) — replaces the fabricated `genMembers()` output
- [ ] Real-time delivery for community chat and DMs (currently: messages exist only in that one browser tab's state)
- [ ] Push notifications (the notification bell is 4 hardcoded mock rows)
- [ ] Moderation queue — `ReportModal`'s selected reason now reaches `App.jsx`'s `handleReportSubmit(reason)` (logged via `console.log` as a placeholder), but it's still just a toast, not persisted anywhere. Needs a real `reports` table/endpoint.
- [ ] Server-enforced unique handles for communities/clubs, generated/validated server-side instead of the client-side slug in `handleFor()`
- [ ] Event → community linkage as one transaction (register for event ⇒ insert registration + add to community members), per `BACKEND_ARCHITECTURE.docx` §6
- [ ] Locali-Tea expiry as a real TTL/cron rather than a client-side filter
- [ ] Clubs data source is an **open question** per `SPEC.md`: will official club info be entered by an admin, or supplied by the college? This affects whether an admin/moderation screen for clubs is needed at launch.

## 10. Design system reference

Custom animation/utility classes live in `tailwind.config.js` (keyframes) and `src/index.css` (`.no-scrollbar`, `.mono`, `.glass`, `.skeleton-shimmer`, stagger classes `.stagger-1`–`.stagger-8`). Not backend-relevant, but useful context if you end up touching any component markup while wiring up real data.
