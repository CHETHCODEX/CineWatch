import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL or Anon Key missing in environment variables. Offline fallback active.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
