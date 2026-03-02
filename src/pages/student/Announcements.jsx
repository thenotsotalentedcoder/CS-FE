import { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout.jsx';
import api from '../../lib/api.js';

export default function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/announcements')
      .then(r => setAnnouncements(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <div className="mb-8 animate-fade-up">
        <h1 className="font-heading font-bold text-3xl text-white mb-1">Announcements</h1>
        <p className="text-zinc-500 font-body text-sm">{announcements.length} total</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card space-y-3">
              <div className="skeleton h-5 w-1/3" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-3 w-1/4" />
            </div>
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="card text-center py-20 animate-fade-up">
          <p className="text-zinc-600 font-body text-sm">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a, i) => (
            <div
              key={a.id}
              className="card animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="font-heading font-semibold text-white text-base">{a.title}</h3>
                <span className="badge badge-not-submitted flex-shrink-0">
                  {a.target_group === 'all' ? 'All groups' : `Group ${a.target_group}`}
                </span>
              </div>
              <p className="text-zinc-400 font-body text-sm leading-relaxed mb-3">{a.body}</p>
              <p className="text-zinc-700 text-xs font-body">
                {new Date(a.created_at).toLocaleDateString('en-US', {
                  weekday: 'long', month: 'long', day: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
