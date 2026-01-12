'use client';

import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

export default function KhaltiFailurePage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');
  const reason = searchParams.get('status') || searchParams.get('message') || 'The transaction could not be completed.';

  const displayReason = useMemo(() => {
    if (!reason) return 'The transaction could not be completed.';
    return decodeURIComponent(reason);
  }, [reason]);

  useEffect(() => {
    if (!eventId) return;
    const payload = { eventId, status: 'failed', message: displayReason };
    sessionStorage.setItem('khaltiPaymentResult', JSON.stringify(payload));
  }, [displayReason, eventId]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl space-y-4 text-center border border-red-100">
        <h1 className="text-2xl font-bold text-red-600">Payment not completed</h1>
        <p className="text-sm text-gray-600">{displayReason}</p>
        {eventId && (
          <Link
            href={`/events/${eventId}`}
            className="inline-flex items-center justify-center rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:border-red-400"
          >
            Return to event
          </Link>
        )}
        <p className="text-xs text-gray-400">Try again or select another payment method.</p>
      </div>
    </main>
  );
}
