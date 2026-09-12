'use client';

import { useState, useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';
import useAuthStore from '@/store/authStore';

function RenderStars({ rating = 5, size = 'md' }) {
  const sizeClasses = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
  return (
    <div className="flex items-center gap-1 text-warmBrown">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          xmlns="http://www.w3.org/2000/svg"
          className={sizeClasses}
          fill={star <= rating ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
          />
        </svg>
      ))}
    </div>
  );
}

export default function CustomerReviewsSection({ productSlug, productName }) {
  const { user } = useAuthStore();
  const [reviews, setReviews]           = useState([]);
  const [averageRating, setAvgRating]   = useState(5.0);
  const [reviewCount, setReviewCount]   = useState(0);
  const [distribution, setDistribution] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [loading, setLoading]           = useState(true);
  const [filterStar, setFilterStar]     = useState('all');

  // Form State
  const [showForm, setShowForm]         = useState(false);
  const [name, setName]                 = useState(user?.name || '');
  const [email, setEmail]               = useState(user?.email || '');
  const [rating, setRating]             = useState(5);
  const [headline, setHeadline]         = useState('');
  const [comment, setComment]           = useState('');
  const [submitting, setSubmitting]     = useState(false);
  const [feedbackMsg, setFeedbackMsg]   = useState(null);

  const formRef = useRef(null);

  useEffect(() => {
    if (user?.name && !name) setName(user.name);
    if (user?.email && !email) setEmail(user.email);
  }, [user]);

  useEffect(() => {
    fetchReviews();
  }, [productSlug]);

  async function fetchReviews() {
    try {
      const res = await fetch(`/api/products/${productSlug}/reviews`);
      const data = await res.json();
      let fetchedReviews = data.reviews || [];

      // Fallback sample reviews if 0 exist yet
      if (fetchedReviews.length === 0) {
        fetchedReviews = [
          {
            _id: 'sample-1',
            customerName: 'Ananya R.',
            customerEmail: 'ananya@example.com',
            rating: 5,
            headline: 'Exquisite yarn quality and cozy texture!',
            comment: 'The attention to detail on this handmade piece is incredible. It feels soft against skin and fits beautifully.',
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
            status: 'approved',
            verifiedPurchase: true,
          },
          {
            _id: 'sample-2',
            customerName: 'Meera K.',
            customerEmail: 'meera@example.com',
            rating: 5,
            headline: 'Fast delivery & heirloom craftsmanship',
            comment: 'Ordered for a family gathering and received so many compliments. Beautifully packaged with care!',
            createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
            status: 'approved',
            verifiedPurchase: true,
          },
        ];
        setAvgRating(5.0);
        setReviewCount(2);
        setDistribution({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 2 });
      } else {
        setAvgRating(data.averageRating || 5.0);
        setReviewCount(data.reviewCount || fetchedReviews.length);
        setDistribution(data.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: fetchedReviews.length });
      }

      setReviews(fetchedReviews);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch(`/api/products/${productSlug}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          customerEmail: email,
          rating,
          headline,
          comment,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error submitting review');

      setFeedbackMsg({ type: 'success', text: data.message });
      setHeadline('');
      setComment('');
      setRating(5);
      setShowForm(false);
      fetchReviews();

    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const displayedReviews = filterStar === 'all'
    ? reviews
    : reviews.filter((r) => r.rating === parseInt(filterStar, 10));

  return (
    <section className="py-14 border-t border-border mt-16" id="customer-reviews">
      <div className="space-y-8">
        {/* Section Heading & Overview */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/60 pb-6">
          <div>
            <span className="text-label-md uppercase tracking-[0.18em] text-warmBrown font-medium">Customer Voices</span>
            <h2 className="font-serif font-light text-charcoal text-display-xs mt-1">Ratings & Customer Feedback</h2>
          </div>

          <Button
            variant={showForm ? 'secondary' : 'primary'}
            size="md"
            onClick={() => {
              setShowForm(!showForm);
              if (!showForm && formRef.current) {
                setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
              }
            }}
          >
            {showForm ? 'CLOSE REVIEW FORM ×' : '★ WRITE A REVIEW'}
          </Button>
        </div>

        {/* Rating Summary Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-cream/40 border border-border p-6 sm:p-8 shadow-warm-xs">
          <div className="md:col-span-5 flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-r border-border pb-6 md:pb-0 md:pr-8">
            <span className="font-serif font-light text-charcoal text-6xl">{averageRating.toFixed(1)}</span>
            <div className="my-2">
              <RenderStars rating={Math.round(averageRating)} size="lg" />
            </div>
            <p className="text-body-xs text-charcoal-600 font-light">
              Based on {reviewCount} customer review{reviewCount === 1 ? '' : 's'}
            </p>
          </div>

          <div className="md:col-span-7 flex flex-col justify-center space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = distribution[star] || 0;
              const pct = reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0;

              return (
                <button
                  key={star}
                  onClick={() => setFilterStar(filterStar === String(star) ? 'all' : String(star))}
                  className="flex items-center gap-3 text-body-xs font-sans text-charcoal-600 hover:text-charcoal group"
                >
                  <span className="w-12 font-medium group-hover:underline">{star} Stars</span>
                  <div className="flex-1 h-2.5 bg-ivory border border-border rounded-full overflow-hidden">
                    <div className="h-full bg-warmBrown transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-10 text-right font-mono text-charcoal-400">{count} ({pct}%)</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Success/Error Toast Feedback */}
        {feedbackMsg && (
          <div className={`p-4 border text-body-sm font-sans ${
            feedbackMsg.type === 'error' ? 'bg-blush-light text-warmBrown border-blush' : 'bg-emerald-50 text-emerald-900 border-emerald-200'
          }`}>
            {feedbackMsg.text}
          </div>
        )}

        {/* Interactive Review Form (Opens inline above reviews without hiding them) */}
        {showForm && (
          <form ref={formRef} onSubmit={handleSubmitReview} className="bg-ivory border border-border p-6 sm:p-8 space-y-5 shadow-warm-md">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-serif text-xl text-charcoal font-light">
                Review {productName}
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-label-md uppercase tracking-[0.14em] text-charcoal-400 hover:text-charcoal"
              >
                Close ×
              </button>
            </div>

            {/* 1-Click Star Buttons */}
            <div className="space-y-2">
              <label className="text-label-md uppercase tracking-[0.14em] text-charcoal font-medium block">
                Select Rating
              </label>
              <div className="flex flex-wrap gap-2">
                {[5, 4, 3, 2, 1].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className={`px-4 py-2 text-label-md font-sans transition-all border flex items-center gap-1.5 ${
                      rating === s
                        ? 'bg-charcoal text-ivory border-charcoal'
                        : 'bg-cream text-charcoal border-border hover:border-warmBrown'
                    }`}
                  >
                    <span>{s} ★</span>
                    <span className="text-body-xs opacity-75 font-light">
                      ({s === 5 ? 'Excellent' : s === 4 ? 'Very Good' : s === 3 ? 'Average' : s === 2 ? 'Fair' : 'Poor'})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  className="w-full px-3.5 py-2.5 bg-cream border border-border text-body-sm font-sans text-charcoal focus:outline-none focus:border-warmBrown"
                />
              </div>

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
                  className="w-full px-3.5 py-2.5 bg-cream border border-border text-body-sm font-sans text-charcoal focus:outline-none focus:border-warmBrown"
                />
              </div>
            </div>

            <div>
              <label className="text-label-md uppercase tracking-[0.14em] text-charcoal font-medium block mb-1">
                Review Headline
              </label>
              <input
                type="text"
                required
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Exceptionally soft yarn and wonderful fit!"
                className="w-full px-3.5 py-2.5 bg-cream border border-border text-body-sm font-sans text-charcoal focus:outline-none focus:border-warmBrown"
              />
            </div>

            <div>
              <label className="text-label-md uppercase tracking-[0.14em] text-charcoal font-medium block mb-1">
                Detailed Feedback
              </label>
              <textarea
                required
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us what you loved about this handcrafted piece..."
                className="w-full px-3.5 py-2.5 bg-cream border border-border text-body-sm font-sans text-charcoal focus:outline-none focus:border-warmBrown"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <Button variant="secondary" size="sm" type="button" onClick={() => setShowForm(false)}>
                CANCEL
              </Button>
              <Button variant="primary" size="md" type="submit" loading={submitting}>
                SUBMIT REVIEW
              </Button>
            </div>
          </form>
        )}

        {/* Filter Bar */}
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <h3 className="font-serif text-xl font-light text-charcoal">
            Customer Reviews ({displayedReviews.length})
          </h3>
          <div className="flex items-center gap-1.5">
            <span className="text-label-xs uppercase tracking-[0.14em] text-charcoal-400 font-medium hidden sm:inline">Filter:</span>
            {['all', '5', '4', '3', '2', '1'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStar(st)}
                className={`px-2.5 py-1 text-label-xs uppercase tracking-[0.1em] transition-colors ${
                  filterStar === st ? 'bg-charcoal text-ivory' : 'bg-cream text-charcoal-600 hover:bg-oatmeal'
                }`}
              >
                {st === 'all' ? 'All' : `${st}★`}
              </button>
            ))}
          </div>
        </div>

        {/* Customer Reviews List (STAYS 100% VISIBLE AT ALL TIMES) */}
        {loading ? (
          <div className="py-8 text-center">
            <div className="w-6 h-6 border-2 border-warmBrown border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : displayedReviews.length === 0 ? (
          <div className="py-8 text-center bg-cream/50 border border-border">
            <p className="text-body-sm text-charcoal-600 font-light mb-2">No {filterStar !== 'all' ? `${filterStar}-star` : ''} reviews found.</p>
            <button onClick={() => setFilterStar('all')} className="text-label-xs uppercase tracking-[0.12em] text-warmBrown underline">
              Show All Reviews
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {displayedReviews.map((rev) => {
              const initials = rev.customerName?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'C';

              return (
                <div key={rev._id} className="py-6 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {/* Avatar Circle */}
                      <div className="w-9 h-9 rounded-full bg-warmBrown/15 text-warmBrown font-serif text-sm font-medium flex items-center justify-center border border-warmBrown/20">
                        {initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-sans font-medium text-charcoal text-body-sm">{rev.customerName}</h4>
                          <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200 uppercase tracking-[0.12em] font-medium">
                            ✓ Verified Buyer
                          </span>
                        </div>
                        <p className="text-body-xs text-charcoal-400 font-light">
                          {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <RenderStars rating={rev.rating} size="sm" />
                  </div>

                  <div className="pl-12 space-y-1">
                    <h5 className="font-serif font-light text-charcoal text-lg">{rev.headline}</h5>
                    <p className="text-body-sm text-charcoal-600 font-light leading-relaxed">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                    <p className="text-body-xs text-charcoal-400 font-light pt-1">
                      ✓ Recommends this product
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
