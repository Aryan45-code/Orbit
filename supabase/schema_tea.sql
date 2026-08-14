-- Orbit — Supabase schema, PART 3: Locali-Tea (anonymous, 48h confessions).
-- Run this AFTER schema.sql (and schema_content.sql, if you ran it) —
-- SQL Editor → New query → paste this file only → Run.
--
-- Anonymity design: author_id IS stored (Postgres needs it for the RLS
-- insert check and for future moderation), but it is never selectable by
-- normal users — column-level GRANTs below explicitly list only the
-- non-identifying columns. The client never requests author_id and
-- couldn't read it even if it tried. For the same reason, these three
-- tables are deliberately NOT added to the supabase_realtime publication:
-- postgres_changes broadcasts the full row (including author_id) to every
-- subscriber regardless of column grants, which would leak authorship.
-- The app instead refetches Locali-Tea on open/refresh — "real and
-- persistent" without the anonymity trade-off.

-- ============================================================
-- 9. TEA POSTS
-- ============================================================
create table public.tea_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  true_count integer not null default 0,
  cap_count integer not null default 0,
  comment_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.tea_posts enable row level security;

-- RLS also enforces the 48h expiry server-side (defense in depth — the
-- client's isTeaExpired()/teaTimeLeft() already filter, this just makes
-- sure an expired post can never be fetched even by a modified client).
create policy "tea posts are readable by any signed-in user while under 48h"
  on public.tea_posts for select
  to authenticated
  using (created_at > now() - interval '48 hours');

create policy "signed-in users can post tea"
  on public.tea_posts for insert
  to authenticated
  with check (auth.uid() = author_id);

revoke select on public.tea_posts from authenticated, anon;
grant select (id, text, true_count, cap_count, comment_count, created_at) on public.tea_posts to authenticated;

-- ============================================================
-- 10. TEA VOTES — "true" / "cap", one per user per post, toggleable
-- ============================================================
create table public.tea_votes (
  post_id uuid references public.tea_posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  vote text not null check (vote in ('true', 'cap')),
  primary key (post_id, user_id)
);

alter table public.tea_votes enable row level security;

-- Users can only ever see their OWN vote rows — nobody, including the app,
-- can look up who voted what on someone else's post.
create policy "users can read their own tea votes"
  on public.tea_votes for select
  to authenticated
  using (auth.uid() = user_id);

create policy "users can cast their own tea vote"
  on public.tea_votes for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "users can change their own tea vote"
  on public.tea_votes for update
  to authenticated
  using (auth.uid() = user_id);

create policy "users can remove their own tea vote"
  on public.tea_votes for delete
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.sync_tea_vote_counts()
returns trigger
language plpgsql
security definer
as $$
begin
  if TG_OP = 'INSERT' then
    if new.vote = 'true' then
      update public.tea_posts set true_count = true_count + 1 where id = new.post_id;
    else
      update public.tea_posts set cap_count = cap_count + 1 where id = new.post_id;
    end if;
  elsif TG_OP = 'UPDATE' then
    if old.vote <> new.vote then
      if old.vote = 'true' then
        update public.tea_posts set true_count = greatest(0, true_count - 1) where id = old.post_id;
      else
        update public.tea_posts set cap_count = greatest(0, cap_count - 1) where id = old.post_id;
      end if;
      if new.vote = 'true' then
        update public.tea_posts set true_count = true_count + 1 where id = new.post_id;
      else
        update public.tea_posts set cap_count = cap_count + 1 where id = new.post_id;
      end if;
    end if;
  elsif TG_OP = 'DELETE' then
    if old.vote = 'true' then
      update public.tea_posts set true_count = greatest(0, true_count - 1) where id = old.post_id;
    else
      update public.tea_posts set cap_count = greatest(0, cap_count - 1) where id = old.post_id;
    end if;
  end if;
  return null;
end;
$$;

create trigger tea_votes_sync_counts
  after insert or update or delete on public.tea_votes
  for each row execute function public.sync_tea_vote_counts();

-- ============================================================
-- 11. TEA COMMENTS — always displayed as "Anonymous", never attributed
-- ============================================================
create table public.tea_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.tea_posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

alter table public.tea_comments enable row level security;

create policy "tea comments are readable by any signed-in user"
  on public.tea_comments for select
  to authenticated
  using (true);

create policy "signed-in users can comment on tea posts"
  on public.tea_comments for insert
  to authenticated
  with check (auth.uid() = author_id);

revoke select on public.tea_comments from authenticated, anon;
grant select (id, post_id, text, created_at) on public.tea_comments to authenticated;

create or replace function public.sync_tea_comment_count()
returns trigger
language plpgsql
security definer
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

create trigger tea_comments_sync_count
  after insert or delete on public.tea_comments
  for each row execute function public.sync_tea_comment_count();

-- No realtime publication for tea_posts / tea_votes / tea_comments —
-- deliberate, see the anonymity note at the top of this file.
