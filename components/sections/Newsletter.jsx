'use client';

import { useState } from 'react';
import { brandConfig } from '@/lib/config';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch('/api/community/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'homepage' }),
      });
      const data = await res.json();
      setSubmitted(true);

      const inviteUrl = data.inviteUrl || brandConfig.community.whatsappGroupInviteUrl;
      if (inviteUrl) {
        window.open(inviteUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      console.error('Newsletter submission error:', err);
      setSubmitted(true);
      window.open(brandConfig.community.whatsappGroupInviteUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 lg:py-28 section-highlight-copper border-t border-border/50" aria-labelledby="newsletter-heading">
      <div className="editorial-container text-center reveal">
        <p className="section-label mb-3">Community</p>
        <h2 id="newsletter-heading" className="font-serif font-light text-charcoal text-display-md mb-4">
          Stay close to the handmade world.
        </h2>
        <p className="text-body-md text-charcoal-600 font-light max-w-md mx-auto mb-8 leading-relaxed">
          Be the first to hear about new handcrafted drops, custom order openings, and gentle stories from our studio.
        </p>

        {submitted ? (
          <div className="bg-cream p-6 border border-border inline-block max-w-md animate-fade-in space-y-4">
            <p className="font-serif font-light text-charcoal text-xl">Welcome to our circle! 💕</p>
            <p className="text-body-xs text-charcoal-600 font-light leading-relaxed">
              Your details are registered. Click below to join our official WhatsApp group space directly:
            </p>
            <div>
              <a
                href={brandConfig.community.whatsappGroupInviteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-ivory text-label-md uppercase tracking-[0.14em] hover:bg-warmBrown transition-colors font-medium shadow-warm-xs"
              >
                <span>JOIN WHATSAPP GROUP NOW →</span>
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              aria-label="Email address for newsletter"
              className="flex-1 px-5 py-3.5 bg-cream border border-border text-charcoal text-body-sm font-sans font-light placeholder:text-charcoal-200 focus:outline-none focus:border-charcoal transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 bg-charcoal text-ivory text-label-lg uppercase tracking-[0.16em] hover:bg-warmBrown transition-colors duration-400 font-medium whitespace-nowrap disabled:opacity-60"
            >
              {loading ? 'JOINING...' : 'JOIN US'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
