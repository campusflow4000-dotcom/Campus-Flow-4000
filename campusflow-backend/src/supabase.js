import { createClient } from "@supabase/supabase-js";
import { config } from "./config.js";

// Service-role client: server-side only, bypasses RLS. Never expose this key to the browser.
export const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
