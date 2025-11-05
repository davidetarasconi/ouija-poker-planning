import { Suspense } from 'react';
import SessionJoin from '@/components/SessionJoin';

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    }>
      <SessionJoin />
    </Suspense>
  );
}
