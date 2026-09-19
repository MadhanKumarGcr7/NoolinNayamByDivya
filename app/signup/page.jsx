'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';

  const { signup, logout, user, isLoggedIn, fetchUser } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Client-side validation
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      setLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      await signup(formData);
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

  return (
    <div
      id="account-signup-page"
      className="min-h-screen bg-ivory flex items-center justify-start pt-28 pb-20 px-5 sm:px-10 lg:pl-20 xl:pl-32 relative bg-cover bg-center bg-no-repeat transition-all duration-300"
      style={{
        backgroundImage: 'var(--signup-bg-image, none)',
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
            Create an Account
          </h1>
          <p className="text-body-sm text-charcoal-600 font-light">
            Join us for seamless shopping, order tracking, and exclusive updates.
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-cream/95 backdrop-blur-md border border-border p-8 sm:p-10 shadow-warm-xl">
          {/* If already logged in */}
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
                  GO TO MY ACCOUNT →
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full"
                  onClick={handleSignOut}
                >
                  SIGN OUT OF ACCOUNT
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 space-y-4">
                <GoogleLoginButton
                  isOwnerLogin={false}
                  buttonText="Sign up with Google"
                  onSuccess={() => router.push(redirect)}
                />
                <div className="relative flex items-center justify-center">
                  <div className="w-full border-t border-border" />
                  <span className="absolute bg-cream/95 px-3 text-label-xs uppercase tracking-wider text-charcoal-400 font-sans font-medium">
                    or with email
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Full Name"
                  id="signup-name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Divya Sharma"
                  autoComplete="name"
                />
                <Input
                  label="Email Address"
                  id="signup-email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  autoComplete="email"
                />
                <Input
                  label="Phone Number"
                  id="signup-phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  autoComplete="tel"
                />
                <Input
                  label="Password"
                  id="signup-password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
                <Input
                  label="Confirm Password"
                  id="signup-confirm-password"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
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
                  className="w-full mt-2"
                  loading={loading}
                  arrow
                >
                  CREATE ACCOUNT
                </Button>
              </form>

              {/* Login link */}
              <div className="mt-8 pt-6 border-t border-border/60 text-center sm:text-left">
                <p className="text-body-sm text-charcoal-600 font-light">
                  Already have an account?{' '}
                  <Link
                    href={`/login?redirect=${encodeURIComponent(redirect)}`}
                    className="text-warmBrown hover:text-charcoal transition-colors font-medium underline"
                  >
                    Sign in
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

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ivory flex items-center justify-start pt-28 pb-20 px-5 sm:px-10 lg:pl-20">
          <div className="w-8 h-8 border-2 border-warmBrown border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
