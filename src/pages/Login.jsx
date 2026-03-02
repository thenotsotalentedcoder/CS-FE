import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.jsx';
import { supabase } from '../lib/supabaseClient.js';

export default function Login() {
  const { signIn, user, session } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  // Redirect already-logged-in users (wait for user row to load)
  useEffect(() => {
    if (session && user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [session, user, navigate]);

  // Still loading auth state — don't render the form yet
  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" aria-label="Loading" />
    </div>
  );

  async function handleForgot(e) {
    e.preventDefault();
    setForgotLoading(true);
    await supabase.auth.resetPasswordForEmail(forgotEmail.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setForgotLoading(false);
    setForgotSent(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email.trim().toLowerCase(), password);
      // Keep spinner up — useEffect redirects once user row loads
    } catch (err) {
      setError(err.message || 'Invalid email or password');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top bar */}
      <motion.div
        className="flex items-center justify-between px-6 py-5 border-b border-border"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Link to="/" className="font-heading font-bold text-lg text-white tracking-tight">
          Cold<span className="text-accent">Start</span>
        </Link>
        <Link to="/" className="text-zinc-500 hover:text-white text-sm font-body transition-colors duration-200">
          ← Back to home
        </Link>
      </motion.div>

      {/* Content */}
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          <AnimatePresence mode="wait">
            {forgotMode ? (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="mb-8">
                  <h1 className="font-heading font-bold text-3xl text-white mb-2">Reset password</h1>
                  <p className="text-zinc-500 font-body text-sm">
                    Enter your email and we'll send a reset link.
                  </p>
                </div>

                {forgotSent ? (
                  <div className="space-y-4">
                    <p className="text-accent font-body text-sm">
                      Check your inbox — a reset link has been sent.
                    </p>
                    <button
                      onClick={() => { setForgotMode(false); setForgotSent(false); setForgotEmail(''); }}
                      className="btn-secondary w-full"
                    >
                      Back to sign in
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgot} className="space-y-4" noValidate>
                    <div>
                      <label htmlFor="forgot-email" className="label">Email</label>
                      <input
                        id="forgot-email"
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="input"
                      />
                    </div>
                    <button type="submit" disabled={forgotLoading || !forgotEmail} className="btn-primary w-full">
                      {forgotLoading ? 'Sending...' : 'Send reset link'}
                    </button>
                    <button type="button" onClick={() => setForgotMode(false)} className="btn-secondary w-full">
                      Cancel
                    </button>
                  </form>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Heading */}
                <div className="mb-8">
                  <h1 className="font-heading font-bold text-3xl text-white mb-2">Welcome back</h1>
                  <p className="text-zinc-500 font-body text-sm">Sign in to your ColdStart account</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div>
                    <label htmlFor="email" className="label">Email</label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="input"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="password" className="label mb-0">Password</label>
                      <button
                        type="button"
                        onClick={() => setForgotMode(true)}
                        className="text-xs text-zinc-500 hover:text-white transition-colors duration-200 cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input"
                    />
                  </div>

                  {error && (
                    <p className="text-red-400 text-sm font-body">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !email || !password}
                    className="btn-primary w-full mt-2"
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </button>
                </form>

                {/* Footer */}
                <p className="text-zinc-600 text-sm font-body mt-6 text-center">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-accent hover:text-accent-dim transition-colors duration-200">
                    Sign up
                  </Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
