-- Orbit — Supabase schema, PART 6: pinning a message in community chat.
-- Run this AFTER schema_content.sql — SQL Editor → New query → paste → Run.
--
-- Mirrors community_posts.pinned exactly: a boolean column, only the
-- community's creator can set it, only one message pinned at a time
-- (enforced client-side in Community.jsx, same as post pinning).

alter table public.community_messages
  add column pinned boolean not null default false;

create policy "community creator can pin or unpin chat messages"
  on public.community_messages for update
  to authenticated
  using (
    exists (
      select 1 from public.communities
      where id = community_messages.community_id and creator_id = auth.uid()
    )
  );

-- Reminder: the seeded "Orbit" community (supabase/seed.sql) has
-- creator_id = null, so nobody is its admin yet and nobody can pin there
-- until you claim it. Run this ONCE, after you've signed up in the app with
-- your real email (the row in auth.users has to exist first) — no need to
-- look up your uuid manually, this finds it from your email directly:
--
--   update public.communities
--   set creator_id = (select id from auth.users where email = 'YOUR_EMAIL_HERE')
--   where handle = 'orbit';
