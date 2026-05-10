import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import AppLayout from '../../components/layout/AppLayout.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';
import { fetchMyTasks, selectTasks, selectTasksLoading } from '../../store/slices/tasksSlice.js';
import { fetchAnnouncements, selectAnnouncements, selectAnnouncementsLoading } from '../../store/slices/announcementsSlice.js';

export default function StudentDashboard() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  
  const allTasks = useSelector(selectTasks);
  const allAnnouncements = useSelector(selectAnnouncements);
  const tasksLoading = useSelector(selectTasksLoading);
  const annLoading = useSelector(selectAnnouncementsLoading);

  const tasks = allTasks.slice(0, 5);
  const announcements = allAnnouncements.slice(0, 3);
  const loading = tasksLoading || annLoading;

  const hasGroup = !!user?.group;
  const hasDomain = !!user?.domain;

  useEffect(() => {
    if (hasGroup && hasDomain) {
      dispatch(fetchMyTasks());
      dispatch(fetchAnnouncements());
    }
  }, [hasGroup, hasDomain, dispatch]);

  const domainLabel = user?.domain === 'ai' ? 'Artificial Intelligence' : 'Web Development';
  const trackColor = user?.domain === 'ai' ? 'text-purple-400' : 'text-emerald-400';

  return (
    <AppLayout>
      {/* Page header */}
      <div className="mb-8 animate-fade-up">
        <p className="text-zinc-500 text-sm font-body mb-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <div className="flex items-end gap-3">
           <h1 className="font-heading font-bold text-3xl text-white leading-none">
             Hey, {user?.full_name?.split(' ')[0]}
           </h1>
           {hasDomain && (
             <span className={`text-[10px] font-heading uppercase tracking-widest px-2 py-1 rounded border border-white/5 bg-white/[0.02] ${trackColor}`}>
                {domainLabel}
             </span>
           )}
        </div>
      </div>

      {/* Pending state */}
      {(!hasGroup || !hasDomain) && (
        <div className="animate-fade-up delay-75">
          <div className="card border-amber-500/20 bg-amber-500/5 p-8 text-center max-w-md mx-auto mt-12">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
               <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
            </div>
            <h2 className="font-heading font-semibold text-white text-lg mb-2">
              Onboarding in progress
            </h2>
            <p className="text-zinc-500 font-body text-sm leading-relaxed">
              Your account is active. The admin is currently assigning you to your track and group. You'll get full access once that's confirmed.
            </p>
            <div className="mt-6 pt-6 border-t border-border">
              <Link to="/resources" className="btn-secondary text-sm">
                Browse Public Resources
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Active dashboard */}
      {hasGroup && hasDomain && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard
              label="Universe"
              value={domainLabel}
              color={trackColor}
              delay="delay-75"
            />
            <StatCard
              label="Group"
              value={`Group ${user.group}`}
              accent
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
            <section className="lg:col-span-3 animate-fade-up delay-150">
              <SectionHeader title="Your Task Stream" href="/my-tasks" />
              {loading ? (
                <SkeletonList rows={3} />
              ) : tasks.length === 0 ? (
                <EmptyState text="No tasks assigned to your stream yet" />
              ) : (
                <ul className="space-y-3">
                  {tasks.map((task, i) => (
                    <TaskRow key={task.id} task={task} index={i} />
                  ))}
                </ul>
              )}
            </section>

            <section className="lg:col-span-2 animate-fade-up delay-225">
              <SectionHeader title="Track Feed" href="/announcements" />
              {loading ? (
                <SkeletonList rows={2} />
              ) : announcements.length === 0 ? (
                <EmptyState text="Quiet for now..." />
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

function StatCard({ label, value, accent, color, delay = '' }) {
  return (
    <div className={`card animate-fade-up ${delay} hover:bg-white/[0.01] transition-colors`}>
      <p className="text-zinc-600 text-[10px] font-body uppercase tracking-widest mb-1.5">{label}</p>
      <p className={`font-heading font-bold text-lg leading-tight ${color ? color : accent ? 'text-accent' : 'text-white'}`}>
        {value}
      </p>
    </div>
  );
}

function SectionHeader({ title, href }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-heading font-semibold text-white text-base tracking-tight">{title}</h2>
      <Link to={href} className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-accent transition-colors font-heading">
        Explore All →
      </Link>
    </div>
  );
}

function TaskRow({ task, index }) {
  const status = task.submission?.status;
  return (
    <li className="animate-fade-up" style={{ animationDelay: `${index * 50}ms` }}>
      <Link to={`/my-tasks/${task.id}`} className="card flex items-center justify-between gap-4 hover:border-zinc-700 transition-all active:scale-[0.99]">
        <div className="min-w-0">
          <p className="font-heading font-medium text-white text-sm truncate mb-0.5">{task.title}</p>
          <p className="text-zinc-600 text-[10px] font-body flex items-center gap-2">
            <span>Deadline: {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            {task.created_by_name && (
              <>
                <span className="w-1 h-1 rounded-full bg-zinc-800" />
                <span className="text-zinc-500">Mentor: {task.created_by_name}</span>
              </>
            )}
          </p>
        </div>
        <StatusBadge status={status} />
      </Link>
    </li>
  );
}

function AnnouncementRow({ ann, index }) {
  return (
    <li className="animate-fade-up card bg-surface-2/50 border-border/50" style={{ animationDelay: `${index * 50}ms` }}>
      <p className="font-heading font-medium text-white text-sm mb-1">{ann.title}</p>
      <p className="text-zinc-500 font-body text-xs line-clamp-2 leading-relaxed">{ann.content}</p>
      <div className="mt-3 flex items-center justify-between">
         <span className="text-zinc-700 text-[10px] font-body">
            {new Date(ann.created_at).toLocaleDateString()}
         </span>
         <span className="text-[10px] text-zinc-600 font-heading uppercase">Announcement</span>
      </div>
    </li>
  );
}

function StatusBadge({ status }) {
  if (!status) return <span className="text-[10px] font-heading text-zinc-500 uppercase tracking-wider bg-zinc-800/50 px-2 py-0.5 rounded">To-do</span>;
  if (status === 'reviewed') return <span className="text-[10px] font-heading text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Passed</span>;
  return <span className="text-[10px] font-heading text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Review</span>;
}

function SkeletonList({ rows }) {
  return (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="card space-y-2"><div className="skeleton h-4 w-2/3" /><div className="skeleton h-3 w-1/3" /></div>
      ))}
    </div>
  );
}

function EmptyState({ text }) {
  return <div className="card text-center py-8"><p className="text-zinc-600 font-body text-sm">{text}</p></div>;
}
