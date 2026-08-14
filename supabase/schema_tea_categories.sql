-- Orbit — Supabase schema, PART 5: Locali-Tea "Tea" vs "Confessions" split.
-- Run this AFTER schema_tea.sql — SQL Editor → New query → paste → Run.
--
-- Tea posts keep the existing true/cap validation voting (tea_votes,
-- unchanged). Confession posts use a different interaction — a small set of
-- emoji reactions (one per user per post, changeable) instead of a
-- true/false judgment, since a confession isn't something to fact-check.
-- Same anonymity posture as the rest of Locali-Tea: reaction authorship is
-- stored (needed for the one-reaction-per-user constraint) but each user can
-- only ever read their OWN reaction rows.

alter table public.tea_posts
  add column category text not null default 'tea' check (category in ('tea', 'confession'));

alter table public.tea_posts
  add column reactions jsonb not null default '{}'::jsonb;

grant select (category, reactions) on public.tea_posts to authenticated;

create table public.tea_reactions (
  post_id uuid references public.tea_posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  emoji text not null,
  primary key (post_id, user_id)
);

alter table public.tea_reactions enable row level security;

create policy "users can read their own tea reactions"
  on public.tea_reactions for select
  to authenticated
  using (auth.uid() = user_id);

create policy "users can add their own tea reaction"
  on public.tea_reactions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "users can change their own tea reaction"
  on public.tea_reactions for update
  to authenticated
  using (auth.uid() = user_id);

create policy "users can remove their own tea reaction"
  on public.tea_reactions for delete
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.sync_tea_reaction_counts()
returns trigger
language plpgsql
security definer
as $$
begin
  if TG_OP = 'INSERT' then
    update public.tea_posts
      set reactions = jsonb_set(reactions, array[new.emoji], to_jsonb(coalesce((reactions->>new.emoji)::int, 0) + 1))
      where id = new.post_id;
  elsif TG_OP = 'UPDATE' then
    if old.emoji <> new.emoji then
      update public.tea_posts
        set reactions = jsonb_set(reactions, array[old.emoji], to_jsonb(greatest(0, coalesce((reactions->>old.emoji)::int, 0) - 1)))
        where id = old.post_id;
      update public.tea_posts
        set reactions = jsonb_set(reactions, array[new.emoji], to_jsonb(coalesce((reactions->>new.emoji)::int, 0) + 1))
        where id = new.post_id;
    end if;
  elsif TG_OP = 'DELETE' then
    update public.tea_posts
      set reactions = jsonb_set(reactions, array[old.emoji], to_jsonb(greatest(0, coalesce((reactions->>old.emoji)::int, 0) - 1)))
      where id = old.post_id;
  end if;
  return null;
end;
$$;

create trigger tea_reactions_sync_counts
  after insert or update or delete on public.tea_reactions
  for each row execute function public.sync_tea_reaction_counts();

-- No realtime here either — same reasoning as the rest of Locali-Tea
-- (schema_tea.sql): would leak reaction authorship over the websocket.
