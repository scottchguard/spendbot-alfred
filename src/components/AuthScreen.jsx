import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { signInWithGoogle, signInWithApple, signInWithEmail, signUpWithEmail, resetPassword } from '../lib/supabase';

export function AuthScreen({ onBack }) {
  const [view, setView] = useState('options'); // 'options' | 'email-signin' | 'email-signup' | 'forgot-password'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState(null); // 'google' | 'apple' | 'email'
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleGoogleSignIn = async () => {
    setLoadingProvider('google');
    setLoading(true);
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
      setLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleAppleSignIn = async () => {
    setLoadingProvider('apple');
    setLoading(true);
    setError(null);
    const { error } = await signInWithApple();
    if (error) {
      setError(error.message);
      setLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoadingProvider('email');
    setLoading(true);
    setError(null);
    setMessage(null);

    if (view === 'email-signup') {
      const { data, error } = await signUpWithEmail(email, password);
      if (error) {
        setError(error.message);
      } else if (data?.session) {
        // User is signed in immediately (email confirmation disabled)
        // Auth state change will handle redirect to dashboard
        return;
      } else if (data?.user && !data?.session) {
        // Email confirmation required
        setMessage('Check your email for the confirmation link!');
      }
    } else {
      const { error } = await signInWithEmail(email, password);
      if (error) {
        setError(error.message);
      }
    }
    setLoading(false);
    setLoadingProvider(null);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    setLoadingProvider('email');
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await resetPassword(email);
    if (error) {
      setError(error.message);
    } else {
      setMessage('Check your email for the password reset link!');
    }
    setLoading(false);
    setLoadingProvider(null);
  };

  const goToEmailSignIn = () => {
    setView('email-signin');
    setError(null);
    setMessage(null);
  };

  const goToEmailSignUp = () => {
    setView('email-signup');
    setError(null);
    setMessage(null);
  };

  const goToForgotPassword = () => {
    setView('forgot-password');
    setError(null);
    setMessage(null);
  };

  const goToOptions = () => {
    setView('options');
    setError(null);
    setMessage(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="text-text-secondary text-sm flex items-center gap-1 mb-6"
          >
            ← Back to home
          </button>
        )}
        
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🤖</div>
          <h1 className="text-3xl font-heading font-bold text-text-primary">
            SpendBot
          </h1>
          <p className="text-text-secondary mt-2">
            Track spending in 3 seconds flat
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* Email Sign In Form */}
          {view === 'email-signin' && (
            <motion.form
              key="email-signin"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleEmailAuth}
              className="space-y-4"
            >
              <button
                type="button"
                onClick={goToOptions}
                className="text-text-secondary text-sm flex items-center gap-1 mb-4"
              >
                ← Back to sign in options
              </button>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                disabled={loading}
                aria-label="Email address"
                autoComplete="email"
                className="w-full px-4 py-3 bg-surface-raised border border-border rounded-xl 
                           text-text-primary placeholder-text-muted focus:outline-none focus:border-accent
                           disabled:opacity-50"
              />

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  minLength={6}
                  disabled={loading}
                  aria-label="Password"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 bg-surface-raised border border-border rounded-xl 
                             text-text-primary placeholder-text-muted focus:outline-none focus:border-accent
                             disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span aria-hidden="true">{showPassword ? '🙈' : '👁️'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={goToForgotPassword}
                className="text-accent text-sm"
              >
                Forgot password?
              </button>

              {error && (
                <div className="text-danger text-sm text-center">{error}</div>
              )}

              {message && (
                <div className="text-success text-sm text-center">{message}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-accent text-white rounded-xl font-semibold
                           disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loadingProvider === 'email' ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              <button
                type="button"
                onClick={goToEmailSignUp}
                className="w-full text-text-secondary text-sm"
              >
                Don't have an account? Sign up
              </button>
            </motion.form>
          )}

          {/* Email Sign Up Form */}
          {view === 'email-signup' && (
            <motion.form
              key="email-signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleEmailAuth}
              className="space-y-4"
            >
              <button
                type="button"
                onClick={goToOptions}
                className="text-text-secondary text-sm flex items-center gap-1 mb-4"
              >
                ← Back to sign in options
              </button>

              <h2 className="text-lg font-semibold text-text-primary text-center">
                Create your account
              </h2>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                disabled={loading}
                aria-label="Email address"
                autoComplete="email"
                className="w-full px-4 py-3 bg-surface-raised border border-border rounded-xl 
                           text-text-primary placeholder-text-muted focus:outline-none focus:border-accent
                           disabled:opacity-50"
              />

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min 6 characters)"
                  required
                  minLength={6}
                  disabled={loading}
                  aria-label="Password, minimum 6 characters"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 pr-12 bg-surface-raised border border-border rounded-xl 
                             text-text-primary placeholder-text-muted focus:outline-none focus:border-accent
                             disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span aria-hidden="true">{showPassword ? '🙈' : '👁️'}</span>
                </button>
              </div>

              {error && (
                <div className="text-danger text-sm text-center">{error}</div>
              )}

              {message && (
                <div className="text-success text-sm text-center">{message}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-accent text-white rounded-xl font-semibold
                           disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loadingProvider === 'email' ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>

              <button
                type="button"
                onClick={goToEmailSignIn}
                className="w-full text-text-secondary text-sm"
              >
                Already have an account? Sign in
              </button>
            </motion.form>
          )}

          {/* Forgot Password Form */}
          {view === 'forgot-password' && (
            <motion.form
              key="forgot-password"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleForgotPassword}
              className="space-y-4"
            >
              <button
                type="button"
                onClick={goToEmailSignIn}
                className="text-text-secondary text-sm flex items-center gap-1 mb-4"
              >
                ← Back to sign in
              </button>

              <h2 className="text-lg font-semibold text-text-primary text-center">
                Reset your password
              </h2>

              <p className="text-text-muted text-sm text-center">
                Enter your email and we'll send you a link to reset your password.
              </p>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-surface-raised border border-border rounded-xl 
                           text-text-primary placeholder-text-muted focus:outline-none focus:border-accent
                           disabled:opacity-50"
              />

              {error && (
                <div className="text-danger text-sm text-center">{error}</div>
              )}

              {message && (
                <div className="text-success text-sm text-center">{message}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-accent text-white rounded-xl font-semibold
                           disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loadingProvider === 'email' ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </motion.form>
          )}

          {/* OAuth Options */}
          {view === 'options' && (
            <motion.div
              key="oauth-options"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-3"
            >
              {/* Google Sign In */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 bg-white text-gray-800 rounded-xl font-medium
                           flex items-center justify-center gap-3 shadow-sm
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingProvider === 'google' ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                {loadingProvider === 'google' ? 'Connecting...' : 'Continue with Google'}
              </button>

              {/* Apple Sign In */}
              <button
                onClick={handleAppleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 bg-black text-white rounded-xl font-medium
                           flex items-center justify-center gap-3
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingProvider === 'apple' ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                )}
                {loadingProvider === 'apple' ? 'Connecting...' : 'Continue with Apple'}
              </button>

              {/* Email Sign In */}
              <button
                onClick={goToEmailSignIn}
                disabled={loading}
                className="w-full py-3 px-4 bg-surface-raised text-text-primary rounded-xl font-medium
                           flex items-center justify-center gap-3 border border-border
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Continue with Email
              </button>

              {error && (
                <div className="text-danger text-sm text-center mt-4">{error}</div>
              )}

              {/* Terms */}
              <p className="text-text-muted text-xs text-center mt-6 px-4">
                By continuing, you agree to SpendBot's{' '}
                <Link to="/terms" className="text-accent hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-accent hover:underline">Privacy Policy</Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
