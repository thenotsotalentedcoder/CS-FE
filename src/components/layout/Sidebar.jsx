import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { motion, AnimatePresence } from 'framer-motion';

const STUDENT_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { to: '/my-tasks', label: 'Tasks', icon: TaskIcon },
  { to: '/my-resources', label: 'Resources', icon: ResourceIcon },
  { to: '/announcements', label: 'Announcements', icon: AnnouncementIcon },
];

const ADMIN_NAV = [
  { to: '/admin', label: 'Overview', icon: HomeIcon, end: true },
  { to: '/admin/students', label: 'Students', icon: StudentsIcon },
  { to: '/admin/tasks', label: 'Tasks', icon: TaskIcon },
  { to: '/admin/resources', label: 'Resources', icon: ResourceIcon },
  { to: '/admin/announcements', label: 'Announcements', icon: AnnouncementIcon },
  { to: '/admin/allowlist', label: 'Allowlist', icon: AllowlistIcon },
];

const NavItems = ({ navItems, onClose }) => (
  <>
    {navItems.map(({ to, label, icon: Icon, end }) => (
      <NavLink
        key={to}
        to={to}
        end={end}
        onClick={onClose}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-heading font-medium
           transition-colors duration-200 cursor-pointer focus-ring
           ${isActive
            ? 'bg-accent/10 text-accent'
            : 'text-zinc-500 hover:text-white hover:bg-surface-2'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <Icon active={isActive} />
            <span>{label}</span>
            {isActive && (
              <span className="ml-auto w-1 h-4 rounded-full bg-accent" aria-hidden="true" />
            )}
          </>
        )}
      </NavLink>
    ))}
  </>
);

// Desktop sidebar — hidden on mobile
export default function Sidebar({ mobileOpen, onMobileClose }) {
  const { isAdmin } = useAuth();
  const navItems = isAdmin ? ADMIN_NAV : STUDENT_NAV;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed top-14 left-0 bottom-0 w-56 bg-black border-r border-border flex-col z-40">
        <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Main navigation">
          <NavItems navItems={navItems} onClose={() => {}} />
        </nav>
        <div className="px-4 py-3 border-t border-border">
          <p className="text-zinc-700 text-xs font-body">ColdStart beta</p>
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/70 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onMobileClose}
              aria-hidden="true"
            />
            {/* Drawer */}
            <motion.aside
              className="fixed top-0 left-0 bottom-0 w-64 bg-black border-r border-border flex flex-col z-50 lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Drawer header */}
              <div className="h-14 flex items-center justify-between px-4 border-b border-border shrink-0">
                <span className="font-heading font-bold text-base text-white tracking-tight">
                  Cold<span className="text-accent">Start</span>
                </span>
                <button
                  onClick={onMobileClose}
                  className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-surface-2 transition-colors duration-200 cursor-pointer"
                  aria-label="Close menu"
                >
                  <CloseIcon />
                </button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" aria-label="Main navigation">
                <NavItems navItems={navItems} onClose={onMobileClose} />
              </nav>
              <div className="px-4 py-3 border-t border-border">
                <p className="text-zinc-700 text-xs font-body">ColdStart beta</p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function CloseIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function HomeIcon({ active }) {
  return (
    <svg className={`w-4 h-4 flex-shrink-0 ${active ? 'text-accent' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

function TaskIcon({ active }) {
  return (
    <svg className={`w-4 h-4 flex-shrink-0 ${active ? 'text-accent' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  );
}

function ResourceIcon({ active }) {
  return (
    <svg className={`w-4 h-4 flex-shrink-0 ${active ? 'text-accent' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function AnnouncementIcon({ active }) {
  return (
    <svg className={`w-4 h-4 flex-shrink-0 ${active ? 'text-accent' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
    </svg>
  );
}

function StudentsIcon({ active }) {
  return (
    <svg className={`w-4 h-4 flex-shrink-0 ${active ? 'text-accent' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function AllowlistIcon({ active }) {
  return (
    <svg className={`w-4 h-4 flex-shrink-0 ${active ? 'text-accent' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
    </svg>
  );
}
