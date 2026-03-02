import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout.jsx';
import api from '../../lib/api.js';

const GITHUB_REGEX = /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+/;

export default function StudentTaskDetail() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [githubUrl, setGithubUrl] = useState('');
  const [description, setDescription] = useState('');
  const [urlError, setUrlError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    api.get(`/api/tasks/${id}`)
      .then(r => setTask(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setUrlError('');
    setSubmitError('');

    if (!GITHUB_REGEX.test(githubUrl)) {
      setUrlError('Enter a valid GitHub repo URL (https://github.com/username/repo)');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/api/submissions', {
        task_id: id,
        github_url: githubUrl,
        description,
      });
      setTask(t => ({ ...t, submission: data }));
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Submission failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <AppLayout>
      <div className="space-y-4 animate-fade-up max-w-2xl">
        <div className="skeleton h-8 w-1/2" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-48 w-full mt-4" />
      </div>
    </AppLayout>
  );

  if (!task) return (
    <AppLayout>
      <div className="card text-center py-20 max-w-md mx-auto">
        <p className="text-zinc-600 font-body text-sm">Task not found</p>
        <Link to="/my-tasks" className="btn-secondary text-sm mt-4 inline-block">← Back to tasks</Link>
      </div>
    </AppLayout>
  );

  const submission = task.submission;
  const overdue = !submission && new Date() > new Date(task.deadline);

  return (
    <AppLayout>
      <div className="max-w-2xl">
        {/* Back */}
        <Link
          to="/my-tasks"
          className="text-zinc-500 hover:text-white text-sm font-body transition-colors duration-200 flex items-center gap-1.5 mb-6 animate-fade-up"
        >
          ← Back to tasks
        </Link>

        {/* Task header */}
        <div className="mb-6 animate-fade-up delay-75">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h1 className="font-heading font-bold text-2xl text-white">{task.title}</h1>
            {submission?.is_late && <span className="badge badge-late">Late submission</span>}
            {overdue && <span className="badge badge-late">Overdue</span>}
          </div>
          <p className={`text-xs font-body mb-4 ${overdue ? 'text-red-400' : 'text-zinc-500'}`}>
            Due {new Date(task.deadline).toLocaleString('en-US', {
              weekday: 'long', month: 'long', day: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </p>
          <p className="text-zinc-400 font-body text-sm leading-relaxed">{task.description}</p>
        </div>

        {/* Reference image */}
        {task.reference_image_url && (
          <div className="mb-6 animate-fade-up delay-150">
            <p className="label mb-2">Reference image</p>
            <img
              src={task.reference_image_url}
              alt="Task reference"
              className="w-full object-contain rounded-lg border border-border"
            />
          </div>
        )}

        {/* Submission section */}
        <div className="animate-fade-up delay-225">
          {!submission ? (
            /* Submit form */
            <div className="card">
              <h2 className="font-heading font-semibold text-white text-base mb-4">Submit your work</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="github-url" className="label">GitHub repository URL</label>
                  <input
                    id="github-url"
                    type="url"
                    required
                    value={githubUrl}
                    onChange={e => { setGithubUrl(e.target.value); setUrlError(''); }}
                    placeholder="https://github.com/username/repo"
                    className="input"
                  />
                  {urlError && <p className="text-red-400 text-xs font-body mt-1.5">{urlError}</p>}
                </div>

                <div>
                  <label htmlFor="sub-desc" className="label">Brief description</label>
                  <textarea
                    id="sub-desc"
                    required
                    rows={4}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="What did you build? Anything the admin should know?"
                    className="input resize-none"
                  />
                </div>

                {submitError && <p className="text-red-400 text-sm font-body">{submitError}</p>}

                {overdue && (
                  <p className="text-amber-400 text-xs font-body bg-amber-500/10 border border-amber-500/20 rounded-md px-3 py-2">
                    The deadline has passed — this will be marked as a late submission.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting || !githubUrl || !description}
                  className="btn-primary w-full"
                >
                  {submitting ? 'Submitting...' : 'Submit task'}
                </button>
              </form>
            </div>
          ) : (
            /* Submission info + feedback */
            <div className="space-y-4">
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading font-semibold text-white text-base">Your submission</h2>
                  <span className={submission.status === 'reviewed' ? 'badge badge-reviewed' : submission.is_late ? 'badge badge-late' : 'badge badge-submitted'}>
                    {submission.status === 'reviewed' ? 'Reviewed' : submission.is_late ? 'Late' : 'Submitted'}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="label mb-1">GitHub repository</p>
                    <a
                      href={submission.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:text-accent-dim text-sm font-body transition-colors duration-200 break-all"
                    >
                      {submission.github_url}
                    </a>
                  </div>
                  <div>
                    <p className="label mb-1">Your description</p>
                    <p className="text-zinc-400 font-body text-sm leading-relaxed">{submission.description}</p>
                  </div>
                  <p className="text-zinc-700 text-xs font-body">
                    Submitted {new Date(submission.submitted_at).toLocaleString('en-US', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {/* Feedback */}
              {submission.status === 'reviewed' && (
                <div className="card border-accent/20 animate-fade-up">
                  <h3 className="font-heading font-semibold text-accent text-sm mb-3">Feedback</h3>
                  <p className="text-zinc-300 font-body text-sm leading-relaxed mb-4">
                    {submission.feedback_text}
                  </p>
                  {submission.feedback_image_url && (
                    <img
                      src={submission.feedback_image_url}
                      alt="Feedback attachment"
                      className="w-full object-contain rounded-md border border-border mt-3"
                    />
                  )}
                  <p className="text-zinc-700 text-xs font-body mt-3">
                    Reviewed {new Date(submission.reviewed_at).toLocaleString('en-US', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              )}

              {submission.status === 'submitted' && (
                <div className="card border-zinc-800 text-center py-6">
                  <p className="text-zinc-500 font-body text-sm">
                    Waiting for admin review — you'll get notified when feedback is posted.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
