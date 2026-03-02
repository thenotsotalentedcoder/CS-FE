import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout.jsx';
import api from '../../lib/api.js';
import { supabase } from '../../lib/supabaseClient.js';

export default function AdminSubmissionReview() {
  const { taskId, submissionId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackText, setFeedbackText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    api.get(`/api/submissions/${submissionId}`)
      .then(r => {
        setSubmission(r.data);
        if (r.data.feedback_text) setFeedbackText(r.data.feedback_text);
        if (r.data.feedback_image_url) setImagePreview(r.data.feedback_image_url);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [submissionId]);

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview('');
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    let feedbackImageUrl = submission?.feedback_image_url || null;

    if (imageFile) {
      setUploading(true);
      try {
        const ext = imageFile.name.split('.').pop();
        const path = `feedback-attachments/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('feedback-attachments')
          .upload(path, imageFile, { upsert: false });
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage
          .from('feedback-attachments')
          .getPublicUrl(path);
        feedbackImageUrl = urlData.publicUrl;
      } catch {
        setError('Image upload failed. Try again.');
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    setSaving(true);
    try {
      const { data } = await api.patch(`/api/submissions/${submissionId}/review`, {
        feedback_text: feedbackText,
        feedback_image_url: feedbackImageUrl,
      });
      setSubmission(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save feedback.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <AppLayout>
      <div className="max-w-2xl space-y-4 animate-fade-up">
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-8 w-1/2" />
        <div className="skeleton h-48 w-full mt-4" />
      </div>
    </AppLayout>
  );

  if (!submission) return (
    <AppLayout>
      <div className="card text-center py-20 max-w-md">
        <p className="text-zinc-600 font-body text-sm">Submission not found</p>
        <Link to={`/admin/tasks/${taskId}`} className="btn-secondary text-sm mt-4 inline-block">← Back</Link>
      </div>
    </AppLayout>
  );

  const alreadyReviewed = submission.status === 'reviewed';

  return (
    <AppLayout>
      <div className="max-w-2xl">
        {/* Back */}
        <Link
          to={`/admin/tasks/${taskId}`}
          className="text-zinc-500 hover:text-white text-sm font-body transition-colors duration-200 flex items-center gap-1.5 mb-6 animate-fade-up"
        >
          ← Back to task
        </Link>

        {/* Student info */}
        <div className="flex items-center justify-between mb-6 animate-fade-up delay-75">
          <div>
            <h1 className="font-heading font-bold text-2xl text-white mb-1">
              {submission.users?.full_name}
            </h1>
            <p className="text-zinc-500 font-body text-sm">{submission.users?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            {submission.is_late && <span className="badge badge-late">Late</span>}
            <span className={alreadyReviewed ? 'badge badge-reviewed' : 'badge badge-submitted'}>
              {alreadyReviewed ? 'Reviewed' : 'Submitted'}
            </span>
          </div>
        </div>

        {/* Submission content */}
        <div className="card mb-6 animate-fade-up delay-150">
          <h2 className="font-heading font-semibold text-white text-sm mb-4">Submission</h2>

          <div className="space-y-4">
            <div>
              <p className="label mb-1">GitHub repository</p>
              <a
                href={submission.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent-dim text-sm font-body transition-colors duration-200 break-all flex items-center gap-1.5"
              >
                <ExternalIcon />
                {submission.github_url}
              </a>
            </div>

            <div>
              <p className="label mb-1">Student's description</p>
              <p className="text-zinc-300 font-body text-sm leading-relaxed bg-surface-2 border border-border rounded-md p-3">
                {submission.description}
              </p>
            </div>

            <p className="text-zinc-700 text-xs font-body">
              Submitted {new Date(submission.submitted_at).toLocaleString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        {/* Feedback form */}
        <div className="card animate-fade-up delay-225">
          <h2 className="font-heading font-semibold text-white text-sm mb-4">
            {alreadyReviewed ? 'Feedback (already posted)' : 'Write feedback'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="feedback-text" className="label">Feedback</label>
              <textarea
                id="feedback-text"
                required
                rows={5}
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                placeholder="Write your feedback for this student..."
                className="input resize-none"
                readOnly={alreadyReviewed}
              />
            </div>

            {/* Feedback image */}
            <div>
              <label className="label">
                Attach image <span className="text-zinc-600">(optional)</span>
              </label>
              {imagePreview ? (
                <div className="relative inline-block w-full">
                  <img
                    src={imagePreview}
                    alt="Feedback attachment preview"
                    className="w-full max-h-56 object-cover rounded-md border border-border"
                  />
                  {!alreadyReviewed && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/80 border border-border flex items-center justify-center text-zinc-400 hover:text-white transition-colors duration-200 cursor-pointer"
                      aria-label="Remove image"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ) : !alreadyReviewed ? (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full border border-dashed border-border rounded-md p-5 text-center hover:border-zinc-600 transition-colors duration-200 cursor-pointer group"
                >
                  <p className="text-zinc-600 text-sm font-body group-hover:text-zinc-400 transition-colors duration-200">
                    Click to attach an image
                  </p>
                </button>
              ) : (
                <p className="text-zinc-600 text-sm font-body">No image attached</p>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageChange}
                className="sr-only"
                aria-label="Upload feedback image"
              />
            </div>

            {error && <p className="text-red-400 text-sm font-body">{error}</p>}

            {!alreadyReviewed && (
              <button
                type="submit"
                disabled={saving || uploading || !feedbackText}
                className="btn-primary w-full"
              >
                {uploading ? 'Uploading image...' : saving ? 'Posting feedback...' : 'Post feedback & mark reviewed'}
              </button>
            )}

            {alreadyReviewed && (
              <div className="bg-accent/5 border border-accent/20 rounded-md px-4 py-3">
                <p className="text-accent text-xs font-body">
                  Feedback posted · Reviewed {new Date(submission.reviewed_at).toLocaleString('en-US', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </AppLayout>
  );
}

function ExternalIcon() {
  return (
    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}
