import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../lib/api.js';
import { useAuth } from '../hooks/useAuth.jsx';

const TYPES = ['all', 'youtube', 'documentation', 'repository'];
const CATEGORIES = ['all', 'web dev', 'essentials', 'ai', 'misc'];

const TYPE_META = {
  youtube:       { label: 'YouTube',  color: 'text-red-400',    bar: 'bg-red-500',    dim: 'rgba(239,68,68,0.08)' },
  documentation: { label: 'Docs',     color: 'text-blue-400',   bar: 'bg-blue-500',   dim: 'rgba(59,130,246,0.08)' },
  repository:    { label: 'Repo',     color: 'text-purple-400', bar: 'bg-purple-500', dim: 'rgba(168,85,247,0.08)' },
};

const CATEGORY_COLOR = {
  'web dev':    'text-cyan-500',
  'essentials': 'text-amber-500',
  'ai':         'text-violet-400',
  'misc':       'text-zinc-500',
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

export default function PublicResources() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/resources/public')
      .then(r => setResources(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = resources
    .filter(r => typeFilter === 'all' || r.type === typeFilter)
    .filter(r => categoryFilter === 'all' || r.category === categoryFilter);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Subtle dot-grid texture — same as landing */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
        aria-hidden="true"
      />

      {/* Navbar — exact match with landing */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 h-14 bg-black/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 sm:px-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Link to="/" className="font-heading font-bold text-base tracking-tight text-white focus-ring rounded">
          Cold<span className="text-accent">Start</span>
        </Link>
        {user ? (
          <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="btn-secondary text-sm">
            Go to dashboard
          </Link>
        ) : (
          <Link to="/login" className="btn-secondary text-sm">Sign in</Link>
        )}
      </motion.header>

      {/* Main — offset for fixed navbar */}
      <div className="pt-14 max-w-7xl mx-auto px-4 sm:px-6">

        {/* Page header row — tight, not a hero */}
        <motion.div
          className="flex items-center justify-between pt-10 pb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-white leading-tight">
            Resources
          </h1>
        </motion.div>

        {/* Filter row */}
        <motion.div
          className="flex flex-wrap items-center gap-x-1 gap-y-2 pb-6 border-b border-white/5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.18 }}
        >
          {/* Category */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`px-3 py-1.5 rounded-md text-xs font-heading font-medium transition-colors duration-200 cursor-pointer whitespace-nowrap capitalize focus-ring
                  ${categoryFilter === c
                    ? 'bg-accent/10 text-accent border border-accent/20'
                    : 'text-zinc-500 hover:text-white border border-transparent'
                  }`}
              >
                {c === 'all' ? 'All' : c}
              </button>
            ))}
          </div>

          <div className="w-px h-4 bg-white/8 mx-1 hidden sm:block shrink-0" />

          {/* Type */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {TYPES.map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-heading font-medium transition-colors duration-200 cursor-pointer whitespace-nowrap capitalize focus-ring
                  ${typeFilter === t
                    ? 'bg-white/8 text-white border border-white/10'
                    : 'text-zinc-600 hover:text-zinc-300 border border-transparent'
                  }`}
              >
                {t === 'all' ? 'All types' : t === 'documentation' ? 'Docs' : t === 'repository' ? 'Repo' : 'YouTube'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Grid */}
        <div className="py-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-xl p-5 space-y-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="skeleton h-3 w-14 rounded" />
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="border border-white/5 rounded-xl text-center py-24">
              <p className="text-zinc-700 font-body text-sm">No resources found</p>
            </div>
          ) : (
            <motion.div
              className={`grid gap-3
                ${filtered.length === 1 ? 'grid-cols-1 max-w-sm' : filtered.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : filtered.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {filtered.map(r => {
                const meta = TYPE_META[r.type] || { label: r.type, color: 'text-zinc-400', bar: 'bg-zinc-600', dim: 'rgba(255,255,255,0.04)' };
                return (
                  <motion.a
                    key={r.id}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variants={staggerItem}
                    className="group relative rounded-xl overflow-hidden flex flex-col p-5 gap-2.5 min-h-[120px] transition-transform duration-200 hover:-translate-y-0.5"
                    style={{ background: 'rgba(255,255,255,0.02)' }}
                  >
                    {/* Colored top bar */}
                    <div className={`absolute top-0 left-0 right-0 h-[2px] ${meta.bar} opacity-60 group-hover:opacity-100 transition-opacity duration-200`} />

                    {/* Type + arrow */}
                    <div className="flex items-center justify-between">
                      <span className={`font-heading font-medium text-xs ${meta.color}`}>
                        {meta.label}
                      </span>
                      <svg
                        className="w-3 h-3 text-zinc-700 group-hover:text-zinc-400 transition-colors duration-200 shrink-0"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </div>

                    {/* Title */}
                    <p className="font-heading font-semibold text-zinc-300 group-hover:text-white text-sm leading-snug line-clamp-2 transition-colors duration-200 flex-1">
                      {r.title}
                    </p>

                    {/* Subtitle */}
                    {r.subtitle && (
                      <p className="text-zinc-600 font-body text-xs leading-relaxed line-clamp-1 group-hover:text-zinc-500 transition-colors duration-200">
                        {r.subtitle}
                      </p>
                    )}

                    {/* Category */}
                    {r.category && (
                      <div className="flex justify-end mt-auto">
                        <span className={`text-xs font-heading font-medium capitalize ${CATEGORY_COLOR[r.category] ?? 'text-zinc-500'}`}>
                          {r.category}
                        </span>
                      </div>
                    )}
                  </motion.a>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>

    </div>
  );
}
