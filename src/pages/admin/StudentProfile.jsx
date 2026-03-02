import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout.jsx';
import api from '../../lib/api.js';

export default function AdminStudentProfile() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleConfirm, setRoleConfirm] = useState(false);

  useEffect(() => {
    api.get(`/api/students/${id}/profile`)
      .then(r => setStudent(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  async function handleRoleConfirm() {
    if (roleLoading) return;
    const newRole = student.role === 'admin' ? 'student' : 'admin';
    setRoleLoading(true);
    try {
      const res = await api.patch(`/api/admin/users/${id}/role`, { role: newRole });
      setStudent(s => ({ ...s, role: res.data.role }));
    } catch {
      // silent
    } finally {
      setRoleLoading(false);
      setRoleConfirm(false);
    }
  }

  if (loading) return (
    <AppLayout>
      <div className="max-w-3xl space-y-4 animate-fade-up">
        <div className="skeleton h-4 w-20" />
        <div className="skeleton h-8 w-1/3" />
        <div className="skeleton h-4 w-1/4" />
        <div className="skeleton h-64 w-full mt-6" />
      </div>
    </AppLayout>
  );

  if (!student) return (
    <AppLayout>
      <div className="card text-center py-20 max-w-md">
        <p className="text-zinc-600 font-body text-sm">Student not found</p>
        <Link to="/admin/students" className="btn-secondary text-sm mt-4 inline-block">← Back</Link>
      </div>
    </AppLayout>
  );

  const submitted = student.tasks.filter(t => t.submission).length;
  const reviewed = student.tasks.filter(t => t.submission?.status === 'reviewed').length;
  const late = student.tasks.filter(t => t.submission?.is_late).length;
  const notSubmitted = student.tasks.filter(t => !t.submission).length;

  return (
    <AppLayout>
      <div className="max-w-3xl">
        {/* Back */}
        <Link
          to="/admin/students"
          className="text-zinc-500 hover:text-white text-sm font-body transition-colors duration-200 flex items-center gap-1.5 mb-6 animate-fade-up"
        >
          ← Back to students
        </Link>

        {/* Student header */}
        <div className="flex items-start justify-between gap-4 mb-8 animate-fade-up delay-75">
          <div>
            <h1 className="font-heading font-bold text-3xl text-white mb-1">{student.full_name}</h1>
            <p className="text-zinc-500 font-body text-sm mb-3">{student.email}</p>
            <div className="flex items-center gap-2 flex-wrap">
              {student.role === 'admin'
                ? <span className="badge bg-accent/10 border-accent/20 text-accent border">Admin</span>
                : student.group
                  ? <span className="badge badge-reviewed">Group {student.group}</span>
                  : <span className="badge badge-pending">No group</span>
              }
              {student.skill_level && (
                <span className="badge badge-not-submitted capitalize">{student.skill_level}</span>
              )}
              <span className="text-zinc-600 text-xs font-body">
                Joined {new Date(student.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          {!roleConfirm ? (
            <button
              onClick={() => setRoleConfirm(true)}
              className={`shrink-0 px-3 py-1.5 rounded-md text-xs font-heading font-medium border transition-colors duration-200 cursor-pointer focus-ring
                ${student.role === 'admin'
                  ? 'border-border text-zinc-400 hover:text-white hover:border-zinc-600'
                  : 'border-accent/20 text-accent hover:bg-accent/10'
                }`}
            >
              {student.role === 'admin' ? 'Demote to student' : 'Make admin'}
            </button>
          ) : (
            <div className="shrink-0 flex flex-col items-end gap-2">
              <p className="text-xs font-body text-zinc-400 text-right max-w-[180px]">
                {student.role === 'admin'
                  ? `Demote ${student.full_name} to student?`
                  : `Promote ${student.full_name} to admin?`}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRoleConfirm(false)}
                  className="px-3 py-1.5 rounded-md text-xs font-heading font-medium border border-border text-zinc-400 hover:text-white transition-colors duration-200 cursor-pointer focus-ring"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRoleConfirm}
                  disabled={roleLoading}
                  className={`px-3 py-1.5 rounded-md text-xs font-heading font-medium transition-colors duration-200 cursor-pointer focus-ring disabled:opacity-40
                    ${student.role === 'admin'
                      ? 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20'
                      : 'bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20'
                    }`}
                >
                  {roleLoading ? '...' : 'Confirm'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 animate-fade-up delay-150">
          <StatCard label="Assigned" value={student.tasks.length} />
          <StatCard label="Submitted" value={submitted} accent />
          <StatCard label="Reviewed" value={reviewed} />
          <StatCard label="Late" value={late} danger={late > 0} />
        </div>

        {/* Task history */}
        <section className="animate-fade-up delay-225">
          <h2 className="font-heading font-semibold text-white text-base mb-4">Task history</h2>

          {student.tasks.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-zinc-600 font-body text-sm">No tasks assigned yet</p>
            </div>
          ) : (
            <div className="border border-border rounded-lg overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-xs font-heading font-medium text-zinc-500 uppercase tracking-wider">Task</th>
                    <th className="text-left px-4 py-3 text-xs font-heading font-medium text-zinc-500 uppercase tracking-wider hidden sm:table-cell">Deadline</th>
                    <th className="text-left px-4 py-3 text-xs font-heading font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {student.tasks.map((t, i) => (
                    <tr
                      key={t.id}
                      className="border-b border-border last:border-0 hover:bg-surface-2 transition-colors duration-200 animate-fade-up"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <td className="px-4 py-3">
                        <p className="font-heading font-medium text-white text-sm">{t.title}</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <p className="text-zinc-500 text-xs font-body">
                          {new Date(t.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <SubmissionBadge submission={t.submission} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        {t.submission && (
                          <Link
                            to={`/admin/tasks/${t.id}/submissions/${t.submission.id}`}
                            className="text-xs text-zinc-500 hover:text-accent transition-colors duration-200 font-body"
                          >
                            {t.submission.status === 'reviewed' ? 'View feedback' : 'Review →'}
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}

function SubmissionBadge({ submission }) {
  if (!submission) return <span className="badge badge-not-submitted">Not submitted</span>;
  if (submission.status === 'reviewed') return <span className="badge badge-reviewed">Reviewed</span>;
  if (submission.is_late) return <span className="badge badge-late">Late</span>;
  return <span className="badge badge-submitted">Submitted</span>;
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
