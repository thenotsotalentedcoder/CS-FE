import { useState, useEffect } from 'react';

const CATEGORIES = ['web dev', 'essentials', 'ai', 'misc'];
const EMPTY = { title: '', type: 'youtube', url: '', target_group: 'none', is_public: false, category: 'misc', subtitle: '' };

export default function ResourceForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    setForm(initial ? { ...EMPTY, ...initial, subtitle: initial.subtitle || '' } : EMPTY);
  }, [initial]);

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ ...form, subtitle: form.subtitle.trim() || null });
  }

  const isEdit = !!initial?.id;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="res-title" className="label">Title</label>
        <input
          id="res-title"
          type="text"
          required
          value={form.title}
          onChange={e => set('title', e.target.value)}
          placeholder="Resource title"
          className="input"
        />
      </div>

      <div>
        <label htmlFor="res-subtitle" className="label">Short description <span className="text-zinc-600 font-normal">(optional)</span></label>
        <input
          id="res-subtitle"
          type="text"
          value={form.subtitle}
          onChange={e => set('subtitle', e.target.value)}
          placeholder="One line about what this resource covers"
          className="input"
          maxLength={120}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="res-type" className="label">Type</label>
          <select
            id="res-type"
            value={form.type}
            onChange={e => set('type', e.target.value)}
            className="input cursor-pointer"
          >
            <option value="youtube">YouTube</option>
            <option value="documentation">Documentation</option>
            <option value="repository">Repository</option>
          </select>
        </div>

        <div>
          <label htmlFor="res-category" className="label">Category</label>
          <select
            id="res-category"
            value={form.category}
            onChange={e => set('category', e.target.value)}
            className="input cursor-pointer capitalize"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c} className="capitalize">{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="res-group" className="label">Target group</label>
        <select
          id="res-group"
          value={form.target_group}
          onChange={e => set('target_group', e.target.value)}
          className="input cursor-pointer"
        >
          <option value="none">None (public only)</option>
          <option value="all">All groups</option>
          <option value="A">Group A</option>
          <option value="B">Group B</option>
          <option value="C">Group C</option>
        </select>
      </div>

      <div>
        <label htmlFor="res-url" className="label">URL</label>
        <input
          id="res-url"
          type="url"
          required
          value={form.url}
          onChange={e => set('url', e.target.value)}
          placeholder="https://..."
          className="input"
        />
      </div>

      <label className="flex items-center gap-3 cursor-pointer group">
        <div className="relative">
          <input
            type="checkbox"
            checked={form.is_public}
            onChange={e => set('is_public', e.target.checked)}
            className="sr-only"
          />
          <div className={`w-9 h-5 rounded-full transition-colors duration-200 ${form.is_public ? 'bg-accent' : 'bg-surface-2 border border-border'}`} />
          <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${form.is_public ? 'translate-x-4' : ''}`} />
        </div>
        <span className="text-sm font-body text-zinc-400 group-hover:text-white transition-colors duration-200">
          Show on public resources page
        </span>
      </label>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? (isEdit ? 'Saving...' : 'Adding...') : (isEdit ? 'Save changes' : 'Add resource')}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
