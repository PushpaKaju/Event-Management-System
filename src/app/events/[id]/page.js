'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/component/layout/header';
import { bookingAPI, eventAPI, paymentAPI } from '@/lib/api';

const statusStyles = {
  upcoming: 'bg-blue-50 text-blue-600',
  ongoing: 'bg-emerald-50 text-emerald-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-50 text-red-700'
};

export default function EventDetailPage({ params }) {
  const resolvedParams = React.use(params);
  const { id } = resolvedParams;
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [registering, setRegistering] = useState(false);
  const [booking, setBooking] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [waitingForEsewa, setWaitingForEsewa] = useState(false);
  const [esewaDetails, setEsewaDetails] = useState(null);
  const [managementLoading, setManagementLoading] = useState(false);
  const [managementError, setManagementError] = useState('');

  const esewaMerchantCode = process.env.NEXT_PUBLIC_ESEWA_MERCHANT_CODE;
  const esewaCheckoutUrl = process.env.NEXT_PUBLIC_ESEWA_CHECKOUT_URL || 'https://esewa.com.np/epay/main';

  const formatRegistrationDate = (value) => {
    if (!value) return 'Unknown';
    return new Date(value).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const paymentMethodLabel = (method) => {
    if (!method) return 'Unknown';
    const map = {
      khalti: 'Khalti',
      esewa: 'eSewa',
      free: 'Free',
      none: 'Pending'
    };
    return map[method] || method.charAt(0).toUpperCase() + method.slice(1);
  };

  const fetchEvent = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await eventAPI.getOne(id);
      setEvent(response.data.event);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load the event at the moment.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('user');
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      setCurrentUserId(parsed?.id || parsed?._id || null);
    } catch {
      setCurrentUserId(null);
    }
  }, []);

  const refreshBooking = useCallback(async () => {
    if (!id) {
      setBooking(null);
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setBooking(null);
      return;
    }

    setBookingLoading(true);
    try {
      const response = await bookingAPI.getForEvent(id);
      setBooking(response.data.booking || null);
    } catch {
      setBooking(null);
    } finally {
      setBookingLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refreshBooking();
  }, [refreshBooking]);

  const eventOwnerId = useMemo(() => {
    if (!event) return null;
    const organizer = event.organizer;
    if (!organizer) return null;
    return typeof organizer === 'string' ? organizer : organizer._id || organizer.id || null;
  }, [event]);

  const isEventOwner = useMemo(() => {
    if (!eventOwnerId || !currentUserId) return false;
    return eventOwnerId.toString() === currentUserId.toString();
  }, [currentUserId, eventOwnerId]);

  const attendeesCount = event?.attendees?.length ?? 0;
  const availableSeats = event ? Math.max(event.capacity - attendeesCount, 0) : 0;
  const isFull = event ? availableSeats === 0 : false;
  const eventHasAttendees = attendeesCount > 0;
  const canManageEvent = isEventOwner && !eventHasAttendees;

  const finalizeRegistration = useCallback(
    async (paymentData) => {
      if (!event) return;
      setRegistering(true);
      setError('');
      try {

        await eventAPI.register(id, {
          payment: {
            method: paymentData.method,
            reference: paymentData.reference || '',
            transactionId: paymentData.transactionId || '',
            status: paymentData.status || (paymentData.method === 'free' ? 'paid' : 'paid')
          }
        });

        console.log("You are registered! Check your dashboard for confirmations.1");

        setSuccess('You are registered! Check your dashboard for confirmations.');
        fetchEvent();
        setPaymentModalOpen(false);
        refreshBooking();
      } catch (err) {
        if (err.response?.status === 401) {
          router.push('/login');
          return;
        }
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      } finally {
        setRegistering(false);
      }
    },
    [event, fetchEvent, id, router, refreshBooking]
  );

  const handleEditEvent = () => {
    if (!event || !canManageEvent) return;
    router.push(`/events/${id}/edit`);
  };

  const handleDeleteEvent = async () => {
    if (!event || !event._id || !canManageEvent) return;
    if (!confirm('Delete this event? This cannot be undone.')) return;
    setManagementError('');
    setManagementLoading(true);
    try {
      await eventAPI.delete(event._id);
      router.push('/dashboard');
    } catch (err) {
      setManagementError(err.response?.data?.message || 'Unable to delete event right now.');
    } finally {
      setManagementLoading(false);
    }
  };

  const handleRegisterClick = () => {
    setError('');
    setSuccess('');
    setPaymentError('');
    if (!event) return;
    if (event.price > 0) {
      setPaymentModalOpen(true);
      return;
    }
    finalizeRegistration({ method: 'free', reference: 'free', status: 'paid' });
  };

  const handleKhaltiPayment = async () => {
    if (!event) return;
    if (typeof window === 'undefined') {
      setPaymentError('Khalti payments require a browser environment.');
      setPaymentLoading(false);
      return;
    }
    setPaymentError('');
    setPaymentLoading(true);

    const purchaseOrderId = `evt-${id}-${Date.now()}`;
    const returnUrl = `${window.location.origin}/payments/khalti/success?eventId=${event._id}`;
    const failureUrl = `${window.location.origin}/payments/khalti/failure?eventId=${event._id}`;

    try {
      const response = await paymentAPI.initiateKhalti({
        amount: (event.price || 0).toFixed(2),
        purchase_order_id: purchaseOrderId,
        purchase_order_name: event.title,
        return_url: returnUrl,
        failure_url: failureUrl,
        website_url: window.location.origin,
        merchant_extra: `event=${event._id}`
      });

      const paymentUrl = response.data.payment_url;
      if (!paymentUrl) {
        throw new Error('Khalti did not return a payment URL.');
      }

      setPaymentError('Redirecting you to Khalti in this tab...');
      window.location.href = paymentUrl;
      return;
    } catch (err) {
      setPaymentLoading(false);
      setPaymentError(err.response?.data?.message || err.message || 'Unable to start Khalti payment.');
    }
  };

  const handleEsewaPayment = async () => {
    if (!event) return;
    setPaymentError('');
    if (!esewaMerchantCode) {
      setPaymentError('eSewa merchant code is missing. Set NEXT_PUBLIC_ESEWA_MERCHANT_CODE.');
      return;
    }

    const pid = `evt-${id}-${Date.now()}`;
    const amount = (event.price || 0).toFixed(2);
    const tax_amount = '0.00';
    const total_amount = (Number(amount) + Number(tax_amount)).toFixed(2);

    let checkoutResponse;
    try {
      checkoutResponse = await paymentAPI.getEsewaSignature({
        pid,
        amount,
        tax_amount,
        total_amount,
        product_code: esewaMerchantCode
      });
    } catch (error) {
      setPaymentError(error.response?.data?.message || 'Unable to generate signature for eSewa checkout.');
      return;
    }

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = esewaCheckoutUrl;

    const successUrl = `${window.location.origin}/payments/esewa/success?eventId=${event._id}&transaction_uuid=${pid}&total_amount=${total_amount}&product_code=${esewaMerchantCode}`;
    const failureUrl = `${window.location.origin}/payments/esewa/failure?eventId=${event._id}&transaction_uuid=${pid}`;

    const fields = {
      amount,
      tax_amount,
      total_amount,
      transaction_uuid: pid,
      product_code: esewaMerchantCode,
      product_service_charge: '0',
      product_delivery_charge: '0',
      success_url: successUrl,
      failure_url: failureUrl,
      signed_field_names: checkoutResponse.data.signed_field_names,
      signature: checkoutResponse.data.signature
    };

    Object.entries(fields).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    setEsewaDetails({
      pid,
      total_amount,
      product_code: esewaMerchantCode
    });
    setWaitingForEsewa(true);
    setPaymentModalOpen(true);
    setPaymentError('We redirect you to eSewa in this tab; the modal will finalize the booking when the callback returns.');
  };
  const handleEsewaStatusCheck = async () => {
    if (!esewaDetails) return;
    setPaymentLoading(true);
    try {
      const statusResponse = await paymentAPI.getEsewaStatus(esewaDetails);
      if (statusResponse.data.status === 'COMPLETE') {
        setPaymentError('');
        setWaitingForEsewa(false);
        await finalizeRegistration({
          method: 'esewa',
          reference: statusResponse.data.ref_id,
          status: 'paid',
          transactionId: statusResponse.data.ref_id
        });
        setSuccess('Payment confirmed via eSewa status check.');
      } else {
        setPaymentError(
          `Current status: ${statusResponse.data.status}${statusResponse.data.ref_id ? ` (${statusResponse.data.ref_id})` : ''}`
        );
      }
    } catch (err) {
      setPaymentError(err.response?.data?.message || err.message || 'Unable to reach eSewa status API.');
      } finally {
        setPaymentLoading(false);
      }
    };

  const esewaFinalizeRef = React.useRef(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('esewaPaymentResult');
    if (!stored || esewaFinalizeRef.current) return;
    try {
      const payload = JSON.parse(stored);
      if (payload.eventId !== id) return;
      if (!event) return;

      const runFinalize = async () => {
        try {
          if (payload.status === 'success') {
            esewaFinalizeRef.current = true;
            await finalizeRegistration({
              method: 'esewa',
              reference: payload.reference || '',
              transactionId: payload.transactionId || payload.reference || '',
              status: 'paid'
            });
            setSuccess('Payment confirmed via eSewa.');
            setPaymentError('');
            setWaitingForEsewa(false);
          } else {
            setPaymentError(payload.message || 'eSewa payment could not be verified.');
          }
        } finally {
          sessionStorage.removeItem('esewaPaymentResult');
        }
      };

      runFinalize();
    } catch {
      // ignore invalid payload
    }
  }, [finalizeRegistration, id, event]);

  const khaltiFinalizeRef = React.useRef(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('khaltiPaymentResult');
    if (!stored || khaltiFinalizeRef.current) return;
    try {
      const payload = JSON.parse(stored);
      if (payload.eventId !== id) return;
      if (!event) return;

      const runFinalize = async () => {
        try {
          if (payload.status === 'success') {
            khaltiFinalizeRef.current = true;
            await finalizeRegistration({
              method: 'khalti',
              reference: payload.reference || '',
              transactionId: payload.transactionId || payload.reference || '',
              status: 'paid'
            });
            setSuccess(payload.message || 'Payment confirmed via Khalti.');
            setPaymentError('');
          } else {
            setPaymentError(payload.message || 'Khalti payment could not be verified.');
          }
        } finally {
          sessionStorage.removeItem('khaltiPaymentResult');
        }
      };

      runFinalize();
    } catch {
      sessionStorage.removeItem('khaltiPaymentResult');
    }
  }, [finalizeRegistration, id, event]);

  const formattedDate = useMemo(() => {
    if (!event?.date) return '';
    return new Date(event.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [event]);

  const timeRange = useMemo(() => {
    if (!event) return '';
    return `${event.startTime} - ${event.endTime}`;
  }, [event]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
        <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
          <Link
            href="/events"
            className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            ← Back to events
          </Link>

          {loading ? (
            <div className="rounded-3xl bg-white p-10 shadow-xl text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-b-transparent" />
              <p className="mt-4 text-gray-600">Loading event...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl bg-white p-8 shadow-xl border border-red-100 text-center text-red-600">
              {error}
            </div>
          ) : (
            event && (
              <>
                <section className="grid gap-8">
                  <div className="rounded-3xl bg-white shadow-2xl overflow-hidden border border-gray-100">
                    <div className="relative h-64 md:h-80">
                      {event.image ? (
                        <img
                          src={event.image}
                          alt={event.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <p className="text-3xl font-bold text-white tracking-wide">{event.category}</p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm uppercase tracking-wider text-white/90">{formattedDate}</span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[event.status] ?? 'bg-gray-100 text-gray-700'}`}
                          >
                            {event.status}
                          </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white">{event.title}</h1>
                        <p className="text-sm text-white/80">{timeRange}</p>
                      </div>
                    </div>

                    <div className="p-8 space-y-6">
                      <div className="flex items-center justify-between text-gray-700">
                        <span className="text-sm font-semibold uppercase tracking-wider">
                          {event.category}
                        </span>
                        <span className="text-sm">
                          {attendeesCount} / {event.capacity} attendees
                        </span>
                      </div>

                      <p className="text-gray-600 leading-relaxed">{event.description}</p>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                          <p className="text-xs uppercase tracking-widest text-gray-500">Time</p>
                          <p className="mt-1 text-lg font-semibold text-gray-900">{timeRange}</p>
                        </div>
                        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                          <p className="text-xs uppercase tracking-widest text-gray-500">Location</p>
                          <p className="mt-1 text-lg font-semibold text-gray-900">{event.location?.venue}</p>
                          <p className="text-sm text-gray-600">{event.location?.address}</p>
                          <p className="text-sm text-gray-600">
                            {event.location?.city ? `${event.location.city}, ` : ''}
                            {event.location?.state ? `${event.location.state} ` : ''}
                            {event.location?.zipCode || ''}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                          <p className="text-xs uppercase tracking-widest text-gray-500">Price</p>
                          <p className="mt-1 text-lg font-semibold text-gray-900">
                            {event.price > 0 ? `$${event.price.toFixed(2)}` : 'Free'}
                          </p>
                          <p className="text-sm text-gray-600">{isFull ? 'Event is full' : `${availableSeats} seats left`}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {event.tags?.length ? (
                          event.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-blue-100 px-3 py-1 text-xs font-semibold text-blue-600"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="rounded-full border border-blue-100 px-3 py-1 text-xs font-semibold text-blue-600">
                            {event.category}
                          </span>
                        )}
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 items-start">
                        <div className="rounded-2xl border border-gray-100 p-5 space-y-2 bg-white">
                          <p className="text-xs uppercase tracking-widest text-gray-500">Organizer</p>
                          <p className="text-lg font-semibold text-gray-900">{event.organizer?.name || 'Team EventPro'}</p>
                          <p className="text-sm text-gray-600">{event.organizer?.email || 'Organizer info coming soon'}</p>
                          {event.organizer?.phone && (
                            <p className="text-sm text-gray-600">📞 {event.organizer.phone}</p>
                          )}
                        </div>

                        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-5 space-y-3">
                          {success && (
                            <p className="text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">{success}</p>
                          )}
                          {error && (
                            <p className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                          )}
                          {bookingLoading ? (
                            <div className="w-full rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 text-center">
                              Checking your booking…
                            </div>
                          ) : booking ? (
                            <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                              <button
                                disabled
                                className="w-full rounded-2xl border border-emerald-200 bg-white/80 px-4 py-3 text-sm font-semibold text-emerald-700"
                              >
                                Already registered
                              </button>
                              <div className="space-y-1 text-sm text-emerald-900">
                                <p>
                                  Registered on{' '}
                                  <span className="font-semibold">{formatRegistrationDate(booking.recordedAt || booking.createdAt)}</span>
                                </p>
                                <p>
                                  Payment method:{' '}
                                  <span className="font-semibold">{paymentMethodLabel(booking.paymentMethod)}</span>
                                </p>
                                <p>
                                  Status:{' '}
                                  <span className="font-semibold">{(booking.paymentStatus || 'pending').toUpperCase()}</span>
                                </p>
                                {booking.paymentReference && (
                                  <p>
                                    Reference:{' '}
                                    <span className="font-semibold break-all">{booking.paymentReference}</span>
                                  </p>
                                )}
                                {booking.transactionId && (
                                  <p>
                                    Transaction ID:{' '}
                                    <span className="font-semibold break-all">{booking.transactionId}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : isEventOwner ? (
                            <div className="space-y-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                              <p className="font-semibold">This is your event.</p>
                              {eventHasAttendees ? (
                                <p className="text-xs text-blue-800">
                                  Edit/Delete are locked once attendees join.
                                </p>
                              ) : (
                                <p className="text-xs text-blue-800">
                                  No attendees yet—feel free to edit or delete before registrations begin.
                                </p>
                              )}
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={handleEditEvent}
                                  disabled={!canManageEvent}
                                  className="flex-1 rounded-2xl border border-blue-200 bg-white px-4 py-2 text-xs font-semibold text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {canManageEvent ? 'Edit event details' : 'Edit disabled'}
                                </button>
                                <button
                                  onClick={handleDeleteEvent}
                                  disabled={!canManageEvent || managementLoading}
                                  className="flex-1 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {managementLoading ? 'Deleting…' : canManageEvent ? 'Delete event' : 'Delete disabled'}
                                </button>
                              </div>
                              {managementError && (
                                <p className="text-xs text-red-700">{managementError}</p>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={handleRegisterClick}
                              disabled={registering || isFull || event.status !== 'upcoming'}
                              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 font-semibold shadow-lg transition-transform duration-200 disabled:cursor-not-allowed disabled:opacity-50 hover:scale-[1.02]"
                            >
                              {registering ? 'Registering…' : isFull ? 'Event Full' : 'Register Now'}
                            </button>
                          )}
                          <p className="text-xs text-gray-500">
                            You can manage your bookings from the dashboard once registered.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl bg-white shadow-xl p-6 border border-gray-100 space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">Event Highlights</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Expect a curated experience with expert speakers, immersive workshops, and community networking tailored to {event.category}.
                  </p>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-gray-100 p-4">
                      <p className="text-xs uppercase tracking-widest text-gray-500">Attendees</p>
                      <p className="mt-1 text-3xl font-bold text-gray-900">{attendeesCount}</p>
                      <p className="text-sm text-gray-500">already registered</p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 p-4">
                      <p className="text-xs uppercase tracking-widest text-gray-500">Capacity</p>
                      <p className="mt-1 text-3xl font-bold text-gray-900">{event.capacity}</p>
                      <p className="text-sm text-gray-500">total seats</p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 p-4">
                      <p className="text-xs uppercase tracking-widest text-gray-500">Duration</p>
                      <p className="mt-1 text-3xl font-bold text-gray-900">{event.startTime} → {event.endTime}</p>
                      <p className="text-sm text-gray-500">planned schedule</p>
                    </div>
                  </div>
                </section>
              </>
            )
          )}
        </div>
      </main>

      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Complete payment</h3>
              <button
                onClick={() => {
                  setPaymentModalOpen(false);
                  setWaitingForEsewa(false);
                  setPaymentError('');
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Choose a payment method. Your event booking is confirmed once the payment is verified.
            </p>
            <div className="grid gap-3">
              <button
                onClick={handleKhaltiPayment}
                disabled={paymentLoading}
                className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:border-blue-200"
              >
                Pay with Khalti
              </button>
              <button
                onClick={handleEsewaPayment}
                disabled={paymentLoading}
                className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:border-red-200"
              >
                Pay with eSewa
              </button>
            </div>

            {waitingForEsewa && (
              <div className="space-y-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-700">
                  eSewa now displays in this tab; keep it open until the callback returns so we can finalize the booking.
                </p>
                <p className="text-xs text-gray-500">Don’t close this tab yet—you can also run the status check if needed.</p>
                <button
                  onClick={handleEsewaStatusCheck}
                  disabled={paymentLoading}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paymentLoading ? 'Checking status…' : 'Check transaction status manually'}
                </button>
              </div>
            )}

            {paymentError && (
              <p className="text-sm text-red-700">{paymentError}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
