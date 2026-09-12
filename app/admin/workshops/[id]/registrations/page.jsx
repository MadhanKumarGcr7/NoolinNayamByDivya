'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Input, { Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function AdminWorkshopRegistrationsPage({ params }) {
  const workshopId = params?.id;

  const [workshop, setWorkshop]           = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);

  // Manual Add Modal
  const [modalOpen, setModalOpen]         = useState(false);
  const [addName, setAddName]             = useState('');
  const [addEmail, setAddEmail]           = useState('');
  const [addPhone, setAddPhone]           = useState('');
  const [addSeats, setAddSeats]           = useState('1');
  const [addNotes, setAddNotes]           = useState('');
  const [addPayment, setAddPayment]       = useState('paid');
  const [addStatus, setAddStatus]         = useState('confirmed');
  const [submittingAdd, setSubmittingAdd] = useState(false);

  useEffect(() => {
    fetchData();
  }, [workshopId]);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/workshops/${workshopId}/registrations`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error fetching registrations');
      setWorkshop(data.workshop);
      setRegistrations(data.registrations || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async (registrationId, newStatus, newPaymentStatus) => {
    try {
      const res = await fetch(`/api/admin/workshops/${workshopId}/registrations`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId, status: newStatus, paymentStatus: newPaymentStatus }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch {
      /* ignore */
    }
  };

  const handleManualAdd = async (e) => {
    e.preventDefault();
    setSubmittingAdd(true);
    try {
      const res = await fetch(`/api/admin/workshops/${workshopId}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: addName,
          email: addEmail,
          phone: addPhone,
          seatsBooked: parseInt(addSeats, 10),
          notes: addNotes,
          paymentStatus: addPayment,
          status: addStatus,
        }),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error adding registration');

      setModalOpen(false);
      setAddName('');
      setAddEmail('');
      setAddPhone('');
      setAddSeats('1');
      setAddNotes('');
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingAdd(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="w-6 h-6 border-2 border-warmBrown border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/admin/workshops" className="text-label-md uppercase tracking-[0.14em] text-warmBrown hover:underline mb-1 inline-block">
            ← Back to Workshops
          </Link>
          <h1 className="font-serif font-light text-charcoal text-display-xs">
            Registrations: {workshop?.title}
          </h1>
          <p className="text-body-sm text-charcoal-600 font-light mt-1">
            Date: {new Date(workshop?.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} ({workshop?.time}) · Seats Filled: <strong className="text-charcoal font-medium">{workshop?.seatsFilled} / {workshop?.seatsTotal}</strong>
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
          + MANUAL REGISTRATION
        </Button>
      </div>

      {error && (
        <div className="bg-blush-light text-warmBrown p-4 border border-blush text-body-sm font-sans">
          {error}
        </div>
      )}

      {/* Registrants Table */}
      {registrations.length === 0 ? (
        <div className="py-12 text-center bg-ivory border border-border">
          <p className="text-body-sm text-charcoal-600 font-light mb-4">No attendee registrations yet for this workshop.</p>
          <Button variant="secondary" size="sm" onClick={() => setModalOpen(true)}>Add Walk-in Registrant</Button>
        </div>
      ) : (
        <div className="bg-ivory border border-border overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-cream/40 text-label-md uppercase tracking-[0.14em] text-charcoal-600">
                <th className="py-3.5 px-4 font-medium">Attendee Name</th>
                <th className="py-3.5 px-4 font-medium">Contact</th>
                <th className="py-3.5 px-4 font-medium">Seats Booked</th>
                <th className="py-3.5 px-4 font-medium">Registration Date</th>
                <th className="py-3.5 px-4 font-medium">Payment Status</th>
                <th className="py-3.5 px-4 font-medium">Booking Status</th>
                <th className="py-3.5 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-body-sm font-sans">
              {registrations.map((r) => (
                <tr key={r._id} className="hover:bg-cream/20 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-charcoal">{r.name}</p>
                    {r.notes && <p className="text-body-xs text-charcoal-400 italic">&ldquo;{r.notes}&rdquo;</p>}
                  </td>
                  <td className="py-3.5 px-4 text-charcoal-600">
                    <p>{r.email}</p>
                    <p className="text-body-xs font-mono text-charcoal-400">{r.phone}</p>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-charcoal">
                    {r.seatsBooked} seat{r.seatsBooked > 1 ? 's' : ''}
                  </td>
                  <td className="py-3.5 px-4 text-charcoal-600 whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      value={r.paymentStatus}
                      onChange={(e) => handleStatusChange(r._id, r.status, e.target.value)}
                      className="text-label-xs uppercase tracking-[0.1em] bg-cream border border-border px-2 py-1 focus:outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="waived">Waived / Free</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 text-label-xs uppercase tracking-[0.14em] font-medium border ${
                      r.status === 'confirmed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                      r.status === 'waitlisted' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                      'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {r.status === 'confirmed' ? (
                      <button
                        onClick={() => handleStatusChange(r._id, 'cancelled', r.paymentStatus)}
                        className="text-label-sm uppercase tracking-[0.12em] text-rose-600 hover:underline font-medium"
                      >
                        Cancel Booking
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(r._id, 'confirmed', r.paymentStatus)}
                        className="text-label-sm uppercase tracking-[0.12em] text-emerald-700 hover:underline font-medium"
                      >
                        Confirm Booking
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Manual Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-ivory border border-border p-6 sm:p-8 max-w-lg w-full shadow-warm-xl space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-serif text-lg text-charcoal font-light">Add Manual Registrant</h3>
              <button onClick={() => setModalOpen(false)} className="text-charcoal-400 hover:text-charcoal text-lg">×</button>
            </div>

            <form onSubmit={handleManualAdd} className="space-y-4">
              <Input
                label="Attendee Name"
                required
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="Priya Sharma"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  type="email"
                  required
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="priya@example.com"
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  required
                  value={addPhone}
                  onChange={(e) => setAddPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Seats Booked"
                  type="number"
                  min="1"
                  required
                  value={addSeats}
                  onChange={(e) => setAddSeats(e.target.value)}
                />
                <Select
                  label="Payment Status"
                  value={addPayment}
                  onChange={(e) => setAddPayment(e.target.value)}
                  options={[
                    { value: 'paid', label: 'Paid' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'waived', label: 'Waived / Free' },
                  ]}
                />
                <Select
                  label="Booking Status"
                  value={addStatus}
                  onChange={(e) => setAddStatus(e.target.value)}
                  options={[
                    { value: 'confirmed', label: 'Confirmed' },
                    { value: 'waitlisted', label: 'Waitlisted' },
                  ]}
                />
              </div>
              <Input
                label="Notes / Walk-in details"
                value={addNotes}
                onChange={(e) => setAddNotes(e.target.value)}
                placeholder="Walk-in at Bengaluru studio..."
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="secondary" size="sm" type="button" onClick={() => setModalOpen(false)}>
                  CANCEL
                </Button>
                <Button variant="primary" size="sm" type="submit" loading={submittingAdd}>
                  SAVE REGISTRATION
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
