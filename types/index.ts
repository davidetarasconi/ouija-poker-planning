export const FIBONACCI_VALUES = [1, 2, 3, 5, 8, 13, 21] as const;

export type FibonacciValue = typeof FIBONACCI_VALUES[number];

export type Mode = 'voting' | 'ouija';

export interface User {
  id: string;
  session_id: string;
  name: string;
  cursor_x: number;
  cursor_y: number;
  vote_value: number | null;
  created_at: string;
  last_seen: string;
}

export interface Session {
  id: string;
  session_name: string;
  story_name: string;
  mode: Mode;
  card_x: number;
  card_y: number;
  created_at: string;
  updated_at: string;
}

export interface CursorPosition {
  x: number;
  y: number;
  userId: string;
  userName: string;
}
