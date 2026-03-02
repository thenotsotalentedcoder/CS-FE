import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../lib/api.js';

const STEP = { EMAIL: 'email', DETAILS: 'details', DONE: 'done' };

export default function Signup() {
  const navigate = useNavigate();

  const [step, setStep] = useState(STEP.EMAIL);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1 — check if email is on the allowlist
  async function handleCheckEmail(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/api/auth/check-email', {
        email: email.trim().toLowerCase(),
      });

      if (!data.allowed) {
        setError("This email isn't enrolled. Contact your admin to get added.");
        return;
      }

      setStep(STEP.DETAILS);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Step 2 — create account
  async function handleCreateAccount(e) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/api/auth/signup', {
        email: email.trim().toLowerCase(),
        password,
        full_name: fullName.trim(),
      });

      setStep(STEP.DONE);
    } catch (err) {
      setError(err.response?.data?.error || 'Account creation failed. Please try again.');
    } finally {
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

          {/* Step indicator */}
          {step !== STEP.DONE && (
            <div className="flex items-center gap-2 mb-8">
              <StepDot active={step === STEP.EMAIL} done={step === STEP.DETAILS} label="1" />
              <div className="flex-1 h-px bg-border" />
              <StepDot active={step === STEP.DETAILS} done={false} label="2" />
            </div>
          )}

          {/* Step 1 — Email check */}
          {step === STEP.EMAIL && (
            <>
              <div className="mb-8">
                <h1 className="font-heading font-bold text-3xl text-white mb-2">
                  Create account
                </h1>
                <p className="text-zinc-500 font-body text-sm">
                  Enter your enrolled email to get started
                </p>
              </div>

              <form onSubmit={handleCheckEmail} className="space-y-4" noValidate>
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

                {error && (
                  <p className="text-red-400 text-sm font-body">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="btn-primary w-full mt-2"
                >
                  {loading ? 'Checking...' : 'Continue'}
                </button>
              </form>

              <p className="text-zinc-600 text-sm font-body mt-6 text-center">
                Already have an account?{' '}
                <Link to="/login" className="text-accent hover:text-accent-dim transition-colors duration-200">
                  Sign in
                </Link>
              </p>
            </>
          )}

          {/* Step 2 — Name + Password */}
          {step === STEP.DETAILS && (
            <>
              <div className="mb-8">
                <h1 className="font-heading font-bold text-3xl text-white mb-2">
                  Set up your account
                </h1>
                <p className="text-zinc-500 font-body text-sm">
                  Creating account for{' '}
                  <span className="text-zinc-300">{email}</span>
                </p>
              </div>

              <form onSubmit={handleCreateAccount} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="fullName" className="label">Full name</label>
                  <input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className="input"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="label">Password</label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="input"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="label">Confirm password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    className="input"
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-sm font-body">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !fullName || !password || !confirmPassword}
                  className="btn-primary w-full mt-2"
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep(STEP.EMAIL); setError(''); }}
                  className="btn-ghost w-full"
                >
                  ← Change email
                </button>
              </form>
            </>
          )}

          {/* Done state */}
          {step === STEP.DONE && (
            <div className="text-center">
              {/* Green checkmark */}
              <div className="w-14 h-14 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center mx-auto mb-6">
                <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h1 className="font-heading font-bold text-2xl text-white mb-2">
                Account created
              </h1>
              <p className="text-zinc-500 font-body text-sm mb-8 leading-relaxed">
                Your account is ready. Sign in and wait for your admin to assign you to a group.
              </p>

              <button
                onClick={() => navigate('/login')}
                className="btn-primary w-full"
              >
                Go to sign in
              </button>
            </div>
          )}

        </motion.div>
      </div>
    </div>
  );
}

function StepDot({ active, done, label }) {
  return (
    <div
      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-heading font-semibold border transition-colors duration-200
        ${active ? 'bg-accent border-accent text-black' : done ? 'bg-accent/20 border-accent/40 text-accent' : 'bg-surface-2 border-border text-zinc-600'}`}
    >
      {done ? (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : label}
    </div>
  );
}
