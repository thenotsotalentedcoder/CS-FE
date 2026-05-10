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

  const totalStudents = stats ? 
    Object.values(stats.students_breakdown.webdev).reduce((a, b) => a + b, 0) +
    Object.values(stats.students_breakdown.ai).reduce((a, b) => a + b, 0) : 0;

  return (
    <AppLayout>
      <div className="mb-8 animate-fade-up">
        <p className="text-zinc-500 text-sm font-body mb-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="font-heading font-bold text-3xl text-white">Platform Overview</h1>
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
            <StatCard label="Total students" value={totalStudents} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Web Dev Track */}
            <section className="animate-fade-up delay-150">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-6 bg-emerald-500 rounded-full" />
                <h2 className="font-heading font-semibold text-white text-lg">Web Development</h2>
              </div>
              <div className="card divide-y divide-border">
                {['A', 'B'].map(g => (
                  <div key={g} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <span className="font-heading font-bold text-emerald-400 text-sm">{g}</span>
                      </div>
                      <div>
                        <p className="font-heading font-medium text-white text-sm">Group {g}</p>
                        <p className="text-zinc-600 text-[10px] uppercase font-body tracking-wider">Frontend/MERN</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-heading font-bold text-white text-xl">
                        {stats?.students_breakdown?.webdev?.[g] ?? 0}
                      </span>
                      <Link
                        to={`/admin/students?domain=webdev&group=${g}`}
                        className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors font-body"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* AI Track */}
            <section className="animate-fade-up delay-225">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-6 bg-purple-500 rounded-full" />
                <h2 className="font-heading font-semibold text-white text-lg">Artificial Intelligence</h2>
              </div>
              <div className="card divide-y divide-border">
                {['A', 'B', 'C'].map(g => (
                  <div key={g} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                        <span className="font-heading font-bold text-purple-400 text-sm">{g}</span>
                      </div>
                      <div>
                        <p className="font-heading font-medium text-white text-sm">Group {g}</p>
                        <p className="text-zinc-600 text-[10px] uppercase font-body tracking-wider">ML/GenAI</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-heading font-bold text-white text-xl">
                        {stats?.students_breakdown?.ai?.[g] ?? 0}
                      </span>
                      <Link
                        to={`/admin/students?domain=ai&group=${g}`}
                        className="text-xs text-zinc-500 hover:text-purple-400 transition-colors font-body"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Late submissions footer */}
          {stats?.late_submissions?.length > 0 && (
            <section className="animate-fade-up delay-300">
               <h2 className="font-heading font-semibold text-red-400 text-base mb-4 flex items-center gap-2">
                 <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                 </span>
                 Urgent Attention Required
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                 {stats.late_submissions.map(s => (
                   <div key={s.id} className="card bg-red-500/[0.02] border-red-500/10 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-heading font-medium text-white text-xs truncate">{s.users?.full_name}</p>
                        <p className="text-zinc-600 text-[10px] font-body truncate">{s.tasks?.title}</p>
                      </div>
                      <Link to={`/admin/submissions/${s.id}`} className="text-[10px] text-red-400 font-heading hover:underline">Review</Link>
                   </div>
                 ))}
               </div>
            </section>
          )}
        </>
      )}
    </AppLayout>
  );
}

function StatCard({ label, value, accent, danger }) {
  return (
    <div className="card hover:border-zinc-700 transition-colors">
      <p className="text-zinc-600 text-[10px] font-body uppercase tracking-wider mb-2">{label}</p>
      <p className={`font-heading font-bold text-3xl ${danger ? 'text-red-400' : accent ? 'text-accent' : 'text-white'}`}>
        {value}
      </p>
    </div>
  );
}
