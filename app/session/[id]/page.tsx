'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import PlanningBoard from '@/components/PlanningBoard';
import { supabase } from '@/lib/supabase';
import { Session } from '@/types';

function SessionContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const userNameFromUrl = searchParams.get('name');
  const sessionNameFromUrl = searchParams.get('sessionName');

  const [userName, setUserName] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(!userNameFromUrl);
  const [sessionData, setSessionData] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch session data to display session name
  useEffect(() => {
    if (showNamePrompt) {
      fetchSessionData();
    }
  }, [showNamePrompt]);

  const fetchSessionData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .maybeSingle();

      if (!error && data) {
        setSessionData(data);
      }
    } catch (err) {
      console.error('Failed to fetch session:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      alert('Please enter your name');
      return;
    }
    // Update the URL with the name and hide the prompt
    router.push(`/session/${sessionId}?name=${encodeURIComponent(userName)}`);
    setShowNamePrompt(false);
  };

  // Show name prompt if user doesn't have a name
  if (showNamePrompt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🔮</div>
              <h1 className="text-4xl font-bold text-white mb-2">Join Session</h1>
              {loading && <p className="text-white/70 text-sm">Loading session details...</p>}
              {sessionData && (
                <div className="mt-3 p-3 bg-white/10 rounded-lg border border-white/20">
                  <p className="text-white font-semibold">{sessionData.session_name}</p>
                  <p className="text-white/60 text-sm">Session ID: {sessionData.id}</p>
                </div>
              )}
              {!loading && !sessionData && (
                <p className="text-white/70">Session ID: {sessionId}</p>
              )}
            </div>

            {/* Name Form */}
            <form onSubmit={handleNameSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white/90 mb-2">
                  Your Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 bg-white/20 text-white placeholder-white/50 rounded-lg border border-white/30 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 rounded-lg shadow-lg transform transition-all hover:scale-105 active:scale-95"
              >
                🚀 Join Session
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return <PlanningBoard sessionId={sessionId} userName={userNameFromUrl || userName} sessionName={sessionNameFromUrl || undefined} />;
}

export default function SessionPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    }>
      <SessionContent />
    </Suspense>
  );
}
