-- Orbit — PART 8: backend bug fixes.
-- Run after every other schema_*.sql. Additive; no rows are rewritten.
-- Ships with the matching App.jsx change (§2) — deploy both together.

-- 1. SECURITY DEFINER functions had a mutable search_path (hijackable, and
--    what Supabase's linter flags as function_search_path_mutable).
--    Bodies unchanged; only `set search_path` is added.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- on conflict: a signup retry would otherwise abort the auth.users insert
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.sync_member_count()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if TG_OP = 'INSERT' then
    update public.communities set member_count = member_count + 1 where id = new.community_id;
  elsif TG_OP = 'DELETE' then
    update public.communities set member_count = greatest(0, member_count - 1) where id = old.community_id;
  end if;
  return null;
end;
$$;

create or replace function public.sync_post_spark_count()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if TG_OP = 'INSERT' then
    update public.community_posts set spark_count = spark_count + 1 where id = new.post_id;
  elsif TG_OP = 'DELETE' then
    update public.community_posts set spark_count = greatest(0, spark_count - 1) where id = old.post_id;
  end if;
  return null;
end;
$$;

create or replace function public.sync_tea_comment_count()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if TG_OP = 'INSERT' then
    update public.tea_posts set comment_count = comment_count + 1 where id = new.post_id;
  elsif TG_OP = 'DELETE' then
    update public.tea_posts set comment_count = greatest(0, comment_count - 1) where id = old.post_id;
  end if;
  return null;
end;
$$;

-- ALTER avoids restating these bodies and drifting from schema_tea*.sql
alter function public.sync_tea_vote_counts() set search_path = public, pg_temp;
alter function public.sync_tea_reaction_counts() set search_path = public, pg_temp;
alter function public.register_for_event(uuid) set search_path = public, pg_temp;

-- 2. INSERT had no column restrictions on any table. RLS `with check` gates
--    which rows may be written, not which columns carry attacker-chosen
--    values — so a user could self-issue `official = true` (the "Official
--    club" badge), set member_count, pre-load tea vote counts, insert an
--    already-pinned post, or claim role = 'admin'.
--    Omitted columns now fall back to their DEFAULT and can't be supplied.

revoke insert on public.communities from authenticated;
grant insert (name, category, tags, description, creator_id, creator_label, handle)
  on public.communities to authenticated;

revoke insert on public.community_posts from authenticated;
grant insert (community_id, author_id, text, image_url)
  on public.community_posts to authenticated;

revoke insert on public.community_messages from authenticated;
grant insert (community_id, author_id, text, image_url)
  on public.community_messages to authenticated;

revoke insert on public.community_members from authenticated;
grant insert (community_id, user_id) on public.community_members to authenticated;

revoke insert on public.community_post_sparks from authenticated;
grant insert (post_id, user_id) on public.community_post_sparks to authenticated;

revoke insert on public.tea_posts from authenticated;
grant insert (author_id, text, category) on public.tea_posts to authenticated;

revoke insert on public.tea_comments from authenticated;
grant insert (post_id, author_id, text) on public.tea_comments to authenticated;

revoke insert on public.tea_votes from authenticated;
grant insert (post_id, user_id, vote) on public.tea_votes to authenticated;

revoke insert on public.tea_reactions from authenticated;
grant insert (post_id, user_id, emoji) on public.tea_reactions to authenticated;

revoke insert on public.reports from authenticated;
grant insert (reporter_id, target, reason) on public.reports to authenticated;

revoke insert on public.stickers from authenticated;
grant insert (uploader_id, image_url) on public.stickers to authenticated;

-- belt and braces if the grants above are ever widened again
drop policy if exists "signed-in users can create a community" on public.communities;
create policy "signed-in users can create a community"
  on public.communities for insert
  to authenticated
  with check (
    auth.uid() = creator_id
    and official = false
    and member_count = 0
  );

-- 3. UPDATE policies had no WITH CHECK, so only the targeted row was gated,
--    not the resulting row (e.g. reassigning creator_id).

drop policy if exists "creator can update or delete their own community" on public.communities;
create policy "creator can update their own community"
  on public.communities for update
  to authenticated
  using (auth.uid() = creator_id)
  with check (auth.uid() = creator_id);

drop policy if exists "users can update their own profile" on public.profiles;
create policy "users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 4. Account deletion always failed: profiles cascades from auth.users, but
--    communities.creator_id had no ON DELETE action, so deleting a user who
--    had created any community aborted on an FK violation.
--    SET NULL leaves the community unowned, same as the seeded "Orbit" one.

alter table public.communities
  drop constraint if exists communities_creator_id_fkey;
alter table public.communities
  add constraint communities_creator_id_fkey
  foreign key (creator_id) references public.profiles(id) on delete set null;

-- 5. register_for_event() ignored capacity — the UI advertises "N spots" and
--    the RPC registered the N+1st. Counting inside the existing `for update`
--    lock keeps concurrent registrations from both reading a stale count.

create or replace function public.register_for_event(p_event_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_event record;
  v_community_id uuid;
  v_taken integer;
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_event from public.events where id = p_event_id for update;
  if not found then
    raise exception 'Event not found';
  end if;

  -- already registered: don't count them against capacity twice
  if exists (
    select 1 from public.event_registrations
    where event_id = p_event_id and user_id = v_user_id
  ) then
    return v_event.linked_community_id;
  end if;

  select count(*) into v_taken
  from public.event_registrations
  where event_id = p_event_id;

  if v_taken >= v_event.capacity then
    raise exception 'Event is full';
  end if;

  if v_event.linked_community_id is null then
    insert into public.communities (
      name, category, tags, description, member_count, creator_label, official, handle
    )
    values (
      v_event.title || ' — Event Group',
      v_event.category,
      v_event.tags,
      'Coordination space for ' || v_event.title || '. Registered attendees only.',
      0,
      'EventSystem',
      false,
      lower(regexp_replace(v_event.title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(v_event.id::text, 1, 6)
    )
    returning id into v_community_id;

    update public.events set linked_community_id = v_community_id where id = p_event_id;
  else
    v_community_id := v_event.linked_community_id;
  end if;

  insert into public.event_registrations (event_id, user_id)
  values (p_event_id, v_user_id)
  on conflict do nothing;

  insert into public.community_members (community_id, user_id)
  values (v_community_id, v_user_id)
  on conflict do nothing;

  return v_community_id;
end;
$$;

-- registering was one-way: no DELETE policy meant nobody could cancel
create policy "users can cancel their own registration"
  on public.event_registrations for delete
  to authenticated
  using (auth.uid() = user_id);

-- 6. profiles.bio — the Edit-profile bio was React state only and vanished on
--    reload. Name edits after onboarding were never persisted either.

alter table public.profiles
  add column if not exists bio text not null default '';

alter table public.profiles
  drop constraint if exists profiles_bio_length;
alter table public.profiles
  add constraint profiles_bio_length check (char_length(bio) <= 160);

-- re-grant: the §11 pass enumerated columns, so a new one isn't covered
grant select (id, name, interests, bio, created_at) on public.profiles to authenticated;
grant update (name, interests, bio) on public.profiles to authenticated;

-- 7. Expired tea rows were only hidden by RLS, never deleted — the text sat
--    next to author_id forever, for a feature that promises to disappear.
--    Needs pg_cron enabled (Dashboard → Database → Extensions) to schedule.

create or replace function public.purge_expired_tea()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_deleted integer;
begin
  -- votes, reactions and comments cascade from tea_posts
  delete from public.tea_posts where created_at <= now() - interval '48 hours';
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

revoke execute on function public.purge_expired_tea() from authenticated, anon;

-- select cron.schedule('purge-expired-tea', '0 * * * *', $$select public.purge_expired_tea()$$);

-- 8. Missing indexes. Composite PKs only serve queries leading with their
--    first column, so filtering these by user_id alone was a seq scan — and
--    Postgres indexes no foreign keys, so opening any community scanned every
--    post and message in the app.

create index if not exists community_members_user_id_idx
  on public.community_members (user_id);

create index if not exists event_registrations_user_id_idx
  on public.event_registrations (user_id);

create index if not exists community_post_sparks_user_id_idx
  on public.community_post_sparks (user_id);

create index if not exists tea_votes_user_id_idx
  on public.tea_votes (user_id);

create index if not exists tea_reactions_user_id_idx
  on public.tea_reactions (user_id);

-- composite order matches the feed queries, so the sort is skipped too
create index if not exists community_posts_community_created_idx
  on public.community_posts (community_id, created_at desc);

create index if not exists community_messages_community_created_idx
  on public.community_messages (community_id, created_at);

create index if not exists tea_comments_post_created_idx
  on public.tea_comments (post_id, created_at);

create index if not exists tea_posts_created_at_idx
  on public.tea_posts (created_at desc);

-- 9. Stickers are a global pack shown in every chat, but had no DELETE policy
--    at all — one bad upload was permanently visible app-wide.

create policy "uploader can delete their own sticker"
  on public.stickers for delete
  to authenticated
  using (auth.uid() = uploader_id);

create policy "orbit admin can delete any sticker"
  on public.stickers for delete
  to authenticated
  using (
    exists (
      select 1 from public.communities
      where handle = 'orbit' and creator_id = auth.uid()
    )
  );

-- 10. Buckets were created with only (id, name, public): any size, any type,
--     including .html/.svg with script served from your own domain.

update storage.buckets
set file_size_limit = 5242880, -- 5 MB
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
where id in ('community-media', 'community-avatars', 'stickers');
