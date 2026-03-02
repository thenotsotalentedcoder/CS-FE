import { createClient } from '@supabase/supabase-js';

// Anon key — safe for frontend
// Used ONLY for: auth.signInWithPassword, auth.signUp, auth.signOut,
// auth.getSession, auth.onAuthStateChange, and Storage public URLs.
// All data operations go through the Express backend.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
