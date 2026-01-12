'use client';

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { paymentAPI } from '@/lib/api';

export default function EsewaSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('Verifying payment...');
  const [message, setMessage] = useState('Please wait while we confirm the transaction.');

  useEffect(() => {
    const purchaseOrderId = searchParams.get('transaction_uuid') || searchParams.get('purchase_order_id');
    const totalAmount = searchParams.get('total_amount') || searchParams.get('amount');
    const eventId = searchParams.get('eventId');
    const productCode = searchParams.get('product_code');

    if (!purchaseOrderId || !totalAmount || !eventId) {
      setStatus('failed');
      setMessage('Missing payment details. Please return to the event page and try again.');
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        console.log("Product Code");
        console.log({
          product_code: process.env.ESEWA_MERCHANT_CODE ?? "EPAYTEST", 
          total_amount: totalAmount,
          transaction_uuid: purchaseOrderId
        });

        const statusResponse = await paymentAPI.getEsewaStatus({
          product_code: process.env.ESEWA_MERCHANT_CODE ?? "EPAYTEST", 
          total_amount: totalAmount,
          transaction_uuid: purchaseOrderId
        });

        console.log("statusResponse");
        console.log(statusResponse);
        


        if (cancelled) return;

        if (!statusResponse.data.ref_id) {
          throw new Error('No reference returned from eSewa');
        }

        // await paymentAPI.verifyEsewa({
        //   pid: purchaseOrderId,
        //   amt: totalAmount,
        //   refId: statusResponse.data.ref_id
        // });

        const payload = {
          eventId,
          reference: statusResponse.data.ref_id,
          transactionId: statusResponse.data.ref_id,
          status: 'success'
        };
        sessionStorage.setItem('esewaPaymentResult', JSON.stringify(payload));
        setStatus('success');
        setMessage('Payment verified successfully. Redirecting you back to the event.');
        setTimeout(() => {
          router.replace(`/events/${eventId}?esewaResult=success`);
        }, 1200);
      } catch (error) {
        if (cancelled) return;
        const errorMsg = error.response?.data?.message || error.message || 'Unable to verify eSewa payment.';
        const payload = { eventId, message: errorMsg, status: 'failed' };
        sessionStorage.setItem('esewaPaymentResult', JSON.stringify(payload));
        setStatus('failed');
        setMessage(errorMsg);
        setTimeout(() => {
          router.replace(`/events/${eventId}?esewaResult=failure`);
        }, 1200);
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
          {status === 'success' ? 'Payment complete' : status === 'failed' ? 'Payment failed' : 'Verifying payment'}
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
        <p className="text-xs text-gray-400">We’ll redirect you back as soon as this confirmation is done.</p>
      </div>
    </main>
  );
}
