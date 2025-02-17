import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://svnkjfcbousrkdbfrebl.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;