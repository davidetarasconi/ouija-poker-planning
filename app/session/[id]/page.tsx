'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import PlanningBoard from '@/components/PlanningBoard';

function SessionContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const userName = searchParams.get('name');

  // Redirect to login page if no name is provided
  useEffect(() => {
    if (!userName) {
      router.push(`/?sessionId=${sessionId}`);
    }
  }, [userName, sessionId, router]);

  // Don't render the board until we have a name
  if (!userName) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
        <div className="text-white text-2xl">Redirecting to login...</div>
      </div>
    );
  }

  return <PlanningBoard sessionId={sessionId} userName={userName} />;
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
