'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from '@/hooks/useSession';
import { FIBONACCI_VALUES, FibonacciValue } from '@/types';

interface Props {
  sessionId: string;
  userName: string;
  sessionName?: string;
}

export default function PlanningBoard({ sessionId, userName, sessionName }: Props) {
  const {
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
  } = useSession(sessionId, userName, sessionName);

  const boardRef = useRef<HTMLDivElement>(null);
  const [isEditingSession, setIsEditingSession] = useState(false);
  const [sessionNameInput, setSessionNameInput] = useState('');
  const [isEditingStory, setIsEditingStory] = useState(false);
  const [storyNameInput, setStoryNameInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  useEffect(() => {
    if (session) {
      setSessionNameInput(session.session_name);
      setStoryNameInput(session.story_name);
    }
  }, [session]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!boardRef.current) return;

    const rect = boardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Always update cursor position for both modes
    updateCursorPosition(x, y);

    // In voting mode, update vote based on cursor position
    if (session?.mode === 'voting') {
      const closestValue = getClosestFibonacci(x, y);
      const currentUser = users.find(u => u.id === currentUserId);
      if (currentUser?.vote_value !== closestValue) {
        updateVote(closestValue);
      }
    }

    // In Ouija mode, if user is "dragging", update the shared card position
    if (session?.mode === 'ouija' && isDragging) {
      updateCardPosition(x, y);
    }
  };

  const getClosestFibonacci = (x: number, y: number): number => {
    const positions = getFibonacciPositions();
    let minDistance = Infinity;
    let closest: FibonacciValue = FIBONACCI_VALUES[0];

    positions.forEach(({ value, x: vx, y: vy }) => {
      const distance = Math.sqrt(Math.pow(x - vx, 2) + Math.pow(y - vy, 2));
      if (distance < minDistance) {
        minDistance = distance;
        closest = value;
      }
    });

    return closest;
  };

  const getFibonacciPositions = () => {
    const radius = 40;
    const centerX = 50;
    const centerY = 50;

    return FIBONACCI_VALUES.map((value, index) => {
      const angle = (index / FIBONACCI_VALUES.length) * 2 * Math.PI - Math.PI / 2;
      return {
        value,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });
  };

  const getUserCardPosition = (user: typeof users[0]) => {
    // In voting mode, user's card is at their cursor position
    return { x: user.cursor_x, y: user.cursor_y };
  };

  const handleSaveSessionName = () => {
    if (sessionNameInput.trim()) {
      updateSessionName(sessionNameInput);
      setIsEditingSession(false);
    }
  };

  const handleSaveStoryName = () => {
    if (storyNameInput.trim()) {
      updateStoryName(storyNameInput);
      setIsEditingStory(false);
    }
  };

  const handleClearStoryName = () => {
    updateStoryName('User Story');
    setStoryNameInput('User Story');
    setIsEditingStory(false);
  };

  const handleShareLink = async () => {
    // Share only the session URL without the name parameter
    const baseUrl = window.location.origin;
    const sessionPath = `/session/${sessionId}`;
    const shareUrl = `${baseUrl}${sessionPath}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      console.error('Failed to copy link:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
        <div className="text-white text-2xl">Loading session...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
        <div className="bg-red-500 text-white p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const fibPositions = getFibonacciPositions();
  const sharedCardPosition = { x: session.card_x, y: session.card_y };
  const otherUsers = users.filter(u => u.id !== currentUserId);
  const currentUser = users.find(u => u.id === currentUserId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1">
              {/* Session Name */}
              {isEditingSession ? (
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={sessionNameInput}
                    onChange={(e) => setSessionNameInput(e.target.value)}
                    onBlur={handleSaveSessionName}
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveSessionName()}
                    className="flex-1 px-4 py-2 bg-white/20 text-white placeholder-white/50 rounded-lg border border-white/30 focus:outline-none focus:border-white/60"
                    placeholder="Enter session name"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveSessionName}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <h1
                  className="text-2xl font-bold text-white cursor-pointer hover:text-purple-200 transition-colors mb-1"
                  onClick={() => setIsEditingSession(true)}
                  title="Click to edit session name"
                >
                  {session.session_name}
                </h1>
              )}

              {/* Story Name */}
              <div className="mb-2">
                {isEditingStory ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={storyNameInput}
                      onChange={(e) => setStoryNameInput(e.target.value)}
                      onBlur={handleSaveStoryName}
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveStoryName()}
                      className="flex-1 px-3 py-1.5 bg-white/20 text-white placeholder-white/50 rounded-lg border border-white/30 focus:outline-none focus:border-white/60 text-sm"
                      placeholder="Enter user story name"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveStoryName}
                      className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleClearStoryName}
                      className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <div
                    className="cursor-pointer hover:text-white/80 transition-colors inline-flex items-center gap-2"
                    onClick={() => setIsEditingStory(true)}
                    title="Click to edit user story"
                  >
                    <span className="text-white/90 text-base font-medium">📖 Story:</span>
                    <span className="text-white font-semibold">{session.story_name}</span>
                  </div>
                )}
              </div>

              <p className="text-white/60 text-sm">Session ID: {sessionId}</p>
            </div>

            <div className="flex gap-3 flex-wrap">
              <div className="relative">
                <button
                  onClick={handleShareLink}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors shadow-lg"
                  title="Copy session link"
                >
                  📋 Share Link
                </button>
                {showCopiedMessage && (
                  <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded text-sm whitespace-nowrap">
                    Link copied!
                  </div>
                )}
              </div>
              <button
                onClick={() => updateMode(session.mode === 'voting' ? 'ouija' : 'voting')}
                className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-colors shadow-lg"
              >
                Mode: {session.mode === 'voting' ? '🗳️ Voting' : '🔮 Ouija'}
              </button>
              <button
                onClick={resetVotes}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors shadow-lg"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Active Users */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-white/80 text-sm">Active users:</span>
            {users.map(user => (
              <span
                key={user.id}
                className={`px-3 py-1 rounded-full text-sm ${
                  user.id === currentUserId
                    ? 'bg-green-500 text-white'
                    : 'bg-white/20 text-white'
                }`}
              >
                {user.name}
                {user.vote_value !== null && ` (${user.vote_value})`}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Voting Results Summary */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-4">Voting Results</h2>
          <div className="grid grid-cols-7 gap-2">
            {FIBONACCI_VALUES.map(value => {
              const count = users.filter(u => u.vote_value === value).length;
              return (
                <div key={value} className="text-center">
                  <div className="bg-purple-500/30 rounded-lg p-3">
                    <div className="text-2xl font-bold text-white">{value}</div>
                    <div className="text-sm text-white/60">{count} vote{count !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Planning Board */}
      <div className="max-w-6xl mx-auto">
        <div
          ref={boardRef}
          onMouseMove={handleMouseMove}
          onMouseDown={() => session.mode === 'ouija' && setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          className="relative w-full aspect-square bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-3xl border-4 border-purple-500/30 shadow-2xl overflow-hidden cursor-crosshair"
          style={{ maxHeight: '800px' }}
        >
          {/* Mystical background effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]" />

          {/* Instructions */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-6 py-3 rounded-full text-sm">
            {session.mode === 'voting'
              ? '🗳️ Move your cursor to place your vote card'
              : '🔮 Click and drag to move the card with your team'}
          </div>

          {/* Fibonacci value positions */}
          {fibPositions.map(({ value, x, y }) => (
            <div
              key={value}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <div className="bg-purple-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg border-2 border-purple-300">
                {value}
              </div>
            </div>
          ))}

          {/* Other users' cursors - only show in Ouija mode */}
          {session.mode === 'ouija' && otherUsers.map(user => (
            <div
              key={user.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: `${user.cursor_x}%`, top: `${user.cursor_y}%` }}
            >
              <div className="relative">
                <div className="w-4 h-4 bg-yellow-400 rounded-full border-2 border-white shadow-lg" />
                <span className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {user.name}
                </span>
              </div>
            </div>
          ))}

          {/* Individual user cards in Voting mode */}
          {session.mode === 'voting' && users.map(user => {
            const position = getUserCardPosition(user);
            const isCurrentUser = user.id === currentUserId;
            return (
              <div
                key={user.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-150 ease-out"
                style={{ left: `${position.x}%`, top: `${position.y}%` }}
              >
                <div className={`bg-white rounded-xl p-4 shadow-2xl border-4 ${
                  isCurrentUser ? 'border-green-400 w-40' : 'border-blue-400 w-36'
                }`}>
                  <div className="text-center">
                    <div className={`font-bold text-purple-900 mb-1 ${
                      isCurrentUser ? 'text-3xl' : 'text-2xl'
                    }`}>
                      {user.vote_value !== null ? user.vote_value : '?'}
                    </div>
                    <div className="text-xs text-gray-600 font-semibold truncate">
                      {user.name}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Shared card - only in Ouija mode */}
          {session.mode === 'ouija' && (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300 ease-out"
              style={{ left: `${sharedCardPosition.x}%`, top: `${sharedCardPosition.y}%` }}
            >
              <div className="bg-white rounded-xl p-6 shadow-2xl w-48 border-4 border-purple-400">
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-900 mb-2">
                    {getClosestFibonacci(sharedCardPosition.x, sharedCardPosition.y)}
                  </div>
                  <div className="text-xs text-gray-600">
                    Team Estimate
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
