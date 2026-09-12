'use client';

import { useState } from 'react';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState('');
  const [sent, setSent]     = useState(false);
  const [error, setError]   = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center pt-28 pb-20 px-5">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="font-serif font-light text-charcoal text-2xl tracking-[0.04em] hover:text-warmBrown transition-colors">
            Noolin Nayam by Divya
          </Link>
          <h1 className="font-serif font-light text-charcoal text-display-sm mt-6 mb-2">
            Reset Password
          </h1>
          <p className="text-body-sm text-charcoal-600 font-light">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <div className="bg-cream border border-border p-8 shadow-warm-md">
          {sent ? (
            <div className="text-center py-6 animate-fade-in space-y-4">
              <div className="w-14 h-14 rounded-full bg-warmBrown/10 text-warmBrown flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              </div>
              <h3 className="font-serif font-light text-charcoal text-2xl">Check Your Email</h3>
              <p className="text-body-sm text-charcoal-600 font-light max-w-sm mx-auto">
                If an account with <strong className="font-medium">{email}</strong> exists, a password reset link has been sent.
              </p>
              {/* Dev-only notice */}
              <div className="mt-6 bg-ivory border border-border p-4 text-left">
                <p className="text-label-md uppercase tracking-[0.14em] text-warmBrown font-medium mb-1">
                  Development Note
                </p>
                <p className="text-body-xs text-charcoal-400 font-light">
                  Email sending is not yet integrated. Check the server console for the reset token. TODO: Wire Nodemailer or SendGrid.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email Address"
                id="forgot-email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
              />

              {error && (
                <div className="bg-blush-light text-warmBrown p-3 border border-blush text-body-xs font-sans" role="alert">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={loading}
              >
                SEND RESET LINK
              </Button>
            </form>
          )}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/login"
            className="text-body-sm text-warmBrown hover:text-charcoal transition-colors font-medium"
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
