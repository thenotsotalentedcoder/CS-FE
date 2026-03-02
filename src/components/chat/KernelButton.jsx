import { useState } from 'react';
import { motion } from 'framer-motion';
import KernelPanel from './KernelPanel.jsx';

export default function KernelButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <KernelPanel open={open} onClose={() => setOpen(false)} />

      {/* Floating trigger */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-5 right-4 sm:right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer focus-ring"
        style={{
          background: open
            ? 'rgba(34, 197, 94, 0.15)'
            : 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(34, 197, 94, 0.35)',
          boxShadow: '0 0 20px rgba(34, 197, 94, 0.2), 0 4px 20px rgba(0,0,0,0.5)',
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        aria-label="Open Kernel AI assistant"
      >
        <span
          className="text-accent font-heading font-bold text-base"
          style={{ textShadow: '0 0 12px rgba(34,197,94,0.8)' }}
        >
          K
        </span>
      </motion.button>
    </>
  );
}
