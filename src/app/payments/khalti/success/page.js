'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { paymentAPI } from '@/lib/api';

export default function KhaltiSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Please wait while we confirm your Khalti payment.');

  useEffect(() => {
    const eventId = searchParams.get('eventId');
    const pidx = searchParams.get('pidx');

    if (!eventId || !pidx) {
      const errorMessage = 'Missing transaction identifiers. Please return to the event page.';
      sessionStorage.setItem(
        'khaltiPaymentResult',
        JSON.stringify({ eventId, status: 'failed', message: errorMessage })
      );
      setStatus('failed');
      setMessage(errorMessage);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const lookupResponse = await paymentAPI.lookupKhalti({ pidx });
        if (cancelled) return;
        const lookupStatus = lookupResponse.data.status?.toLowerCase();

        if (lookupStatus !== 'completed') {
          throw new Error(`Current status: ${lookupResponse.data.status || lookupStatus}`);
        }

        const reference = lookupResponse.data.transaction_id || lookupResponse.data.tidx || pidx;
        const payload = {
          eventId,
          status: 'success',
          reference,
          message: 'Khalti payment verified successfully.'
        };
        sessionStorage.setItem('khaltiPaymentResult', JSON.stringify(payload));
        setStatus('success');
        setMessage('Payment verified. Redirecting you back to the event...');
        setTimeout(() => router.replace(`/events/${eventId}?khaltiResult=success`), 1200);
      } catch (err) {
        if (cancelled) return;
        const errorMsg = err.response?.data?.detail || err.message || 'Unable to verify Khalti payment.';
        const payload = { eventId, status: 'failed', message: errorMsg };
        sessionStorage.setItem('khaltiPaymentResult', JSON.stringify(payload));
        setStatus('failed');
        setMessage(errorMsg);
        if (eventId) {
          setTimeout(() => router.replace(`/events/${eventId}?khaltiResult=failure`), 1200);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  const eventId = searchParams.get('eventId');

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl space-y-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {status === 'success'
            ? 'Payment complete'
            : status === 'failed'
            ? 'Payment verification failed'
            : 'Verifying payment'}
        </h1>
        <p className="text-sm text-gray-600">{message}</p>
        {eventId && (
          <Link
            href={`/events/${eventId}`}
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Return to event
          </Link>
        )}
        <p className="text-xs text-gray-400">We’ll bring you back once the confirmation is done.</p>
      </div>
    </main>
  );
}
