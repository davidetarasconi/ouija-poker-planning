import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

export interface Session {
  id: string;
  story_name: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  session_id: string;
  name: string;
  cursor_x: number;
  cursor_y: number;
  vote_value: number | null;
  created_at: string;
}

export interface SessionState {
  mode: 'voting' | 'ouija';
  card_x: number;
  card_y: number;
  is_reset: boolean;
}
