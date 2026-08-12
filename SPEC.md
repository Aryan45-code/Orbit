# Orbit — Product Spec v2 (Manipal Jaipur pivot)

This supersedes parts of `README.md`'s original roadmap. Orbit is no longer a generic "nearby communities" app — it is now **campus-exclusive to Manipal University Jaipur**, with clubs, events, and communities merged into one platform, and a visual language inspired by Instagram/Telegram.

Source: `Features.docx` (uploaded by the founder), clarified in conversation. Items below are grouped by area; each references the original numbered point for traceability.

**Implementation status:** the frontend/prototype changes below are built and compiling (`npm run build` passes, 1519 modules, 0 errors) — email-only OTP flow, no geolocation anywhere, new 4-tab nav (Home/Explore/Events/Profile), Clubs directory, Events with registration-to-community access, community/club handles + QR codes, chat moved into each community/club's own page, DMs behind a top-bar icon, simplified profile with a personal post grid. Still mock-data-driven (no real Supabase/backend wired up — see `BACKEND_ARCHITECTURE.docx`), and the visual pass is a strong first draft, not a pixel-matched IG/Telegram clone — that needs live iteration in Claude Code (see the bottom of this file). `Nearby.jsx` and `Discover.jsx` are now orphaned/unused files, kept only because they can't be deleted from this workspace — safe to delete locally.

---

## 1. Access & Authentication (points 1, 2, 3, 4)

- **Login page**: strip it down to just the Orbit logo/name + login options. Remove the phone-number login path entirely.
- **Identity**: only Manipal Jaipur students can join. Verification is via their **official college email** (the `@jaipur.manipal.edu`-style Outlook address), not full Microsoft SSO.
  - **Why not full Microsoft/Azure AD SSO**: Manipal's login runs on Microsoft Entra ID (Azure AD). Registering a third-party OAuth app against their tenant normally needs IT/admin consent — most institutional tenants block student-level consent to unregistered apps. Doing this without the college's knowledge risks the app getting flagged as unauthorized, and is out of scope for a 1-week solo build.
  - **What we do instead**: student enters their official college email → we send an OTP to that inbox → verified. This restricts signups to genuine students without needing any institutional approval, and doesn't touch Azure AD at all.
  - This also solves the "keeps logging me out" complaint: that behavior comes from the college's own Conditional Access / sign-in-frequency policy on their Microsoft tenant, which we have no control over if we depend on their SSO. Since we're not using their SSO, Orbit issues and controls its own session (long-lived, refreshed silently) — students don't re-authenticate every few days.
  - **Both OTP and "Sign in with Microsoft" as options** (point 3): keep OTP as the only supported method for v1 launch. Add "Sign in with Microsoft" later as an optional, nice-to-have path once/if the college is looped in — do not block launch on it.
- **Profile setup — skip interests**: add a visible "Skip — show me everything" option next to interest selection, so a student can land in the app with access to all communities without picking any category first.

## 2. Remove geolocation entirely (point 5)

- Delete the radius slider, the "km away" labels, the Nearby/radar tab, and all distance-based sorting/filtering.
- Replace with **campus-only** scoping — there is one campus, so there's no distance concept left to show. Community/club discovery is by category and (new) by handle/search, not by proximity.
- Any future "which hostel block / which building" filtering is a v2 idea, not part of this pass — flag it as a backlog item rather than guessing at a design for it now.

## 3. Visual identity cleanup (point 6)

- Remove the blue→green gradient bar under the Orbit wordmark (`Home.jsx`, the `h-[3px] bg-gradient-to-r ...` line). It reads as decoration, not brand.

## 4. Navigation restructure (points 12, 15, 16, 17)

Old bottom nav: Home · Nearby · Chat · Explore · Profile
**New bottom nav: Home · Explore · Events · Profile** (4 items, Instagram/Telegram-style — fewer, denser, more deliberate).

- **Nearby — removed** (point 12), consistent with dropping geolocation.
- **"Chat" tab → "Explore"** (point 15): two sub-tabs, **Clubs** and **Communities**, each a browsable directory (search + category filter). This is a directory/discovery surface, not a messaging surface.
- **Old "Explore/Discover" tab → "Events"** (point 16): interest-based event marketing feed. Registering for an event grants access to that event's dedicated community (event listing, registration, and community are one connected flow — not three separate features).
- **Top bar "+" → Locali-Tea** (point 17): **implemented.** Anonymous, campus-only gossip/confession feed. Any verified student can post text anonymously; other students "validate" it (True/Cap vote, like/dislike-style) and discuss it in a comment thread. Each post — and its entire comment thread — is only visible for 48 hours from posting, then it auto-expires and disappears (client-side expiry filter for now; a real backend would need a cron/TTL job, see BACKEND_ARCHITECTURE.docx note below). Community creation moved off the top bar entirely — it's now only reachable from Home's "Create" story bubble.

### Where does actual messaging live now?
Decision (confirmed): **no dedicated bottom-nav chat tab.** Messaging lives inside context:
- **Community chat** and **club chat** are a tab inside that community's/club's own detail page (alongside Posts/Members), same pattern the app already uses for tabs.
- **Direct messages (1:1) + chat requests** need *some* home since they don't belong inside a single community. Recommendation: a message icon in the top bar next to notifications (badge for unread), opening the existing requests/DM list. Flagged as an assumption — confirm or redirect before final implementation.

## 5. Clubs (point 8)

- New top-level entity, parallel to Communities: **official college clubs**, one platform. Distinguish from user-created Communities visually (e.g. a "Verified/Official" badge) since clubs are institutional, not student-started.
- Lives under the new Explore tab's "Clubs" sub-tab.
- Data model: club needs name, category, description, official logo/cover, member count, and (like communities) a unique handle + QR (point 13 applies to both).

## 6. Community/Club handles + QR (point 13)

- Every community and club gets a **unique handle** (e.g. `@dsa-grinders`), enforced unique at creation time, shown on its detail page.
- Every community/club detail page shows a **QR code** that deep-links to it (for posters, orientation day, word-of-mouth signup).

## 7. Events (point 16, detail)

- Dedicated feed, marketed by interest match (same interest-tagging system already used for communities).
- Event has: title, description, date/time, location (on-campus), cover image, category tags, and an attached **event community** (auto-created on event creation, or linked to an existing club/community).
- Registering for an event is the access gate to that event's community — registration, listing, and community membership are one flow, not separate steps.

## 8. Profile (point 18)

- Show only what matters: profile photo, name, handle, a short bio, and a **post grid** (photos/videos the student shares to represent themselves) — not a wall of stats/settings.
- Let students post photos/videos to their profile (self-representation to other students), not just show joined/created community tiles as today.
- Cut anything that doesn't serve "who is this person" at a glance — this directly answers point 9 (current UI reads as boring/generic) for the one screen students will judge hardest.

## 9. Visual design direction (points 6, 7, 9, 10, 11, 14, 19)

Full re-generation of every screen's UI, explicitly referencing **Instagram and Telegram** (and WhatsApp for chat-specific patterns) as the design bar — not just "make it nicer," but study their actual patterns and animations and apply the equivalents:

- **Stories row** (point 7): only show stories from communities/clubs the student has **already joined** — not a discovery surface, a "what's active where I belong" surface, same as IG stories only showing people you follow.
- **Search** (point 14): Instagram-style — recent searches, live-filtering result list with avatars, category chips.
- **Notifications** (point 14): Instagram-style grouping/density (avatar-led rows, grouped by recency, tap-through).
- **Motion**: reference IG/Telegram specifically for transition feel — spring-y modal presentation, list item press feedback, tab-switch crossfades, pull-to-refresh — not generic fades.
- Keep it "minimal but functional" (point 11) — the reference apps are dense with content but the *chrome* around that content is restrained. Don't over-decorate; let content (photos, avatars, activity) carry the visual interest.

## 10. Backend (point 20)

Covered in a separate document: **`BACKEND_ARCHITECTURE.docx`** — stack, schema, auth flow, and scaling plan sized for the first 10,000 students.

---

## Open questions (need a one-line answer each before final build)

1. ~~**"locali-tea"** — what does tapping this actually do? (point 17)~~ **Resolved & built** — see above.
2. ~~**DM/requests placement**~~ **Confirmed** — top-bar message icon, as built.
3. **Clubs data source** — will club info (name, category, official description/logo) be entered manually by an admin, or does the college provide a list? Affects whether we need an admin/moderation screen for clubs at launch.
