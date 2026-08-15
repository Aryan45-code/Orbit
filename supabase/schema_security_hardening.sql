-- Orbit — Supabase schema, PART 7: security hardening pass before wider APK
-- sharing. Run this AFTER schema_content.sql, schema_tea.sql,
-- schema_tea_categories.sql, and schema_chat_pin.sql — SQL Editor -> New
-- query -> paste this file only -> Run.
--
-- Everything below is additive (GRANT/REVOKE + new CHECK constraints + one
-- new table + one new policy) — it does not touch existing data and is safe
-- to run on a live project. Nothing here requires an app rebuild except the
-- new "report a post" wiring and member-removal button (already included in
-- this handoff's JS changes).

-- ============================================================
-- 1. CRITICAL: profiles.email was readable by every signed-in user.
-- The "profiles are readable by any signed-in user" policy in schema.sql
-- allows reading ANY row (using (true)) — with no column-level grant, that
-- meant every user's real email address (now often a personal/private email
-- since the campus-domain lock was dropped) was fetchable by any other
-- signed-in user via a plain `select * from profiles`. The app UI never
-- displayed this, but nothing server-side stopped a direct API call. The
-- client never needs another user's email (it only ever selects name /
-- interests), so this closes the leak with zero app-side impact.
-- ============================================================
revoke select on public.profiles from authenticated;
grant select (id, name, interests, created_at) on public.profiles to authenticated;

-- Also lock down which columns a user can UPDATE on their own profile row —
-- previously the "users can update their own profile" policy had no column
-- restriction, so a user could rewrite their own `email` field to anything
-- (cosmetic/integrity issue, since it doesn't match their real auth email).
revoke update on public.profiles from authenticated;
grant update (name, interests) on public.profiles to authenticated;

alter table public.profiles
  add constraint profiles_name_length check (char_length(name) <= 60);

-- ============================================================
-- 2. Pin toggles had no column restriction. The "community creator can pin
-- or unpin posts/messages" UPDATE policies (schema_content.sql,
-- schema_chat_pin.sql) only restrict which ROWS a creator can touch, not
-- which COLUMNS — so a community's creator could, via a direct API call
-- (not through the app UI, which only ever sends {pinned}), rewrite a
-- post/message's text or reassign its author. Restricting the grant to the
-- `pinned` column only closes that gap; the app needs no changes since it
-- never touched other columns anyway.
-- ============================================================
revoke update on public.community_posts from authenticated;
grant update (pinned) on public.community_posts to authenticated;

revoke update on public.community_messages from authenticated;
grant update (pinned) on public.community_messages to authenticated;

alter table public.community_posts
  add constraint community_posts_text_length check (char_length(text) <= 2000);
alter table public.community_messages
  add constraint community_messages_text_length check (char_length(text) <= 1000);

-- ============================================================
-- 3. communities UPDATE had no column restriction either — a creator could
-- flip `official` to true (fake an official-club badge), reassign
-- `creator_id`, or hand-edit `member_count`/`handle`/`linked_event_id`,
-- none of which the Community Settings UI ever sends (it only sends name /
-- category / tags / description).
-- ============================================================
revoke update on public.communities from authenticated;
grant update (name, category, tags, description) on public.communities to authenticated;

alter table public.communities
  add constraint communities_name_length check (char_length(name) <= 80),
  add constraint communities_description_length check (char_length(description) <= 800);

-- ============================================================
-- 4. tea_votes / tea_reactions UPDATE had no column restriction — a user
-- could, via direct API call, UPDATE their own vote/reaction row's post_id
-- to point at a different post (their own row, so RLS's row check still
-- passes), which would silently desync the true_count/cap_count/reactions
-- triggers (they only react to the vote/emoji value changing, not post_id).
-- Restricting the grant to the value column only is what the app already
-- does client-side, so no JS change needed.
-- ============================================================
revoke update on public.tea_votes from authenticated;
grant update (vote) on public.tea_votes to authenticated;

revoke update on public.tea_reactions from authenticated;
grant update (emoji) on public.tea_reactions to authenticated;

-- Confessions only ever use this fixed emoji set client-side (LocaliTea.jsx)
-- — enforce it server-side too, same as tea_votes already restricts
-- vote to ('true','cap').
alter table public.tea_reactions
  add constraint tea_reactions_emoji_allowed check (emoji in ('😂', '❤️', '😮', '😢', '🔥'));

alter table public.tea_posts
  add constraint tea_posts_text_length check (char_length(text) <= 2000);
alter table public.tea_comments
  add constraint tea_comments_text_length check (char_length(text) <= 1000);

-- ============================================================
-- 5. Community creators can now actually remove a member (the "Remove"
-- button in the Members tab was previously dead — no handler, no policy).
-- Multiple permissive DELETE policies on the same table are OR'd by
-- Postgres, so this stacks with the existing "users can leave" policy
-- without touching it.
-- ============================================================
create policy "community creator can remove a member"
  on public.community_members for delete
  to authenticated
  using (
    exists (
      select 1 from public.communities
      where id = community_members.community_id
        and creator_id = auth.uid()
        and creator_id <> community_members.user_id -- creator can't self-target via this policy
    )
  );

-- ============================================================
-- 6. Reports (Report button on communities/posts/tea) were entirely fake —
-- ReportModal submitted to a console.log only, nothing was ever persisted.
-- Real table now, same posture as app_reviews: insert-only from the client,
-- you read submissions from the Supabase dashboard directly.
-- ============================================================
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  target text not null,
  reason text not null,
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

create policy "signed-in users can submit a report"
  on public.reports for insert
  to authenticated
  with check (auth.uid() = reporter_id);

-- Not added to supabase_realtime — no reason for this to broadcast live.
