import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../lib/api.js';

// Shared animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
  }),
};


const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Dot-grid texture */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
        aria-hidden="true"
      />
      {/* Accent glow */}
      <div
        className="fixed top-0 left-0 pointer-events-none"
        style={{
          width: '60vw',
          height: '60vh',
          background: 'radial-gradient(ellipse at top left, rgba(34,197,94,0.07) 0%, transparent 65%)',
        }}
        aria-hidden="true"
      />

      {/* Navbar */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-heading font-bold text-base tracking-tight">
            Cold<span className="text-accent">Start</span>
          </span>
          <div className="flex items-center gap-2">
            <Link
              to="/resources"
              className="text-zinc-500 hover:text-white text-sm font-body transition-colors duration-200 px-3 py-1.5 hidden sm:block"
            >
              Resources
            </Link>
            <Link to="/login" className="btn-secondary text-sm px-4 py-1.5">Sign in</Link>
            <Link to="/signup" className="btn-primary text-sm px-4 py-1.5">Get started</Link>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="pt-44 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Giant headline — word by word reveal */}
          <div className="mb-12 pb-3">
            <motion.h1
              className="font-heading font-bold leading-[0.88] tracking-tight text-white"
              style={{ fontSize: 'clamp(3.5rem, 10vw, 9rem)' }}
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
              }}
            >
              {['Stop', 'winging it.'].map((word) => (
                <motion.span
                  key={word}
                  className="block"
                  variants={{
                    hidden: { opacity: 0, y: 40 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
                  }}
                >
                  {word}
                </motion.span>
              ))}
              <motion.span
                className="block text-accent"
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
                }}
              >
                Build right.
              </motion.span>
            </motion.h1>
          </div>

          {/* Description + CTA */}
          <motion.div
            className="flex flex-col sm:flex-row sm:items-end gap-8 sm:gap-16"
            custom={0.55}
            initial="hidden"
            animate="show"
            variants={fadeUp}
          >
            <p className="text-zinc-400 font-body text-base leading-relaxed max-w-sm">
              A private platform built for this web dev community.
              Tasks, deadlines, resources, and feedback — all in one place,
              structured around your skill level.
            </p>
            <div className="flex items-center gap-3 shrink-0">
              <Link to="/signup" className="btn-primary text-sm px-6 py-2.5">
                Create account
              </Link>
              <Link to="/resources" className="btn-ghost text-sm px-6 py-2.5">
                Browse resources
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="border-t border-white/5" />

      {/* How it works */}
      <section className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            {/* Left sticky label */}
            <motion.div
              className="lg:sticky lg:top-32"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
              custom={0}
            >
              <p className="font-body text-xs tracking-[0.2em] uppercase text-zinc-600 mb-4">
                How it works
              </p>
              <h2
                className="font-heading font-bold text-white leading-tight"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
              >
                Structured.<br />
                Not complicated.
              </h2>
            </motion.div>

            {/* Right: numbered steps */}
            <motion.div
              className="space-y-0"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              variants={staggerContainer}
            >
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.title}
                  className="border-t border-white/8 py-8 group"
                  variants={staggerItem}
                >
                  <div className="flex items-start gap-6">
                    <span className="font-heading font-bold text-xs text-zinc-700 tabular-nums pt-1 w-5 shrink-0">
                      0{i + 1}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-heading font-semibold text-white text-base mb-2 group-hover:text-accent transition-colors duration-200">
                        {step.title}
                      </h3>
                      <p className="text-zinc-500 font-body text-sm leading-relaxed">
                        {step.body}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
              <div className="border-t border-white/8" />
            </motion.div>
          </div>
        </div>
      </section>

      <div className="border-t border-white/5" />

      {/* Groups */}
      <section className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            custom={0}
          >
            <p className="font-body text-xs tracking-[0.2em] uppercase text-zinc-600 mb-4">
              Skill groups
            </p>
            <h2
              className="font-heading font-bold text-white leading-tight mb-16"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
            >
              Three paths,<br />
              one platform.
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/5 border border-white/5 rounded-lg overflow-hidden"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
          >
            {GROUPS.map((g) => (
              <motion.div
                key={g.label}
                className="bg-black p-8 group hover:bg-zinc-950 transition-colors duration-300 cursor-default"
                variants={staggerItem}
              >
                <div className="flex items-center justify-between mb-8">
                  <motion.span
                    className="font-heading font-black text-accent"
                    style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', lineHeight: 1 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    {g.label}
                  </motion.span>
                  <span className="text-zinc-700 text-xs font-body">{g.track}</span>
                </div>
                <h3 className="font-heading font-bold text-white text-lg mb-3">{g.title}</h3>
                <p className="text-zinc-500 font-body text-sm leading-relaxed">{g.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="border-t border-white/5" />

      {/* Kernel */}
      <section className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

            {/* Left: label + copy */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
              custom={0}
            >
              <p className="font-body text-xs tracking-[0.2em] uppercase text-zinc-600 mb-4">
                AI Assistant
              </p>
              <h2
                className="font-heading font-bold text-white leading-tight mb-6"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
              >
                Meet<br />
                <span className="text-accent">Kernel.</span>
              </h2>
              <p className="text-zinc-400 font-body text-sm leading-relaxed max-w-sm">
                Ask it anything. It already knows your tasks, deadlines, and where you're at.
              </p>
            </motion.div>

            {/* Right: fake chat window */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            >
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(34,197,94,0.18)',
                  boxShadow: '0 0 60px rgba(34,197,94,0.06), 0 24px 64px rgba(0,0,0,0.5)',
                }}
              >
                {/* Window chrome */}
                <div
                  className="flex items-center justify-between px-4 py-3 border-b"
                  style={{ borderColor: 'rgba(34,197,94,0.12)' }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full bg-accent/15 border border-accent/35 flex items-center justify-center text-accent text-xs font-heading font-bold"
                      style={{ boxShadow: '0 0 12px rgba(34,197,94,0.3)' }}
                    >
                      K
                    </div>
                    <div>
                      <p className="text-white text-sm font-heading font-semibold leading-none">Kernel</p>
                      <p className="text-accent text-xs font-body mt-0.5 leading-none" style={{ textShadow: '0 0 8px rgba(34,197,94,0.5)' }}>
                        AI Assistant
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                    <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                    <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  </div>
                </div>

                {/* Messages */}
                <div className="px-4 py-5 space-y-4">
                  {KERNEL_DEMO.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 + i * 0.12 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <div
                          className="w-5 h-5 rounded-full bg-accent/20 border border-accent/35 flex items-center justify-center text-accent text-[10px] font-heading font-bold mr-2 mt-1 shrink-0"
                          style={{ boxShadow: '0 0 6px rgba(34,197,94,0.3)' }}
                        >
                          K
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs font-body leading-relaxed
                          ${msg.role === 'user'
                            ? 'bg-accent text-black font-medium rounded-br-sm'
                            : 'bg-white/5 border border-white/8 text-zinc-300 rounded-bl-sm'
                          }`}
                      >
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Input bar */}
                <div
                  className="flex items-center gap-2 px-4 py-3 border-t"
                  style={{ borderColor: 'rgba(34,197,94,0.08)' }}
                >
                  <div className="flex-1 bg-white/5 border border-white/8 rounded-xl px-3.5 py-2 text-xs text-zinc-600 font-body">
                    Ask Kernel anything...
                  </div>
                  <div className="w-7 h-7 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      <div className="border-t border-white/5" />

      {/* Public resources preview */}
      <section className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="flex items-end justify-between gap-4 mb-12 flex-wrap"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            custom={0}
          >
            <div>
              <p className="font-body text-xs tracking-[0.2em] uppercase text-zinc-600 mb-4">
                Resources
              </p>
              <h2
                className="font-heading font-bold text-white leading-tight"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
              >
                Curated for<br />
                this community.
              </h2>
            </div>
            <Link
              to="/resources"
              className="text-zinc-500 hover:text-white font-body text-sm transition-colors duration-200 shrink-0"
            >
              Browse all →
            </Link>
          </motion.div>

          <ResourcesPreview />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <span className="font-heading font-bold text-sm">
            Cold<span className="text-accent">Start</span>
          </span>
          <span className="text-zinc-700 text-xs font-body">Beta</span>
        </div>
      </footer>
    </div>
  );
}

const TYPE_META = {
  youtube:       { label: 'YouTube', color: 'text-red-400',    bar: 'bg-red-500' },
  documentation: { label: 'Docs',    color: 'text-blue-400',   bar: 'bg-blue-500' },
  repository:    { label: 'Repo',    color: 'text-purple-400', bar: 'bg-purple-500' },
};

function ResourcesPreview() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/resources/public')
      .then(r => setResources((r.data || []).slice(0, 6)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-xl p-5 space-y-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="skeleton h-3 w-16" />
            <div className="skeleton h-4 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="border border-white/5 rounded-xl p-12 text-center">
        <p className="text-zinc-700 font-body text-sm">No public resources yet.</p>
      </div>
    );
  }

  const cols = resources.length === 1 ? 'grid-cols-1 max-w-sm' : resources.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : resources.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  return (
    <motion.div
      className={`grid gap-3 ${cols}`}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={staggerContainer}
    >
      {resources.map(r => {
        const meta = TYPE_META[r.type] || { label: r.type, color: 'text-zinc-400', bar: 'bg-zinc-600' };
        return (
          <motion.a
            key={r.id}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative rounded-xl overflow-hidden flex flex-col p-5 gap-2 min-h-[100px] transition-transform duration-200 hover:-translate-y-0.5"
            style={{ background: 'rgba(255,255,255,0.02)' }}
            variants={staggerItem}
          >
            <div className={`absolute top-0 left-0 right-0 h-[2px] ${meta.bar} opacity-60 group-hover:opacity-100 transition-opacity duration-200`} />
            <span className={`font-heading font-medium text-xs ${meta.color}`}>
              {meta.label}
            </span>
            <p className="text-zinc-300 group-hover:text-white font-heading font-semibold text-sm leading-snug transition-colors duration-200 line-clamp-2 flex-1">
              {r.title}
            </p>
          </motion.a>
        );
      })}
    </motion.div>
  );
}

const KERNEL_DEMO = [
  { role: 'user', content: 'My Figma task is due tomorrow. Where do I start?' },
  { role: 'assistant', content: "Start with a UI kit from Figma Community — search \"food app free\". Use existing components for buttons and cards so you're not building from scratch. Focus on 3 screens max: home, item detail, and cart." },
  { role: 'user', content: 'Any good resources on Figma?' },
  { role: 'assistant', content: 'There\'s a Figma Basics video in your resources tab. That\'s your fastest path in.' },
];

const STEPS = [
  {
    title: 'Admin assigns you tasks',
    body: 'Tasks come with deadlines and optional reference material. You know exactly what to build and when.',
  },
  {
    title: 'You submit your Github repo',
    body: 'When done, push changes in your repo and repo link. Submit it through the platform to notify admin it’s ready for review.',
  },
  {
    title: 'Feedback comes back to you',
    body: 'Admin reviews your work and leaves feedback directly on the platform. No DMs, no delays.',
  },
  {
    title: 'Resources are curated for you',
    body: 'YouTube links, docs, repos — organized by your group and skill level. Save the ones you need.',
  },
];

const GROUPS = [
  {
    label: 'A',
    title: 'Beginners',
    track: 'HTML track',
    desc: 'No prior experience. You start from zero — HTML structure, CSS styling, the fundamentals.',
  },
  {
    label: 'B',
    title: 'Intermediate',
    track: 'JS track',
    desc: 'HTML and CSS are solid. Now you learn JavaScript — DOM, events, logic, interactivity.',
  },
  {
    label: 'C',
    title: 'Advanced',
    track: 'MERN track',
    desc: 'Full JavaScript fluency. You build complete full-stack apps using MongoDB, Express, React, Node.',
  },
];
