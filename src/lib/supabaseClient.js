import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Loud in dev, so a missing .env doesn't silently degrade into confusing
  // network errors deep inside a component.
  console.error(
    "Missing Supabase env vars. Copy .env.example to .env and fill in " +
    "VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY from your Supabase project's Settings -> API."
  );
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // no magic-link redirect flow — we use OTP codes
  },
});
