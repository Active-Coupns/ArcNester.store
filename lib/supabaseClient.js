import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SUPABASE_URL.trim() : '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim() : '';

console.log('[Supabase Client] Initializing Client with URL:', supabaseUrl || 'MISSING_URL');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase Client] Critical Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing from environment variables!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
