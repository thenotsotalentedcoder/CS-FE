import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';
import api from '../../lib/api.js';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const hasGroup = !!user?.group;

  useEffect(() => {
    if (!hasGroup) { setLoading(false); return; }

    async function load() {
      try {
        const [tasksRes, annRes] = await Promise.all([
          api.get('/api/tasks/my'),
          api.get('/api/announcements'),
        ]);
        setTasks(tasksRes.data.slice(0, 5));
        setAnnouncements(annRes.data.slice(0, 3));
      } catch {
        // handled silently — empty state shows
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [hasGroup]);

  return (
    <AppLayout>
      {/* Page header */}
      <div className="mb-8 animate-fade-up">
        <p className="text-zinc-500 text-sm font-body mb-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="font-heading font-bold text-3xl text-white">
          Hey, {user?.full_name?.split(' ')[0]}
        </h1>
      </div>

      {/* Pending group state */}
      {!hasGroup && (
        <div className="animate-fade-up delay-75">
          <div className="card border-amber-500/20 bg-amber-500/5 p-8 text-center max-w-md mx-auto mt-12">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
              <ClockIcon />
            </div>
            <h2 className="font-heading font-semibold text-white text-lg mb-2">
              Waiting for group assignment
            </h2>
            <p className="text-zinc-500 font-body text-sm leading-relaxed">
              Your account is active. The admin will assign you to a group shortly — you'll get full access once that's done.
            </p>
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-zinc-600 text-xs font-body mb-3">While you wait, browse public resources</p>
              <Link to="/resources" className="btn-secondary text-sm inline-flex items-center gap-2">
                View public resources
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Active dashboard */}
      {hasGroup && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            <StatCard
              label="Group"
              value={`Group ${user.group}`}
              accent
              delay="delay-75"
            />
            <StatCard
              label="Skill level"
              value={user.skill_level ? capitalize(user.skill_level) : '—'}
              delay="delay-150"
            />
            <StatCard
              label="Active tasks"
              value={tasks.filter(t => !t.submission).length}
              delay="delay-225"
            />
          </div>

          {/* Two column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Tasks — wider */}
            <section className="lg:col-span-3 animate-fade-up delay-150">
              <SectionHeader title="Active tasks" href="/my-tasks" />
              {loading ? (
                <SkeletonList rows={3} />
              ) : tasks.length === 0 ? (
                <EmptyState text="No tasks assigned yet" />
              ) : (
                <ul className="space-y-3">
                  {tasks.map((task, i) => (
                    <TaskRow key={task.id} task={task} index={i} />
                  ))}
                </ul>
              )}
            </section>

            {/* Announcements — narrower */}
            <section className="lg:col-span-2 animate-fade-up delay-225">
              <SectionHeader title="Announcements" href="/announcements" />
              {loading ? (
                <SkeletonList rows={2} />
              ) : announcements.length === 0 ? (
                <EmptyState text="No announcements yet" />
              ) : (
                <ul className="space-y-3">
                  {announcements.map((ann, i) => (
                    <AnnouncementRow key={ann.id} ann={ann} index={i} />
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </AppLayout>
  );
}

function StatCard({ label, value, accent, delay = '' }) {
  return (
    <div className={`card animate-fade-up ${delay}`}>
      <p className="text-zinc-600 text-xs font-body uppercase tracking-wider mb-2">{label}</p>
      <p className={`font-heading font-bold text-2xl ${accent ? 'text-accent' : 'text-white'}`}>
        {value}
      </p>
    </div>
  );
}

function SectionHeader({ title, href }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-heading font-semibold text-white text-base">{title}</h2>
      <Link
        to={href}
        className="text-xs text-zinc-500 hover:text-accent transition-colors duration-200 font-body"
      >
        View all →
      </Link>
    </div>
  );
}

function TaskRow({ task, index }) {
  const isLate = task.submission?.is_late;
  const status = task.submission?.status;

  return (
    <li
      className="animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <Link
        to={`/my-tasks/${task.id}`}
        className="card flex items-start justify-between gap-4 hover:border-[#2a2a2a] cursor-pointer block"
      >
        <div className="flex-1 min-w-0">
          <p className="font-heading font-medium text-white text-sm truncate mb-1">{task.title}</p>
          <p className="text-zinc-600 text-xs font-body">
            Due {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {isOverdue(task.deadline) && !status && (
              <span className="text-red-500 ml-2">· Overdue</span>
            )}
          </p>
        </div>
        <StatusBadge status={status} isLate={isLate} />
      </Link>
    </li>
  );
}

function AnnouncementRow({ ann, index }) {
  return (
    <li
      className="animate-fade-up card"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <p className="font-heading font-medium text-white text-sm mb-1">{ann.title}</p>
      <p className="text-zinc-500 font-body text-xs line-clamp-2">{ann.body}</p>
      <p className="text-zinc-700 text-[11px] font-body mt-2">
        {new Date(ann.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </p>
    </li>
  );
}

function StatusBadge({ status, isLate }) {
  if (!status) return <span className="badge badge-not-submitted flex-shrink-0">Not submitted</span>;
  if (status === 'reviewed') return <span className="badge badge-reviewed flex-shrink-0">Reviewed</span>;
  if (isLate) return <span className="badge badge-late flex-shrink-0">Late</span>;
  return <span className="badge badge-submitted flex-shrink-0">Submitted</span>;
}

function SkeletonList({ rows }) {
  return (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="card space-y-2">
          <div className="skeleton h-4 w-2/3" />
          <div className="skeleton h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="card text-center py-8">
      <p className="text-zinc-600 font-body text-sm">{text}</p>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function isOverdue(deadline) {
  return new Date() > new Date(deadline);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
