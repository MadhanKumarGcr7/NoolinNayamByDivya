'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import WhatsAppCommunityCTA from '@/components/sections/WhatsAppCommunityCTA';

export default function WorkshopDetailPage({ params }) {
  const slug = params?.slug;

  const [workshop, setWorkshop] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  // Form State
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [phone, setPhone]       = useState('');
  const [seats, setSeats]       = useState(1);
  const [notes, setNotes]       = useState('');
  const [reserving, setReserving] = useState(false);
  const [resultMsg, setResultMsg] = useState(null);

  useEffect(() => {
    async function loadWorkshop() {
      try {
        const res = await fetch(`/api/workshops/${slug}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Workshop not found');
        setWorkshop(data.workshop);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadWorkshop();
  }, [slug]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!workshop) return;
    setReserving(true);
    setResultMsg(null);

    try {
      const targetId = workshop.slug || workshop.id || workshop._id;
      const res = await fetch(`/api/workshops/${targetId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          seatsBooked: seats,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      setResultMsg({
        type: data.waitlisted ? 'waitlisted' : 'success',
        text: data.message,
      });

      // Reload workshop to reflect updated seats
      const updatedRes = await fetch(`/api/workshops/${slug}`);
      const updatedData = await updatedRes.json();
      if (updatedData.workshop) setWorkshop(updatedData.workshop);

    } catch (err) {
      setResultMsg({ type: 'error', text: err.message });
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-36 pb-24 min-h-screen bg-ivory text-center">
        <div className="w-8 h-8 border-2 border-warmBrown border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (error || !workshop) {
    return (
      <div className="pt-36 pb-24 min-h-screen bg-ivory text-center">
        <h1 className="font-serif text-display-sm text-charcoal mb-4">Workshop Not Found</h1>
        <p className="text-body-sm text-charcoal-600 mb-6 font-light">{error || 'This workshop does not exist or has been removed.'}</p>
        <Link href="/workshops">
          <Button variant="secondary" size="md">Back to Workshops</Button>
        </Link>
      </div>
    );
  }

  const spotsLeft = workshop.seatsTotal - workshop.seatsFilled;
  const isFull = spotsLeft <= 0 || workshop.status === 'full';
  const formattedDate = new Date(workshop.date).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="pt-28 pb-24 min-h-screen bg-ivory">
      <div className="site-container">
        <Link href="/workshops" className="text-label-md uppercase tracking-[0.14em] text-warmBrown hover:underline mb-8 inline-block">
          ← Back to All Workshops
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Media & Description */}
          <div className="lg:col-span-7 space-y-8">
            <div className="relative aspect-[16/10] overflow-hidden bg-oatmeal border border-border shadow-warm-md">
              {workshop.coverImage ? (
                <img src={workshop.coverImage} alt={workshop.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-body-sm text-charcoal-400">Workshop Cover</div>
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 text-label-xs uppercase tracking-[0.16em] bg-ivory/90 backdrop-blur-sm text-charcoal border border-border font-medium">
                  {workshop.skillLevel}
                </span>
                {workshop.isOnline && (
                  <span className="px-3 py-1 text-label-xs uppercase tracking-[0.16em] bg-sky-900 text-ivory font-medium">
                    Online Session
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-label-md uppercase tracking-[0.18em] text-warmBrown font-medium">
                {workshop.isFree ? 'Free Community Workshop' : `₹${workshop.price?.toLocaleString('en-IN')} per seat`}
              </span>
              <h1 className="font-serif font-light text-charcoal text-display-md leading-tight">
                {workshop.title}
              </h1>
              <p className="text-body-md text-charcoal-600 font-light leading-relaxed whitespace-pre-line">
                {workshop.description}
              </p>
            </div>

            <div className="border-t border-border pt-6 space-y-3 text-body-sm text-charcoal-600 font-light">
              <p><strong>Included in Workshop:</strong> All necessary crochet hooks, premium organic cotton yarn skeins, pattern guide, and light refreshments.</p>
              <p><strong>What to Bring:</strong> Just your enthusiasm! No prior crochet experience required for beginner sessions.</p>
            </div>
          </div>

          {/* Right: Registration Card */}
          <div className="lg:col-span-5 sticky top-32 bg-cream border border-border p-6 sm:p-8 shadow-warm-xl space-y-6">
            <div>
              <p className="text-label-xs uppercase tracking-[0.18em] text-charcoal-400 mb-1">Session Details</p>
              <div className="space-y-2 text-body-sm text-charcoal font-medium">
                <p>📅 Date: <span className="font-light text-charcoal-600">{formattedDate}</span></p>
                <p>⏰ Time: <span className="font-light text-charcoal-600">{workshop.time} ({workshop.duration})</span></p>
                <p>📍 Location: <span className="font-light text-charcoal-600">{workshop.location}</span></p>
                <p>🪑 Capacity: <span className="font-light text-charcoal-600">{workshop.seatsFilled} / {workshop.seatsTotal} filled</span> ({isFull ? 'Fully Booked' : `${spotsLeft} spot${spotsLeft > 1 ? 's' : ''} remaining`})</p>
              </div>
            </div>

            {resultMsg ? (
              <div className={`p-4 border text-body-sm font-sans space-y-3 ${
                resultMsg.type === 'error' ? 'bg-blush-light text-warmBrown border-blush' : 'bg-emerald-50 text-emerald-900 border-emerald-200'
              }`}>
                <p className="font-medium">{resultMsg.text}</p>
                {workshop.price > 0 && resultMsg.type !== 'error' && (
                  <p className="text-body-xs text-charcoal-600">Our team will reach out via WhatsApp / Phone to confirm payment and send your pass.</p>
                )}
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4 border-t border-border pt-4">
                <h3 className="font-serif text-lg font-light text-charcoal">
                  {isFull ? 'Join the Priority Waitlist' : 'Reserve Your Spot'}
                </h3>

                <div>
                  <label className="text-label-md uppercase tracking-[0.14em] text-charcoal font-medium block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Priya Sharma"
                    className="w-full px-3 py-2 bg-ivory border border-border text-body-sm font-sans text-charcoal focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-label-md uppercase tracking-[0.14em] text-charcoal font-medium block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="priya@example.com"
                    className="w-full px-3 py-2 bg-ivory border border-border text-body-sm font-sans text-charcoal focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-label-md uppercase tracking-[0.14em] text-charcoal font-medium block mb-1">Phone / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-ivory border border-border text-body-sm font-sans text-charcoal focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-label-md uppercase tracking-[0.14em] text-charcoal font-medium block mb-1">Number of Seats</label>
                  <input
                    type="number"
                    min="1"
                    max={Math.max(1, spotsLeft)}
                    required
                    value={seats}
                    onChange={(e) => setSeats(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 bg-ivory border border-border text-body-sm font-sans text-charcoal focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-label-md uppercase tracking-[0.14em] text-charcoal font-medium block mb-1">Notes (Optional)</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any specific questions..."
                    className="w-full px-3 py-2 bg-ivory border border-border text-body-sm font-sans text-charcoal focus:outline-none"
                  />
                </div>

                <Button variant="primary" size="lg" className="w-full mt-2" type="submit" loading={reserving}>
                  {isFull ? 'JOIN WAITLIST' : 'CONFIRM RESERVATION'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="mt-20">
        <WhatsAppCommunityCTA source="workshop_page" />
      </div>
    </div>
  );
}
