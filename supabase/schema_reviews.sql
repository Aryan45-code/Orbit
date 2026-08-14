-- Orbit — Supabase schema, PART 4: beta testing reviews/feedback.
-- Run this AFTER schema.sql — SQL Editor → New query → paste → Run.
--
-- Shown as an optional prompt right before the app exits (Android back
-- button at the root screen — see ReviewPrompt.jsx / App.jsx). Star rating
-- and free-text feedback are both optional individually, but skipping the
-- whole prompt writes nothing at all (no forced row).
--
-- No client-facing select policy on purpose — testers don't need to read
-- reviews back, only submit them. View collected feedback from the
-- Supabase Table Editor / SQL Editor directly (that uses the dashboard's
-- own elevated access, not the app's RLS-restricted anon/authenticated role).

create table public.app_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  rating integer check (rating between 1 and 5),
  feedback text,
  created_at timestamptz not null default now()
);

alter table public.app_reviews enable row level security;

create policy "signed-in users can submit their own review"
  on public.app_reviews for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Not added to supabase_realtime — no reason for this to broadcast live.
