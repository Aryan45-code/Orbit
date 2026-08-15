-- Orbit — Supabase schema, PART 8: delete posts/messages/tea, post + chat
-- images, a community "status" image (admin-only, WhatsApp-status style —
-- one current image, replaceable anytime, everyone can view), and a shared
-- sticker pack (any signed-in user can add a sticker image; no custom art
-- ships with this migration, upload real images after running it).
-- Run this AFTER schema_content.sql, schema_tea.sql, and
-- schema_security_hardening.sql — SQL Editor → New query → paste this file
-- only → Run.

-- ============================================================
-- 1. DELETE — posts/messages: the poster can always delete their own; a
-- community's creator can delete anything posted inside their community
-- (moderation). community_posts already has an author-delete policy from
-- schema_content.sql — this adds the matching one for community_messages,
-- plus the admin/creator policy for both. Multiple permissive policies on
-- the same command are OR'd by Postgres, so these stack safely.
-- ============================================================
create policy "author can delete their own message"
  on public.community_messages for delete
  to authenticated
  using (auth.uid() = author_id);

create policy "community creator can delete any post in their community"
  on public.community_posts for delete
  to authenticated
  using (
    exists (
      select 1 from public.communities
      where id = community_posts.community_id and creator_id = auth.uid()
    )
  );

create policy "community creator can delete any message in their community"
  on public.community_messages for delete
  to authenticated
  using (
    exists (
      select 1 from public.communities
      where id = community_messages.community_id and creator_id = auth.uid()
    )
  );

-- Locali-Tea had NO delete policy at all before this (posts/comments were
-- permanent until the 48h expiry hid them). Tea isn't tied to a community,
-- so there's no per-community admin here — the Orbit community's creator
-- doubles as the app-wide moderator for anonymous content, since that's
-- the only admin role this app has.
create policy "author can delete their own tea post"
  on public.tea_posts for delete
  to authenticated
  using (auth.uid() = author_id);

create policy "author can delete their own tea comment"
  on public.tea_comments for delete
  to authenticated
  using (auth.uid() = author_id);

create policy "orbit admin can delete any tea post"
  on public.tea_posts for delete
  to authenticated
  using (
    exists (select 1 from public.communities where handle = 'orbit' and creator_id = auth.uid())
  );

create policy "orbit admin can delete any tea comment"
  on public.tea_comments for delete
  to authenticated
  using (
    exists (select 1 from public.communities where handle = 'orbit' and creator_id = auth.uid())
  );

-- ============================================================
-- 2. POST + CHAT IMAGES — real upload instead of the has_image placeholder
-- flag. Shared bucket for both post photos and chat images/stickers; path
-- convention is {auth.uid()}/{filename}, so ownership is just "owner ="
-- your own uid" (Supabase Storage sets `owner` automatically on upload).
-- ============================================================
alter table public.community_posts add column image_url text;
alter table public.community_messages add column image_url text;

insert into storage.buckets (id, name, public)
values ('community-media', 'community-media', true)
on conflict (id) do nothing;

create policy "members can upload their own community media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'community-media' and owner = auth.uid());

create policy "users can delete their own community media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'community-media' and owner = auth.uid());

-- ============================================================
-- 3. COMMUNITY STATUS IMAGE — admin-only "current status" image on the
-- community's own page (like a WhatsApp status: one current image, the
-- admin replaces it anytime, no history/expiry — keeping this simple for
-- now). Bucket is public so reads never need a storage RLS policy. Upload
-- path convention is {community_id}/..., enforced via storage.foldername()
-- so only that community's creator can write into its folder.
-- ============================================================
alter table public.communities add column avatar_url text;
grant update (avatar_url) on public.communities to authenticated;

insert into storage.buckets (id, name, public)
values ('community-avatars', 'community-avatars', true)
on conflict (id) do nothing;

create policy "community creator can upload their community's status image"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'community-avatars'
    and exists (
      select 1 from public.communities
      where id::text = (storage.foldername(name))[1]
        and creator_id = auth.uid()
    )
  );

create policy "community creator can replace their community's status image"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'community-avatars'
    and exists (
      select 1 from public.communities
      where id::text = (storage.foldername(name))[1]
        and creator_id = auth.uid()
    )
  );

create policy "community creator can remove their community's status image"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'community-avatars'
    and exists (
      select 1 from public.communities
      where id::text = (storage.foldername(name))[1]
        and creator_id = auth.uid()
    )
  );

-- ============================================================
-- 4. STICKERS — a shared, app-wide pack (not per-community): any signed-in
-- user can add a sticker image, everyone can see and send the full pack.
-- No artwork ships with this migration — the picker starts with a small
-- built-in emoji set client-side, and grows for real once someone uploads
-- an actual image here.
-- ============================================================
create table public.stickers (
  id uuid primary key default gen_random_uuid(),
  uploader_id uuid references public.profiles(id) on delete set null,
  image_url text not null,
  created_at timestamptz not null default now()
);

alter table public.stickers enable row level security;

create policy "stickers are readable by any signed-in user"
  on public.stickers for select
  to authenticated
  using (true);

create policy "signed-in users can add a sticker"
  on public.stickers for insert
  to authenticated
  with check (auth.uid() = uploader_id);

insert into storage.buckets (id, name, public)
values ('stickers', 'stickers', true)
on conflict (id) do nothing;

create policy "signed-in users can upload a sticker image"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'stickers' and owner = auth.uid());

-- Not added to supabase_realtime — the sticker pack changing live isn't
-- worth a subscription; the picker just refetches when opened.

-- ============================================================
-- 5. Length sanity, same posture as schema_security_hardening.sql.
-- ============================================================
alter table public.communities
  add constraint communities_avatar_url_length check (char_length(avatar_url) <= 2048);
alter table public.community_posts
  add constraint community_posts_image_url_length check (char_length(image_url) <= 2048);
alter table public.community_messages
  add constraint community_messages_image_url_length check (char_length(image_url) <= 2048);
alter table public.stickers
  add constraint stickers_image_url_length check (char_length(image_url) <= 2048);
