'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function WorkshopsSection({ limit = 3, showHeader = true, className = '' }) {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);

  // Spot Reservation Form State
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [phone, setPhone]       = useState('');
  const [seats, setSeats]       = useState(1);
  const [notes, setNotes]       = useState('');
  const [reserving, setReserving] = useState(false);
  const [resultMsg, setResultMsg] = useState(null);

  useEffect(() => {
    async function loadWorkshops() {
      try {
        const res = await fetch('/api/workshops');
        const data = await res.json();
        setWorkshops(data.workshops || []);
      } catch {
        setWorkshops([]);
      } finally {
        setLoading(false);
      }
    }
    loadWorkshops();
  }, []);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWorkshop) return;
    setReserving(true);
    setResultMsg(null);

    try {
      const targetId = selectedWorkshop.slug || selectedWorkshop.id || selectedWorkshop._id;
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

      // Refresh workshops list to update seat counts
      const updatedRes = await fetch('/api/workshops');
      const updatedData = await updatedRes.json();
      setWorkshops(updatedData.workshops || []);

    } catch (err) {
      setResultMsg({ type: 'error', text: err.message });
    } finally {
      setReserving(false);
    }
  };

  const visibleWorkshops = workshops.slice(0, limit);

  return (
    <section className={`py-10 lg:py-14 bg-ivory ${className}`} aria-labelledby="workshops-heading">
      <div className="site-container">
        {/* Section Header */}
        {showHeader && (
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 reveal">
            <div>
              <p className="section-label mb-2">Learn & Connect</p>
              <h2 id="workshops-heading" className="font-serif font-light text-charcoal text-display-md">
                Crochet Workshops.
              </h2>
            </div>
            <Link
              href="/workshops"
              className="mt-4 sm:mt-0 inline-flex items-center gap-2 text-label-lg uppercase tracking-[0.16em] text-charcoal-400 hover:text-charcoal transition-colors group"
            >
              View all workshops
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
              </svg>
            </Link>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-warmBrown border-t-transparent rounded-full animate-spin" />
          </div>
        ) : visibleWorkshops.length === 0 ? (
          /* Empty State */
          <div className="bg-cream border border-border p-10 text-center max-w-xl mx-auto space-y-4 reveal">
            <p className="font-serif font-light text-charcoal text-xl">No workshops scheduled right now.</p>
            <p className="text-body-sm text-charcoal-600 font-light">
              Join our WhatsApp community to hear about our next cozy crochet session first!
            </p>
            <div className="pt-2">
              <a
                href="#whatsapp-community"
                className="text-label-md uppercase tracking-[0.14em] text-warmBrown font-medium border-b border-warmBrown pb-0.5 hover:text-charcoal hover:border-charcoal transition-colors"
              >
                Join Community for Updates →
              </a>
            </div>
          </div>
        ) : (
          /* Workshops Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 reveal reveal-delay-2">
            {visibleWorkshops.map((w) => {
              const spotsLeft = w.seatsTotal - w.seatsFilled;
              const isFull = spotsLeft <= 0 || w.status === 'full';
              const formattedDate = new Date(w.date).toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <article key={w.id || w._id} className="bg-cream border border-border flex flex-col group hover:shadow-warm-md transition-shadow">
                  {/* Image Container */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-oatmeal">
                    {w.coverImage ? (
                      <img src={w.coverImage} alt={w.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-body-xs text-charcoal-400">Crochet Workshop</div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-1 text-label-xs uppercase tracking-[0.14em] bg-ivory/90 backdrop-blur-sm text-charcoal border border-border font-medium">
                        {w.skillLevel}
                      </span>
                      {w.isOnline && (
                        <span className="px-2.5 py-1 text-label-xs uppercase tracking-[0.14em] bg-sky-900 text-ivory font-medium">
                          Online
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex flex-col flex-1 gap-4">
                    <div>
                      <p className="text-label-sm uppercase tracking-[0.14em] text-warmBrown font-medium mb-1">
                        {formattedDate} · {w.time}
                      </p>
                      <h3 className="font-serif font-light text-charcoal text-xl leading-snug group-hover:text-warmBrown transition-colors">
                        <Link href={`/workshops/${w.slug}`}>
                          {w.title}
                        </Link>
                      </h3>
                    </div>

                    <p className="text-body-sm text-charcoal-600 font-light line-clamp-2">
                      {w.description}
                    </p>

                    <div className="mt-auto pt-4 border-t border-border/60 flex items-center justify-between">
                      <div>
                        <p className="text-body-sm font-sans font-medium text-charcoal">
                          {w.isFree ? 'Free' : `₹${w.price?.toLocaleString('en-IN')}`}
                        </p>
                        <p className="text-body-xs text-charcoal-400 font-light">
                          {isFull ? (
                            <span className="text-amber-800 font-medium">Fully booked</span>
                          ) : (
                            <span className="text-emerald-800 font-medium">{spotsLeft} spot{spotsLeft > 1 ? 's' : ''} left</span>
                          )}
                        </p>
                      </div>

                      <Button
                        variant={isFull ? 'secondary' : 'primary'}
                        size="sm"
                        onClick={() => {
                          setSelectedWorkshop(w);
                          setResultMsg(null);
                        }}
                      >
                        {isFull ? 'WAITLIST' : 'RESERVE SPOT'}
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Spot Reservation / Registration Modal */}
      {selectedWorkshop && (
        <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-ivory border border-border p-6 sm:p-8 max-w-lg w-full shadow-warm-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedWorkshop(null)}
              className="absolute top-4 right-4 text-charcoal-400 hover:text-charcoal text-xl leading-none"
              aria-label="Close modal"
            >
              ×
            </button>

            <div className="mb-6">
              <span className="text-label-xs uppercase tracking-[0.18em] text-warmBrown font-medium">
                {selectedWorkshop.isFree ? 'Free Registration' : `₹${selectedWorkshop.price} per seat`}
              </span>
              <h3 className="font-serif font-light text-charcoal text-display-xs mt-1">
                {selectedWorkshop.title}
              </h3>
              <p className="text-body-xs text-charcoal-600 mt-1">
                📅 {new Date(selectedWorkshop.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} ({selectedWorkshop.time}) · 📍 {selectedWorkshop.location}
              </p>
            </div>

            {resultMsg ? (
              <div className={`p-4 border text-body-sm font-sans mb-4 space-y-3 ${
                resultMsg.type === 'error' ? 'bg-blush-light text-warmBrown border-blush' : 'bg-emerald-50 text-emerald-900 border-emerald-200'
              }`}>
                <p className="font-medium">{resultMsg.text}</p>
                {selectedWorkshop.price > 0 && resultMsg.type !== 'error' && (
                  <div className="text-body-xs text-charcoal-600 bg-ivory p-3 border border-border mt-2">
                    <p className="font-medium text-charcoal uppercase tracking-[0.1em] mb-1">Payment Note:</p>
                    <p>For paid workshops, our team will contact you via WhatsApp / Phone to confirm payment & send your pass.</p>
                  </div>
                )}
                <Button variant="secondary" size="sm" onClick={() => setSelectedWorkshop(null)} className="mt-2">
                  CLOSE
                </Button>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="text-label-md uppercase tracking-[0.14em] text-charcoal font-medium block mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Priya Sharma"
                    className="w-full px-3 py-2 bg-cream border border-border text-body-sm font-sans text-charcoal focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-label-md uppercase tracking-[0.14em] text-charcoal font-medium block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="priya@example.com"
                      className="w-full px-3 py-2 bg-cream border border-border text-body-sm font-sans text-charcoal focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-label-md uppercase tracking-[0.14em] text-charcoal font-medium block mb-1">
                      Phone / WhatsApp
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 bg-cream border border-border text-body-sm font-sans text-charcoal focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-label-md uppercase tracking-[0.14em] text-charcoal font-medium block mb-1">
                      Number of Seats
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={Math.max(1, selectedWorkshop.seatsTotal - selectedWorkshop.seatsFilled)}
                      required
                      value={seats}
                      onChange={(e) => setSeats(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-2 bg-cream border border-border text-body-sm font-sans text-charcoal focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-label-md uppercase tracking-[0.14em] text-charcoal font-medium block mb-1">
                    Notes / Questions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any yarn preference or questions..."
                    className="w-full px-3 py-2 bg-cream border border-border text-body-sm font-sans text-charcoal focus:outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <p className="text-body-xs text-charcoal-600">
                    Total: <strong className="text-charcoal">{selectedWorkshop.isFree ? 'Free' : `₹${selectedWorkshop.price * seats}`}</strong>
                  </p>
                  <Button variant="primary" size="md" type="submit" loading={reserving}>
                    CONFIRM RESERVATION
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
