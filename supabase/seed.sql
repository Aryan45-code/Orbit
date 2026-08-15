-- Orbit — seed data for the launch build. Run AFTER schema.sql (+ the other
-- schema_*.sql files), in Supabase Dashboard -> SQL Editor.
--
-- Trimmed down for the first test round: the earlier version of this file
-- seeded 36 sample communities, 10 official clubs, and 4 sample events —
-- all removed. This version seeds exactly ONE real, joinable community:
-- "Orbit" itself, meant as the place testers discuss the app (bugs,
-- feedback, requests) using the app's own real posts/chat/members features.
--
-- WARNING — safe to re-run, but destructive: it deletes ALL rows in
-- communities and events first (cascades to community_members,
-- community_posts, community_messages, event_registrations too), not just
-- the old seed rows. If any tester has already created their own real
-- community by the time you run this, that gets wiped as well.
delete from public.events;
delete from public.communities;

-- official=false so this shows up under the regular Communities list (Home
-- feed + Explore's Communities sub-tab), not tucked away under "Clubs".
insert into public.communities (name, category, tags, description, member_count, creator_label, official, handle) values
  ('Orbit', 'Networking & Social', ARRAY['Networking & Social'], 'The official space to talk about Orbit itself while we''re testing — bugs, ideas, what''s confusing, what you want next. Join in.', 0, 'Orbit Team', false, 'orbit');
