-- Run this ONCE on your existing Supabase project to remove the
-- @muj.manipal.edu-only signup restriction for the first beta round
-- (personal/private emails needed since campus-mail deliverability via
-- Brevo couldn't be fixed before launch — see README §2).
-- SQL Editor → New query → paste → Run.

drop trigger if exists enforce_muj_email_domain_trigger on auth.users;
drop function if exists public.enforce_muj_email_domain();

-- Note: on_auth_user_created / handle_new_user() (auto-creates the profiles
-- row) is untouched and still runs for every signup, any domain included.
