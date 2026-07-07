import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

(() => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('CRITICAL_INITIALIZATION_FAILURE: Environment properties missing.');
  }
  try {
    const urlObj = new URL(supabaseUrl);
    if (urlObj.hostname.split('.')[0] !== 'klxzihjdnpkogwuqcuau') {
      throw new Error('INSTANCE_MISMATCH: Subdomain mapping failure.');
    }
  } catch (err) {
    throw new Error('MALFORMED_CONFIG: URL parsing failure inside client initialization.');
  }
})();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
