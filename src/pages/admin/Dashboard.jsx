import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout.jsx';
import api from '../../lib/api.js';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/stats')
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <div className="mb-8 animate-fade-up">
        <p className="text-zinc-500 text-sm font-body mb-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="font-heading font-bold text-3xl text-white">Overview</h1>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card space-y-2">
                <div className="skeleton h-3 w-1/2" />
                <div className="skeleton h-8 w-1/3" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Top stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-up delay-75">
            <StatCard label="Active tasks" value={stats?.active_tasks ?? 0} accent />
            <StatCard label="Pending review" value={stats?.pending_reviews ?? 0} />
            <StatCard label="Late submissions" value={stats?.late_submissions?.length ?? 0} danger={stats?.late_submissions?.length > 0} />
            <StatCard
              label="Total students"
              value={Object.values(stats?.students_per_group ?? {}).reduce((a, b) => a + b, 0)}
            />
          </div>

          {/* Group breakdown + late submissions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Group breakdown */}
            <section className="animate-fade-up delay-150">
              <h2 className="font-heading font-semibold text-white text-base mb-4">Students by group</h2>
              <div className="card divide-y divide-border">
                {['A', 'B', 'C'].map(g => (
                  <div key={g} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center">
                        <span className="font-heading font-bold text-accent text-sm">{g}</span>
                      </div>
                      <span className="font-heading font-medium text-white text-sm">Group {g}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-heading font-bold text-white text-lg">
                        {stats?.students_per_group?.[g] ?? 0}
                      </span>
                      <Link
                        to={`/admin/students?group=${g}`}
                        className="text-xs text-zinc-500 hover:text-accent transition-colors duration-200 font-body"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Late submissions */}
            <section className="animate-fade-up delay-225">
              <h2 className="font-heading font-semibold text-white text-base mb-4">
                Late submissions
                {stats?.late_submissions?.length > 0 && (
                  <span className="ml-2 badge badge-late">{stats.late_submissions.length}</span>
                )}
              </h2>
              {!stats?.late_submissions?.length ? (
                <div className="card text-center py-10">
                  <p className="text-zinc-600 font-body text-sm">No late submissions</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {stats.late_submissions.slice(0, 6).map((s, i) => (
                    <div
                      key={s.id}
                      className="card flex items-center justify-between gap-4 animate-fade-up"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <div className="min-w-0">
                        <p className="font-heading font-medium text-white text-sm truncate">
                          {s.users?.full_name}
                        </p>
                        <p className="text-zinc-600 text-xs font-body truncate">
                          {s.tasks?.title}
                        </p>
                      </div>
                      <span className="badge badge-late flex-shrink-0">Late</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </AppLayout>
  );
}

function StatCard({ label, value, accent, danger }) {
  return (
    <div className="card">
      <p className="text-zinc-600 text-xs font-body uppercase tracking-wider mb-2">{label}</p>
      <p className={`font-heading font-bold text-3xl ${danger ? 'text-red-400' : accent ? 'text-accent' : 'text-white'}`}>
        {value}
      </p>
    </div>
  );
}
