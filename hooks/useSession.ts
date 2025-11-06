'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User, Mode } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export function useSession(sessionId: string, userName: string, sessionName?: string) {
  const [session, setSession] = useState<Session | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId] = useState(() => uuidv4());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Initialize session
  useEffect(() => {
    async function initSession() {
      try {
        // Check environment variables
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error(
            'Supabase is not configured. Please set up your .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. See SETUP.md for instructions.'
          );
        }

        console.log('Initializing session:', sessionId);

        // Fetch or create session - use maybeSingle() to avoid errors when no rows exist
        const { data: sessionData, error: sessionError } = await supabase
          .from('sessions')
          .select('*')
          .eq('id', sessionId)
          .maybeSingle();

        console.log('Session query result:', { sessionData, sessionError });

        if (sessionError) {
          console.error('Session error details:', {
            message: sessionError.message,
            details: sessionError.details,
            hint: sessionError.hint,
            code: sessionError.code,
          });
          throw new Error(`Database error: ${sessionError.message}. Check if tables are created in Supabase.`);
        }

        if (!sessionData) {
          // Create new session using upsert to handle race conditions
          console.log('Creating new session...');
          const { error: createError } = await supabase
            .from('sessions')
            .upsert({
              id: sessionId,
              session_name: sessionName || 'Planning Session',
              story_name: 'User Story',
              mode: 'voting',
              card_x: 50,
              card_y: 50,
            }, {
              onConflict: 'id',
              ignoreDuplicates: true
            });

          if (createError) {
            console.error('Create session error:', {
              message: createError.message,
              details: createError.details,
              hint: createError.hint,
            });
            throw new Error(`Failed to create session: ${createError.message}`);
          }

          // Fetch the session (whether it was just created or already existed)
          const { data: fetchedSession, error: fetchError } = await supabase
            .from('sessions')
            .select('*')
            .eq('id', sessionId)
            .single();

          if (fetchError || !fetchedSession) {
            console.error('Failed to fetch session after upsert:', fetchError);
            throw new Error(`Failed to fetch session: ${fetchError?.message || 'Unknown error'}`);
          }

          console.log('Session created/fetched:', fetchedSession);
          setSession(fetchedSession);
        } else {
          console.log('Session found:', sessionData);
          setSession(sessionData);
        }

        // Create or update user
        console.log('Creating user:', { currentUserId, userName });
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

        if (userError) {
          console.error('User error:', {
            message: userError.message,
            details: userError.details,
            hint: userError.hint,
          });
          throw new Error(`Failed to create user: ${userError.message}`);
        }

        // Fetch all users
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*')
          .eq('session_id', sessionId);

        if (usersError) {
          console.error('Users fetch error:', usersError);
          throw new Error(`Failed to fetch users: ${usersError.message}`);
        }
        console.log('Users fetched:', usersData);
        setUsers(usersData || []);

        console.log('Session initialized successfully');
        setLoading(false);
      } catch (err) {
        console.error('Error initializing session:', err);
        const errorMessage = err instanceof Error
          ? err.message
          : 'Failed to initialize session. Please check your Supabase configuration.';
        setError(errorMessage);
        setLoading(false);
      }
    }

    initSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps

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

  const updateSessionName = useCallback(
    async (name: string) => {
      await supabase
        .from('sessions')
        .update({ session_name: name, updated_at: new Date().toISOString() })
        .eq('id', sessionId);
    },
    [sessionId]
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
    updateSessionName,
    updateStoryName,
    updateMode,
    updateCardPosition,
    resetVotes,
  };
}
