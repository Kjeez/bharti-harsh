import { createClient } from "@supabase/supabase-js";

// Server-side only. Never import this in a client component.
let _client = null;

export function supabaseAdmin() {
  if (!_client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env vars");
    }
    _client = createClient(url, key, { auth: { persistSession: false } });
  }
  return _client;
}
