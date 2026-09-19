'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import useAuthModalStore from '@/store/authModalStore';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';

export default function LoginPromptModal() {
  const router = useRouter();
  const { login, signup } = useAuthStore();
  const {
    isOpen,
    mode,
    title,
    subtitle,
    closeAuthModal,
    setMode,
    executePendingAction,
  } = useAuthModalStore();

  // Login form state
  const [loginEmail, setLoginEmail]       = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeAuthModal]);

  // Reset errors and fields on modal state/mode change
  useEffect(() => {
    setError(null);
    setLoading(false);
  }, [mode, isOpen]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(loginEmail, loginPassword);
      const actionType = executePendingAction();
      if (actionType === 'buynow') {
        router.push('/checkout');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (signupData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      setLoading(false);
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      await signup(signupData);
      const actionType = executePendingAction();
      if (actionType === 'buynow') {
        router.push('/checkout');
      }
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in"
      aria-modal="true"
      role="dialog"
      aria-labelledby="auth-modal-title"
    >
      {/* Darkened Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-[#2C2520]/75 backdrop-blur-sm transition-opacity"
        onClick={closeAuthModal}
        aria-hidden="true"
      />

      {/* Modal Container — 100% Opaque Solid Cream Background */}
      <div className="relative w-full max-w-md bg-[#F5EFE4] border border-[#DDD0BB] p-6 sm:p-8 shadow-warm-xl z-10 my-auto rounded-sm">
        {/* Close Button (X) */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-charcoal-600 hover:text-charcoal transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-warmBrown"
          aria-label="Close dialog"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-label-md uppercase tracking-[0.2em] text-warmBrown font-medium mb-1">
            Noolin Nayam by Divya
          </p>
          <h2 id="auth-modal-title" className="font-serif font-light text-charcoal text-2xl sm:text-3xl leading-snug">
            {title}
          </h2>
          <p className="text-body-xs text-charcoal-600 font-light mt-1.5 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="flex border-b border-border/80 mb-6">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2.5 text-center text-label-md uppercase tracking-[0.14em] font-medium transition-colors border-b-2 -mb-px ${
              mode === 'login'
                ? 'border-warmBrown text-warmBrown'
                : 'border-transparent text-charcoal-600 hover:text-charcoal'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-2.5 text-center text-label-md uppercase tracking-[0.14em] font-medium transition-colors border-b-2 -mb-px ${
              mode === 'signup'
                ? 'border-warmBrown text-warmBrown'
                : 'border-transparent text-charcoal-600 hover:text-charcoal'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3 bg-blush-light text-warmBrown border border-blush text-body-xs font-sans rounded-xs" role="alert">
            {error}
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <Input
              label="Email Address"
              id="modal-login-email"
              name="email"
              type="email"
              required
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="name@example.com"
              autoComplete="email"
            />
            <Input
              label="Password"
              id="modal-login-password"
              name="password"
              type="password"
              required
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              loading={loading}
              arrow
            >
              SIGN IN & CONTINUE
            </Button>

            <div className="pt-3 text-center">
              <p className="text-body-xs text-charcoal-600 font-light">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-warmBrown font-medium hover:underline focus:outline-none"
                >
                  Create one here
                </button>
              </p>
            </div>
          </form>
        ) : (
          /* SIGNUP FORM */
          <form onSubmit={handleSignupSubmit} className="space-y-3.5">
            <Input
              label="Full Name"
              id="modal-signup-name"
              name="name"
              type="text"
              required
              value={signupData.name}
              onChange={handleSignupChange}
              placeholder="Divya Sharma"
              autoComplete="name"
            />
            <Input
              label="Email Address"
              id="modal-signup-email"
              name="email"
              type="email"
              required
              value={signupData.email}
              onChange={handleSignupChange}
              placeholder="name@example.com"
              autoComplete="email"
            />
            <Input
              label="Phone Number"
              id="modal-signup-phone"
              name="phone"
              type="tel"
              required
              value={signupData.phone}
              onChange={handleSignupChange}
              placeholder="+91 98765 43210"
              autoComplete="tel"
            />
            <Input
              label="Password"
              id="modal-signup-password"
              name="password"
              type="password"
              required
              value={signupData.password}
              onChange={handleSignupChange}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
            <Input
              label="Confirm Password"
              id="modal-signup-confirm-password"
              name="confirmPassword"
              type="password"
              required
              value={signupData.confirmPassword}
              onChange={handleSignupChange}
              placeholder="Re-enter password"
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              loading={loading}
              arrow
            >
              CREATE ACCOUNT & CONTINUE
            </Button>

            <div className="pt-3 text-center">
              <p className="text-body-xs text-charcoal-600 font-light">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-warmBrown font-medium hover:underline focus:outline-none"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </form>
        )}

        {/* Google OAuth Button for Modal at Bottom */}
        <div className="mt-6 space-y-3">
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-border" />
            <span className="absolute bg-[#F5EFE4] px-3 text-label-xs uppercase tracking-wider text-charcoal-400 font-sans font-medium">
              or continue with
            </span>
          </div>
          <GoogleLoginButton
            isOwnerLogin={false}
            onSuccess={async () => {
              const { fetchUser } = useAuthStore.getState();
              await fetchUser();
              const actionType = executePendingAction();
              if (actionType === 'buynow') {
                router.push('/checkout');
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
