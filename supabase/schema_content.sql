-- Orbit — Supabase schema, PART 2: community posts, post sparks, community chat.
-- Run this AFTER schema.sql (and after seed.sql if you're using it) —
-- SQL Editor → New query → paste this file only → Run.
-- This makes the Community Detail page's Posts/Chat/Members tabs fully real
-- (previously fabricated client-side on every navigation). Members needed no
-- new table — it now reads the existing community_members + profiles tables
-- instead of the old genMembers() fake-name generator.

-- ============================================================
-- 6. COMMUNITY POSTS — real posts inside a community
-- ============================================================
create table public.community_posts (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  has_image boolean not null default false,
  spark_count integer not null default 0,
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.community_posts enable row level security;

create policy "posts are readable by any signed-in user"
  on public.community_posts for select
  to authenticated
  using (true);

create policy "members can post in communities they've joined"
  on public.community_posts for insert
  to authenticated
  with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.community_members
      where community_id = community_posts.community_id and user_id = auth.uid()
    )
  );

create policy "community creator can pin or unpin posts"
  on public.community_posts for update
  to authenticated
  using (
    exists (
      select 1 from public.communities
      where id = community_posts.community_id and creator_id = auth.uid()
    )
  );

create policy "author can delete their own post"
  on public.community_posts for delete
  to authenticated
  using (auth.uid() = author_id);

-- Sparks (likes) on posts — one row per user per post, toggled on/off.
-- spark_count on community_posts stays in sync via trigger, same pattern
-- as sync_member_count() in schema.sql.
create table public.community_post_sparks (
  post_id uuid references public.community_posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  primary key (post_id, user_id)
);

alter table public.community_post_sparks enable row level security;

create policy "spark rows are readable by any signed-in user"
  on public.community_post_sparks for select
  to authenticated
  using (true);

create policy "users can spark a post (insert their own row)"
  on public.community_post_sparks for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "users can un-spark a post (delete their own row)"
  on public.community_post_sparks for delete
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.sync_post_spark_count()
returns trigger
language plpgsql
security definer
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

create trigger community_post_sparks_sync_count
  after insert or delete on public.community_post_sparks
  for each row execute function public.sync_post_spark_count();

-- ============================================================
-- 7. COMMUNITY CHAT — real group chat inside a community
-- ============================================================
create table public.community_messages (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

alter table public.community_messages enable row level security;

create policy "messages are readable by any signed-in user"
  on public.community_messages for select
  to authenticated
  using (true);

create policy "members can send messages in communities they've joined"
  on public.community_messages for insert
  to authenticated
  with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.community_members
      where community_id = community_messages.community_id and user_id = auth.uid()
    )
  );

-- ============================================================
-- 8. REALTIME (part 2) — live posts/sparks/chat across everyone's screen
-- ============================================================
alter publication supabase_realtime add table public.community_posts;
alter publication supabase_realtime add table public.community_post_sparks;
alter publication supabase_realtime add table public.community_messages;
