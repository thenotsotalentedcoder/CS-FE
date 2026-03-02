import { useEffect, useRef } from 'react';
import { useNotifications } from '../../hooks/useNotifications.jsx';

const TYPE_LABELS = {
  task_assigned: 'Task',
  resource_posted: 'Resource',
  announcement: 'Announcement',
  feedback_posted: 'Feedback',
};

export default function NotificationPanel({ open, onClose }) {
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();
  const panelRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Notifications"
        className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-surface border-l border-border flex flex-col animate-slide-in-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-semibold text-white text-base">Notifications</h2>
            {unreadCount > 0 && (
              <span className="badge badge-reviewed">{unreadCount}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-zinc-500 hover:text-accent transition-colors duration-200 cursor-pointer font-body"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-surface-2 transition-colors duration-200 cursor-pointer focus-ring"
              aria-label="Close notifications"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="skeleton h-3 w-1/3" />
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-3 w-2/3" />
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 px-5">
              <p className="text-zinc-600 font-body text-sm">No notifications yet</p>
            </div>
          ) : (
            <ul>
              {notifications.map((n, i) => (
                <li
                  key={n.id}
                  className={`animate-fade-up border-b border-border last:border-0`}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <button
                    onClick={() => !n.is_read && markRead(n.id)}
                    className={`w-full text-left px-5 py-4 transition-colors duration-200 cursor-pointer
                      ${n.is_read ? 'hover:bg-surface-2' : 'bg-accent/5 hover:bg-accent/10'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="badge badge-reviewed text-[10px]">
                            {TYPE_LABELS[n.type] || n.type}
                          </span>
                          {!n.is_read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" aria-label="Unread" />
                          )}
                        </div>
                        <p className={`text-sm font-heading font-medium truncate ${n.is_read ? 'text-zinc-400' : 'text-white'}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-zinc-600 font-body mt-0.5 line-clamp-2">{n.body}</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-zinc-700 font-body mt-2">
                      {timeAgo(n.created_at)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

function CloseIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
