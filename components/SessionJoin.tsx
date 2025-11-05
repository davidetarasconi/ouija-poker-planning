'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SessionJoin() {
  const [userName, setUserName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const router = useRouter();

  const generateSessionId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName.trim()) {
      alert('Please enter your name');
      return;
    }

    const finalSessionId = mode === 'create' ? generateSessionId() : sessionId.toUpperCase();

    if (mode === 'join' && !finalSessionId) {
      alert('Please enter a session ID');
      return;
    }

    // Navigate to session
    router.push(`/session/${finalSessionId}?name=${encodeURIComponent(userName)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔮</div>
            <h1 className="text-4xl font-bold text-white mb-2">Ouija Poker</h1>
            <p className="text-white/70">Collaborative Planning Poker</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
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
                required
              />
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2 bg-white/10 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setMode('create')}
                className={`flex-1 py-2 rounded-md font-medium transition-all ${
                  mode === 'create'
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Create Session
              </button>
              <button
                type="button"
                onClick={() => setMode('join')}
                className={`flex-1 py-2 rounded-md font-medium transition-all ${
                  mode === 'join'
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Join Session
              </button>
            </div>

            {/* Session ID Input (only for join mode) */}
            {mode === 'join' && (
              <div>
                <label htmlFor="sessionId" className="block text-sm font-medium text-white/90 mb-2">
                  Session ID
                </label>
                <input
                  id="sessionId"
                  type="text"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value.toUpperCase())}
                  placeholder="Enter session ID"
                  className="w-full px-4 py-3 bg-white/20 text-white placeholder-white/50 rounded-lg border border-white/30 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 uppercase"
                  required
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 rounded-lg shadow-lg transform transition-all hover:scale-105 active:scale-95"
            >
              {mode === 'create' ? '🎯 Create New Session' : '🚀 Join Session'}
            </button>
          </form>

          {/* Info */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <h3 className="text-white font-semibold mb-2">How it works:</h3>
            <ul className="text-white/70 text-sm space-y-1">
              <li>• Create a session or join with a session ID</li>
              <li>• Vote by moving your cursor to story points</li>
              <li>• Switch to Ouija mode for collaborative estimation</li>
              <li>• Uses Fibonacci sequence: 1, 2, 3, 5, 8, 13, 21</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
