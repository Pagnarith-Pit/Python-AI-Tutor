import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = `http://localhost:${process.env.NEXT_PUBLIC_KONG_HTTP_PORT}`;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable");
}

// Use a global variable to ensure singleton pattern during hot reloads
let supabase: SupabaseClient;

declare global {
  var supabase: SupabaseClient | undefined;
}

if (!globalThis.supabase) {
  supabase = createClient(supabaseUrl, supabaseKey);
  globalThis.supabase = supabase;
} else {
  supabase = globalThis.supabase;
}

export default supabase;