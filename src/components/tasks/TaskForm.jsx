import { useState, useEffect, useRef } from 'react';
import StudentPicker from './StudentPicker.jsx';
import { supabase } from '../../lib/supabaseClient.js';
import api from '../../lib/api.js';

const EMPTY = {
  title: '',
  description: '',
  deadline: '',
  reference_image_url: '',
  student_ids: [],
};

export default function TaskForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(EMPTY);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const isEdit = !!initial?.id;

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title || '',
        description: initial.description || '',
        deadline: initial.deadline ? toDatetimeLocal(initial.deadline) : '',
        reference_image_url: initial.reference_image_url || '',
        student_ids: [],
      });
      setImagePreview(initial.reference_image_url || '');

      // Load current assignees for this task
      api.get(`/api/tasks/${initial.id}`).then(r => {
        const ids = (r.data.assignments || []).map(a => a.id);
        setForm(f => ({ ...f, student_ids: ids }));
      }).catch(() => {});
    } else {
      setForm(EMPTY);
      setImagePreview('');
      setImageFile(null);
    }
  }, [initial]);

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview('');
    set('reference_image_url', '');
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (form.student_ids.length === 0) {
      alert('Please select at least one student.');
      return;
    }

    let imageUrl = form.reference_image_url;

    // Upload new image if selected
    if (imageFile) {
      setUploading(true);
      try {
        const ext = imageFile.name.split('.').pop();
        const path = `task-images/${Date.now()}.${ext}`;
        const { error } = await supabase.storage
          .from('task-images')
          .upload(path, imageFile, { upsert: false });

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('task-images')
          .getPublicUrl(path);

        imageUrl = urlData.publicUrl;
      } catch {
        alert('Image upload failed. Try again.');
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    onSubmit({
      ...form,
      deadline: new Date(form.deadline).toISOString(),
      reference_image_url: imageUrl || null,
    });
  }

  const busy = loading || uploading;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="task-title" className="label">Title</label>
        <input
          id="task-title"
          type="text"
          required
          value={form.title}
          onChange={e => set('title', e.target.value)}
          placeholder="Task title"
          className="input"
        />
      </div>

      <div>
        <label htmlFor="task-desc" className="label">Description</label>
        <textarea
          id="task-desc"
          required
          rows={4}
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="Describe what students need to build or do..."
          className="input resize-none"
        />
      </div>

      <div>
        <label htmlFor="task-deadline" className="label">Deadline</label>
        <input
          id="task-deadline"
          type="datetime-local"
          required
          value={form.deadline}
          onChange={e => set('deadline', e.target.value)}
          className="input"
        />
      </div>

      {/* Reference image */}
      <div>
        <label className="label">Reference image <span className="text-zinc-600">(optional)</span></label>
        {imagePreview ? (
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Reference preview"
              className="w-full max-h-48 object-cover rounded-md border border-border"
            />
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
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full border border-dashed border-border rounded-md p-6 text-center
              hover:border-zinc-600 transition-colors duration-200 cursor-pointer group"
          >
            <p className="text-zinc-600 text-sm font-body group-hover:text-zinc-400 transition-colors duration-200">
              Click to upload image
            </p>
            <p className="text-zinc-700 text-xs font-body mt-1">JPG, PNG, WebP up to 50MB</p>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleImageChange}
          className="sr-only"
          aria-label="Upload reference image"
        />
      </div>

      {/* Student picker */}
      <div>
        <label className="label">{isEdit ? 'Assigned students' : 'Assign to students'}</label>
        <StudentPicker
          selected={form.student_ids}
          onChange={ids => set('student_ids', ids)}
        />
      </div>

      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={busy} className="btn-primary flex-1">
          {uploading ? 'Uploading image...' : loading ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save changes' : 'Create task')}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}

function toDatetimeLocal(iso) {
  const d = new Date(iso);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
