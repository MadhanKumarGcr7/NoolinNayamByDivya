'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';

export default function OwnerLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/owner-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      router.push('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = () => {
    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        {/* Brand mark */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full border border-ivory/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-ivory/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25z" />
            </svg>
          </div>
          <p className="text-label-lg uppercase tracking-[0.18em] text-ivory/30 font-sans font-medium">
            Owner Access
          </p>
          <p className="font-serif font-light text-ivory/60 text-lg mt-1 tracking-[0.04em]">
            Noolin Nayam by Divya
          </p>
        </div>

        {/* Security Notice */}
        <div className="mb-5 p-3.5 bg-warmBrown/15 border border-warmBrown/30 text-ivory/80 text-body-xs font-sans text-center rounded">
          🛡️ Admin access is strictly restricted to authorized Google account: <strong className="text-ivory block mt-0.5">noolinnayambydivya@gmail.com</strong>
        </div>

        {/* Login Card */}
        <div className="bg-charcoal-800 border border-ivory/10 p-8 shadow-warm-xl space-y-6">
          
          {/* Google Auth for Admin */}
          <div>
            <GoogleLoginButton
              isOwnerLogin={true}
              buttonText="Sign in as Admin with Google"
              onSuccess={handleGoogleSuccess}
            />
          </div>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-ivory/10" />
            <span className="absolute bg-charcoal-800 px-3 text-label-xs uppercase tracking-wider text-ivory/30 font-sans">
              or use password
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="owner-email"
                className="text-label-lg uppercase tracking-[0.14em] font-sans font-medium text-ivory/40"
              >
                Email
              </label>
              <input
                id="owner-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="noolinnayambydivya@gmail.com"
                className="w-full px-4 py-3 bg-charcoal border border-ivory/15 text-ivory text-body-sm font-sans font-light placeholder:text-ivory/20 transition-colors duration-200 focus:outline-none focus:border-ivory/40"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="owner-password"
                className="text-label-lg uppercase tracking-[0.14em] font-sans font-medium text-ivory/40"
              >
                Password
              </label>
              <input
                id="owner-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-charcoal border border-ivory/15 text-ivory text-body-sm font-sans font-light placeholder:text-ivory/20 transition-colors duration-200 focus:outline-none focus:border-ivory/40"
              />
            </div>

            {error && (
              <div className="bg-warmBrown/20 text-blush-light p-3 border border-warmBrown/30 text-body-xs font-sans" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-7 py-3.5 bg-ivory/10 text-ivory border border-ivory/20 text-label-lg uppercase tracking-[0.16em] font-sans font-medium hover:bg-ivory/20 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-ivory border-t-transparent rounded-full animate-spin" />
              ) : null}
              <span>Sign In with Password</span>
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-label-sm uppercase tracking-[0.16em] text-ivory/15 font-sans">
          Internal access only
        </p>
      </div>
    </div>
  );
}
