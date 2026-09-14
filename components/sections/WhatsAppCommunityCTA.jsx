'use client';

import { useState } from 'react';
import { brandConfig } from '@/lib/config';
import Button from '@/components/ui/Button';

export default function WhatsAppCommunityCTA({ source = 'shop_page', className = '' }) {
  const [email, setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [joined, setJoined]   = useState(false);

  const handleJoin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/community/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      });
      const data = await res.json();
      setJoined(true);

      // Open WhatsApp group invite link in new tab
      if (data.inviteUrl) {
        window.open(data.inviteUrl, '_blank', 'noopener,noreferrer');
      }
    } catch {
      window.open(brandConfig.community.whatsappGroupInviteUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={`bg-mocha-gradient border-t border-border py-8 lg:py-10 overflow-hidden ${className}`}>
      <div className="site-container">
        <div className="max-w-3xl mx-auto text-center space-y-6 reveal">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 badge-warm-sand text-label-xs uppercase tracking-[0.18em] font-medium shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            WhatsApp Community
          </div>

          {/* Heading & Subheading */}
          <h2 className="font-serif font-light text-charcoal text-display-sm sm:text-display-md leading-tight">
            {brandConfig.community.heading}
          </h2>

          <p className="text-body-md text-charcoal-600 font-light max-w-xl mx-auto leading-relaxed">
            {brandConfig.community.subheading}
          </p>

          {/* Form / CTA */}
          <form onSubmit={handleJoin} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 pt-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email for updates (optional)..."
              className="flex-1 px-4 py-3 bg-ivory border border-border text-body-sm font-sans text-charcoal focus:outline-none focus:border-warmBrown placeholder:text-charcoal-300"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="whitespace-nowrap"
            >
              {joined ? 'OPENING WHATSAPP...' : 'JOIN COMMUNITY'}
            </Button>
          </form>

          <p className="text-body-xs text-charcoal-400 font-light pt-2">
            Free to join · No spam, just cozy crochet updates & workshop invites.
          </p>
        </div>
      </div>
    </section>
  );
}
