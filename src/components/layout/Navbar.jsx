import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useNotifications } from '../../hooks/useNotifications.jsx';
import NotificationPanel from './NotificationPanel.jsx';
import { useState } from 'react';

export default function Navbar({ onMenuOpen }) {
  const { user, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-black border-b border-border flex items-center justify-between px-4 sm:px-6">
        {/* Left: hamburger (mobile) + logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuOpen}
            className="lg:hidden p-2 rounded-md text-zinc-500 hover:text-white hover:bg-surface-2 transition-colors duration-200 cursor-pointer focus-ring"
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>
          <Link
            to={user?.role === 'admin' ? '/admin' : '/dashboard'}
            className="font-heading font-bold text-base text-white tracking-tight focus-ring rounded"
          >
            Cold<span className="text-accent">Start</span>
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification bell */}
          <button
            onClick={() => setPanelOpen(true)}
            className="relative p-2 rounded-md text-zinc-400 hover:text-white hover:bg-surface-2 transition-colors duration-200 cursor-pointer focus-ring"
            aria-label="Notifications"
          >
            <BellIcon />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full animate-pulse-accent" aria-hidden="true" />
            )}
          </button>

          {/* User info + sign out */}
          <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-border">
            <div className="text-right hidden sm:block">
              <p className="text-white text-sm font-heading font-medium leading-none">{user?.full_name}</p>
              <p className="text-zinc-600 text-xs font-body mt-0.5 leading-none capitalize">{user?.role}</p>
            </div>
            <button
              onClick={signOut}
              className="p-2 rounded-md text-zinc-500 hover:text-white hover:bg-surface-2 transition-colors duration-200 cursor-pointer focus-ring"
              aria-label="Sign out"
            >
              <SignOutIcon />
            </button>
          </div>
        </div>
      </header>

      <NotificationPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </>
  );
}

function MenuIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  );
}
