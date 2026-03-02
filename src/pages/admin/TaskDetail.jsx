import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout.jsx';
import api from '../../lib/api.js';

export default function AdminTaskDetail() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/tasks/${id}`)
      .then(r => setTask(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <AppLayout>
      <div className="space-y-4 animate-fade-up">
        <div className="skeleton h-8 w-1/3" />
        <div className="skeleton h-4 w-1/4" />
        <div className="skeleton h-48 w-full mt-6" />
      </div>
    </AppLayout>
  );

  if (!task) return (
    <AppLayout>
      <div className="card text-center py-20">
        <p className="text-zinc-600 font-body text-sm">Task not found</p>
        <Link to="/admin/tasks" className="btn-secondary text-sm mt-4 inline-block">← Back to tasks</Link>
      </div>
    </AppLayout>
  );

  const submitted = task.assignments?.filter(a => a.submission) || [];
  const notSubmitted = task.assignments?.filter(a => !a.submission) || [];
  const lateCount = submitted.filter(a => a.submission?.is_late).length;
  const reviewedCount = submitted.filter(a => a.submission?.status === 'reviewed').length;

  return (
    <AppLayout>
      {/* Back */}
      <Link to="/admin/tasks" className="text-zinc-500 hover:text-white text-sm font-body transition-colors duration-200 flex items-center gap-1.5 mb-6 animate-fade-up">
        ← Back to tasks
      </Link>

      {/* Task header */}
      <div className="mb-8 animate-fade-up delay-75">
        <h1 className="font-heading font-bold text-3xl text-white mb-2">{task.title}</h1>
        <p className="text-zinc-500 font-body text-sm mb-4 max-w-2xl">{task.description}</p>
        <div className="flex items-center gap-4 flex-wrap">
          <DeadlineBadge deadline={task.deadline} />
          {task.reference_image_url && (
            <a
              href={task.reference_image_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-500 hover:text-accent transition-colors duration-200 font-body flex items-center gap-1"
            >
              <ImageIcon /> View reference image
            </a>
          )}
        </div>
      </div>

      {/* Reference image preview */}
      {task.reference_image_url && (
        <div className="mb-8 animate-fade-up delay-150">
          <img
            src={task.reference_image_url}
            alt="Task reference"
            className="max-h-64 rounded-lg border border-border object-cover"
          />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 animate-fade-up delay-150">
        <StatCard label="Assigned" value={task.assignments?.length || 0} />
        <StatCard label="Submitted" value={submitted.length} accent />
        <StatCard label="Reviewed" value={reviewedCount} />
        <StatCard label="Late" value={lateCount} danger={lateCount > 0} />
      </div>

      {/* Submissions table */}
      <section className="animate-fade-up delay-225">
        <h2 className="font-heading font-semibold text-white text-base mb-4">Submissions</h2>

        {task.assignments?.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-zinc-600 font-body text-sm">No students assigned to this task</p>
          </div>
        ) : (
          <div className="border border-border rounded-lg overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-heading font-medium text-zinc-500 uppercase tracking-wider">Student</th>
                  <th className="text-left px-4 py-3 text-xs font-heading font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-heading font-medium text-zinc-500 uppercase tracking-wider hidden sm:table-cell">Submitted</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {task.assignments?.map((a, i) => (
                  <tr
                    key={a.id}
                    className="border-b border-border last:border-0 hover:bg-surface-2 transition-colors duration-200 animate-fade-up"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <td className="px-4 py-3">
                      <p className="font-heading font-medium text-white text-sm">{a.full_name}</p>
                      <p className="text-zinc-600 text-xs font-body">{a.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <SubmissionStatus submission={a.submission} />
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="text-zinc-500 text-xs font-body">
                        {a.submission?.submitted_at
                          ? new Date(a.submission.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {a.submission ? (
                        <Link
                          to={`/admin/tasks/${id}/submissions/${a.submission.id}`}
                          className="text-xs text-accent hover:text-accent-dim font-heading font-medium transition-colors duration-200"
                        >
                          {a.submission.status === 'reviewed' ? 'View feedback' : 'Review →'}
                        </Link>
                      ) : (
                        <span className="text-zinc-700 text-xs font-body">Not submitted</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppLayout>
  );
}

function StatCard({ label, value, accent, danger }) {
  return (
    <div className="card">
      <p className="text-zinc-600 text-xs font-body uppercase tracking-wider mb-2">{label}</p>
      <p className={`font-heading font-bold text-2xl ${danger ? 'text-red-400' : accent ? 'text-accent' : 'text-white'}`}>
        {value}
      </p>
    </div>
  );
}

function SubmissionStatus({ submission }) {
  if (!submission) return <span className="badge badge-not-submitted">Not submitted</span>;
  if (submission.status === 'reviewed') return <span className="badge badge-reviewed">Reviewed</span>;
  if (submission.is_late) return <span className="badge badge-late">Late</span>;
  return <span className="badge badge-submitted">Submitted</span>;
}

function DeadlineBadge({ deadline }) {
  const overdue = new Date() > new Date(deadline);
  return (
    <span className={`text-xs font-body ${overdue ? 'text-red-400' : 'text-zinc-400'}`}>
      {overdue ? 'Deadline passed: ' : 'Deadline: '}
      {new Date(deadline).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })}
    </span>
  );
}

function ImageIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}
