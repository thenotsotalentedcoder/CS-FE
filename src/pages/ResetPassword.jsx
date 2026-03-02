import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient.js';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [validSession, setValidSession] = useState(false);

  useEffect(() => {
    // Supabase puts the recovery token in the URL hash — getSession picks it up
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setValidSession(true);
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setDone(true);
      setTimeout(() => navigate('/login', { replace: true }), 2500);
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
      </motion.div>

      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          {done ? (
            <div className="text-center space-y-3">
              <p className="font-heading font-bold text-2xl text-white">Password updated</p>
              <p className="text-zinc-500 font-body text-sm">Redirecting you to sign in…</p>
            </div>
          ) : !validSession ? (
            <div className="text-center space-y-4">
              <p className="font-heading font-bold text-2xl text-white">Invalid or expired link</p>
              <p className="text-zinc-500 font-body text-sm">Request a new reset link from the sign in page.</p>
              <Link to="/login" className="btn-secondary inline-block mt-2">Back to sign in</Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="font-heading font-bold text-3xl text-white mb-2">Set new password</h1>
                <p className="text-zinc-500 font-body text-sm">Choose a strong password for your account.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="new-password" className="label">New password</label>
                  <input
                    id="new-password"
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input"
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label htmlFor="confirm-password" className="label">Confirm password</label>
                  <input
                    id="confirm-password"
                    type="password"
                    required
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="input"
                    autoComplete="new-password"
                  />
                </div>

                {error && <p className="text-red-400 text-sm font-body">{error}</p>}

                <button
                  type="submit"
                  disabled={loading || !password || !confirm}
                  className="btn-primary w-full mt-2"
                >
                  {loading ? 'Updating...' : 'Update password'}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
