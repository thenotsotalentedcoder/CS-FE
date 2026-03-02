import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout.jsx';
import api from '../../lib/api.js';

const STATUS_FILTERS = ['all', 'pending', 'submitted', 'reviewed'];

export default function StudentTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/api/tasks/my')
      .then(r => setTasks(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = tasks.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !t.submission;
    if (filter === 'submitted') return t.submission?.status === 'submitted';
    if (filter === 'reviewed') return t.submission?.status === 'reviewed';
    return true;
  });

  const pendingCount = tasks.filter(t => !t.submission).length;

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <h1 className="font-heading font-bold text-3xl text-white mb-1">Tasks</h1>
        <p className="text-zinc-500 font-body text-sm">
          {pendingCount > 0
            ? `${pendingCount} task${pendingCount !== 1 ? 's' : ''} pending submission`
            : 'All caught up'}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6 animate-fade-up delay-75 overflow-x-auto pb-1 scrollbar-none">
        {STATUS_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-sm font-heading font-medium transition-colors duration-200 cursor-pointer capitalize focus-ring
              ${filter === f
                ? 'bg-accent/10 text-accent border border-accent/20'
                : 'text-zinc-500 hover:text-white border border-transparent'
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card space-y-3">
              <div className="skeleton h-5 w-1/2" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-3 w-1/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16 animate-fade-up">
          <p className="text-zinc-600 font-body text-sm">
            {filter === 'all' ? 'No tasks assigned yet' : `No ${filter} tasks`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((task, i) => (
            <TaskCard key={task.id} task={task} index={i} />
          ))}
        </div>
      )}
    </AppLayout>
  );
}

function TaskCard({ task, index }) {
  const overdue = !task.submission && new Date() > new Date(task.deadline);
  const status = task.submission?.status;
  const isLate = task.submission?.is_late;

  return (
    <Link
      to={`/my-tasks/${task.id}`}
      className="card flex items-start justify-between gap-4 cursor-pointer block animate-fade-up hover:border-[#2a2a2a]"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h3 className="font-heading font-semibold text-white text-sm">{task.title}</h3>
          {overdue && !status && <span className="badge badge-late">Overdue</span>}
          {isLate && <span className="badge badge-late">Late</span>}
        </div>
        <p className="text-zinc-500 font-body text-sm line-clamp-2 mb-3">{task.description}</p>
        <div className="flex items-center gap-4">
          <p className={`text-xs font-body ${overdue && !status ? 'text-red-400' : 'text-zinc-600'}`}>
            Due {new Date(task.deadline).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </p>
          {task.reference_image_url && (
            <span className="text-zinc-700 text-xs font-body">· Has reference image</span>
          )}
        </div>
      </div>

      <div className="flex-shrink-0">
        {!status && <span className="badge badge-not-submitted">Not submitted</span>}
        {status === 'submitted' && !isLate && <span className="badge badge-submitted">Submitted</span>}
        {status === 'submitted' && isLate && <span className="badge badge-late">Late</span>}
        {status === 'reviewed' && <span className="badge badge-reviewed">Reviewed</span>}
      </div>
    </Link>
  );
}
