'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User, Mode } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export function useSession(sessionId: string, userName: string) {
  const [session, setSession] = useState<Session | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId] = useState(() => uuidv4());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize session
  useEffect(() => {
    async function initSession() {
      try {
        // Fetch or create session
        const { data: sessionData, error: sessionError } = await supabase
          .from('sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (sessionError && sessionError.code !== 'PGRST116') {
          throw sessionError;
        }

        if (!sessionData) {
          // Create new session
          const { data: newSession, error: createError } = await supabase
            .from('sessions')
            .insert({
              id: sessionId,
              story_name: 'User Story',
              mode: 'voting',
              card_x: 50,
              card_y: 50,
            })
            .select()
            .single();

          if (createError) throw createError;
          setSession(newSession);
        } else {
          setSession(sessionData);
        }

        // Create or update user
        const { error: userError } = await supabase
          .from('users')
          .upsert({
            id: currentUserId,
            session_id: sessionId,
            name: userName,
            cursor_x: 50,
            cursor_y: 50,
            vote_value: null,
            last_seen: new Date().toISOString(),
          });

        if (userError) throw userError;

        // Fetch all users
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*')
          .eq('session_id', sessionId);

        if (usersError) throw usersError;
        setUsers(usersData || []);

        setLoading(false);
      } catch (err) {
        console.error('Error initializing session:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize session');
        setLoading(false);
      }
    }

    initSession();

    // Set up realtime subscriptions
    const sessionChannel = supabase
      .channel(`session:${sessionId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sessions', filter: `id=eq.${sessionId}` },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setSession(payload.new as Session);
          }
        }
      )
      .subscribe();

    const usersChannel = supabase
      .channel(`users:${sessionId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users', filter: `session_id=eq.${sessionId}` },
        async () => {
          // Refetch all users on any change
          const { data: usersData } = await supabase
            .from('users')
            .select('*')
            .eq('session_id', sessionId);
          if (usersData) setUsers(usersData);
        }
      )
      .subscribe();

    // Heartbeat to keep user presence alive
    const heartbeat = setInterval(async () => {
      await supabase
        .from('users')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', currentUserId);
    }, 10000);

    // Cleanup old users (last seen > 30 seconds ago)
    const cleanup = setInterval(async () => {
      const thirtySecondsAgo = new Date(Date.now() - 30000).toISOString();
      await supabase
        .from('users')
        .delete()
        .eq('session_id', sessionId)
        .lt('last_seen', thirtySecondsAgo);
    }, 15000);

    return () => {
      clearInterval(heartbeat);
      clearInterval(cleanup);
      sessionChannel.unsubscribe();
      usersChannel.unsubscribe();
      // Remove user on unmount
      supabase.from('users').delete().eq('id', currentUserId);
    };
  }, [sessionId, userName, currentUserId]);

  const updateCursorPosition = useCallback(
    (x: number, y: number) => {
      // Debounce updates
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      updateTimeoutRef.current = setTimeout(async () => {
        await supabase
          .from('users')
          .update({ cursor_x: x, cursor_y: y, last_seen: new Date().toISOString() })
          .eq('id', currentUserId);
      }, 50);
    },
    [currentUserId]
  );

  const updateVote = useCallback(
    async (value: number | null) => {
      await supabase
        .from('users')
        .update({ vote_value: value, last_seen: new Date().toISOString() })
        .eq('id', currentUserId);
    },
    [currentUserId]
  );

  const updateStoryName = useCallback(
    async (name: string) => {
      await supabase
        .from('sessions')
        .update({ story_name: name, updated_at: new Date().toISOString() })
        .eq('id', sessionId);
    },
    [sessionId]
  );

  const updateMode = useCallback(
    async (mode: Mode) => {
      await supabase
        .from('sessions')
        .update({ mode, updated_at: new Date().toISOString() })
        .eq('id', sessionId);
    },
    [sessionId]
  );

  const updateCardPosition = useCallback(
    async (x: number, y: number) => {
      await supabase
        .from('sessions')
        .update({ card_x: x, card_y: y, updated_at: new Date().toISOString() })
        .eq('id', sessionId);
    },
    [sessionId]
  );

  const resetVotes = useCallback(async () => {
    // Reset all user votes
    await supabase
      .from('users')
      .update({ vote_value: null, cursor_x: 50, cursor_y: 50 })
      .eq('session_id', sessionId);

    // Reset card position
    await supabase
      .from('sessions')
      .update({ card_x: 50, card_y: 50, updated_at: new Date().toISOString() })
      .eq('id', sessionId);
  }, [sessionId]);

  return {
    session,
    users,
    currentUserId,
    loading,
    error,
    updateCursorPosition,
    updateVote,
    updateStoryName,
    updateMode,
    updateCardPosition,
    resetVotes,
  };
}
