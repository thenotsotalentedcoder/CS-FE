import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';

export default function AppLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black">
      <Navbar onMenuOpen={() => setMobileMenuOpen(true)} />
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      {/* Main content — lg: offset for fixed sidebar (w-56), always offset for navbar (h-14) */}
      <main className="lg:pl-56 pt-14 min-h-screen">
        <motion.div
          className="p-4 sm:p-6 max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
