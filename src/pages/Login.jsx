import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.jsx';

export default function Login() {
  const { signIn, user, session } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-heading font-bold text-3xl text-white mb-2">
              Welcome back
            </h1>
            <p className="text-zinc-500 font-body text-sm">
              Sign in to your ColdStart account
            </p>
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
              <label htmlFor="password" className="label">Password</label>
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
      </div>
    </div>
  );
}
