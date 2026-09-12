'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';

  const { login, logout, user, isLoggedIn, fetchUser } = useAuthStore();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      router.push(redirect);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
  };

  const isCheckoutRedirect = redirect.includes('checkout');

  return (
    <div
      id="account-login-page"
      className="min-h-screen bg-ivory flex items-center justify-start pt-28 pb-20 px-5 sm:px-10 lg:pl-20 xl:pl-32 relative bg-cover bg-center bg-no-repeat transition-all duration-300"
      style={{
        backgroundImage: 'var(--login-bg-image, none)',
      }}
    >
      <div className="absolute inset-0 bg-charcoal/5 pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Header */}
        <div className="text-left mb-8">
          <Link href="/" className="font-serif font-light text-charcoal text-2xl tracking-[0.04em] hover:text-warmBrown transition-colors">
            Noolin Nayam by Divya
          </Link>
          <h1 className="font-serif font-light text-charcoal text-display-sm mt-4 mb-2">
            {isCheckoutRedirect ? 'Sign In to Buy' : 'Customer Account Login'}
          </h1>
          <p className="text-body-sm text-charcoal-600 font-light">
            {isCheckoutRedirect
              ? 'Please sign in or create an account to complete your purchase.'
              : 'Sign in to your customer account to view orders, wishlist, and profile.'}
          </p>
        </div>

        {/* Checkout Redirect Notice Banner */}
        {isCheckoutRedirect && (
          <div className="mb-6 p-4 bg-warmBrown/10 border border-warmBrown/30 text-charcoal space-y-1">
            <p className="text-label-md uppercase tracking-[0.14em] text-warmBrown font-medium flex items-center gap-2">
              <span>🛍️ Account Required to Complete Purchase</span>
            </p>
            <p className="text-body-xs font-light text-charcoal-600">
              Please sign in or create a customer account below to finish buying your items.
            </p>
          </div>
        )}

        {/* Card Box */}
        <div className="bg-cream/95 backdrop-blur-md border border-border p-8 sm:p-10 shadow-warm-xl">
          {/* If already logged in: show status banner + Go to Checkout / Account + Sign Out */}
          {isLoggedIn && user ? (
            <div className="space-y-6 text-center">
              <div className="p-4 bg-sage-light/50 border border-sage/40 text-left">
                <p className="text-label-md uppercase tracking-[0.14em] text-sage-dark font-medium mb-1">
                  ✓ Currently Signed In
                </p>
                <p className="text-body-sm text-charcoal font-medium truncate">{user.name}</p>
                <p className="text-body-xs text-charcoal-600 font-light truncate">{user.email}</p>
              </div>

              <div className="space-y-3">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => router.push(redirect)}
                >
                  {isCheckoutRedirect ? 'CONTINUE TO CHECKOUT →' : 'GO TO MY ACCOUNT →'}
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full"
                  onClick={handleSignOut}
                >
                  SIGN OUT / SWITCH ACCOUNT
                </Button>
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Email Address"
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                />
                <Input
                  label="Password"
                  id="login-password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />

                {error && (
                  <div className="bg-blush-light text-warmBrown p-3 border border-blush text-body-xs font-sans" role="alert">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-label-md uppercase tracking-[0.14em] text-warmBrown hover:text-charcoal transition-colors font-medium"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  loading={loading}
                  arrow
                >
                  {isCheckoutRedirect ? 'SIGN IN & PROCEED TO CHECKOUT' : 'SIGN IN'}
                </Button>
              </form>

              {/* Signup link */}
              <div className="mt-8 pt-6 border-t border-border/60 text-center sm:text-left">
                <p className="text-body-sm text-charcoal-600 font-light">
                  Don&apos;t have an account?{' '}
                  <Link
                    href={`/signup?redirect=${encodeURIComponent(redirect)}`}
                    className="text-warmBrown hover:text-charcoal transition-colors font-medium underline"
                  >
                    Create one
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ivory flex items-center justify-start pt-28 pb-20 px-5 sm:px-10 lg:pl-20">
          <div className="w-8 h-8 border-2 border-warmBrown border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
