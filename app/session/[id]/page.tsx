'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import PlanningBoard from '@/components/PlanningBoard';

function SessionContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = params.id as string;
  const userName = searchParams.get('name') || 'Anonymous';

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
