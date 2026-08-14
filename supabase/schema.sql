-- Orbit — Supabase schema (core flow: auth, profiles, communities/clubs, events)
-- Run this in Supabase Dashboard → SQL Editor → New query → paste → Run.
-- Locali-Tea / DMs / notifications are intentionally NOT included here yet —
-- they stay on mock data for the first APK build per the core-flow-first priority.

-- ============================================================
-- 1. PROFILES — one row per verified user, auto-created on signup
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null,
  interests text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are readable by any signed-in user"
  on public.profiles for select
  to authenticated
  using (true);

create policy "users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Domain lock (OPTIONAL — NOT enabled by default in this file). Orbit was
-- originally built as an @muj.manipal.edu-only campus app; for the first
-- 200-person beta this was intentionally turned off so testers could sign
-- up with personal/private email (campus-mail deliverability via Brevo
-- couldn't be authenticated before launch). To re-enable campus-exclusivity
-- later, uncomment the function + trigger below and run them once.
--
-- create or replace function public.enforce_muj_email_domain()
-- returns trigger
-- language plpgsql
-- security definer
-- as $$
-- begin
--   if new.email !~* '^[^@]+@muj\.manipal\.edu$' then
--     raise exception 'Only @muj.manipal.edu email addresses are allowed';
--   end if;
--   return new;
-- end;
-- $$;
--
-- create trigger enforce_muj_email_domain_trigger
--   before insert on auth.users
--   for each row execute function public.enforce_muj_email_domain();

-- Auto-create a profiles row the moment someone completes OTP sign-in.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 2. COMMUNITIES — student communities AND official clubs
--    (official = true marks a college-run club)
-- ============================================================
create table public.communities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  tags text[] not null default '{}',
  description text not null default '',
  member_count integer not null default 0,
  creator_id uuid references public.profiles(id),
  creator_label text not null default 'You', -- 'College' | 'EventSystem' | display name
  official boolean not null default false,
  handle text unique not null,
  linked_event_id uuid,
  last_active_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.communities enable row level security;

create policy "communities are readable by anyone (incl. guests browsing)"
  on public.communities for select
  to anon, authenticated
  using (true);

create policy "signed-in users can create a community"
  on public.communities for insert
  to authenticated
  with check (auth.uid() = creator_id);

create policy "creator can update or delete their own community"
  on public.communities for update
  to authenticated
  using (auth.uid() = creator_id);

create policy "creator can delete their own community"
  on public.communities for delete
  to authenticated
  using (auth.uid() = creator_id);

-- ============================================================
-- 3. COMMUNITY MEMBERS — join/leave; member_count stays in sync via trigger
-- ============================================================
create table public.community_members (
  community_id uuid references public.communities(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  role text not null default 'member',
  primary key (community_id, user_id)
);

alter table public.community_members enable row level security;

create policy "membership rows are readable by any signed-in user"
  on public.community_members for select
  to authenticated
  using (true);

create policy "users can join (insert their own membership row)"
  on public.community_members for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "users can leave (delete their own membership row)"
  on public.community_members for delete
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.sync_member_count()
returns trigger
language plpgsql
security definer
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

create trigger community_members_sync_count
  after insert or delete on public.community_members
  for each row execute function public.sync_member_count();

-- ============================================================
-- 4. EVENTS + REGISTRATIONS
-- ============================================================
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  tags text[] not null default '{}',
  description text not null default '',
  event_when text not null,
  event_where text not null,
  capacity integer not null default 100,
  linked_community_id uuid references public.communities(id),
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;

create policy "events are readable by anyone"
  on public.events for select
  to anon, authenticated
  using (true);

create table public.event_registrations (
  event_id uuid references public.events(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  registered_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

alter table public.event_registrations enable row level security;

create policy "registrations are readable by any signed-in user"
  on public.event_registrations for select
  to authenticated
  using (true);

create policy "users can register themselves"
  on public.event_registrations for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Registering for an event is the access gate to its community — this RPC
-- creates the linked community on the first registration (or reuses it) and
-- joins the caller to it, in one atomic call. Mirrors handleRegisterEvent()
-- in App.jsx exactly, just server-side instead of client-side mock state.
create or replace function public.register_for_event(p_event_id uuid)
returns uuid
language plpgsql
security definer
as $$
declare
  v_event record;
  v_community_id uuid;
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_event from public.events where id = p_event_id for update;
  if not found then
    raise exception 'Event not found';
  end if;

  if v_event.linked_community_id is null then
    insert into public.communities (name, category, tags, description, member_count, creator_label, official, handle)
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

-- ============================================================
-- 5. REALTIME — so joined member counts / new communities update live
-- ============================================================
alter publication supabase_realtime add table public.communities;
alter publication supabase_realtime add table public.community_members;
alter publication supabase_realtime add table public.events;
alter publication supabase_realtime add table public.event_registrations;
