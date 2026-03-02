import { useState, useEffect, useCallback } from 'react';
import AppLayout from '../../components/layout/AppLayout.jsx';
import Modal from '../../components/ui/Modal.jsx';
import api from '../../lib/api.js';

const EMPTY = { title: '', body: '', target_group: 'all' };

const GROUP_STYLE = {
  all: {
    card: 'border-l-2 border-l-accent bg-accent/[0.03]',
    badge: 'text-accent bg-accent/10 border-accent/20',
    label: 'All groups',
  },
  A: {
    card: 'border-l-2 border-l-blue-500 bg-blue-500/[0.03]',
    badge: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    label: 'Group A',
  },
  B: {
    card: 'border-l-2 border-l-amber-500 bg-amber-500/[0.03]',
    badge: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    label: 'Group B',
  },
  C: {
    card: 'border-l-2 border-l-purple-500 bg-purple-500/[0.03]',
    badge: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    label: 'Group C',
  },
};

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/announcements');
      setAnnouncements(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() { setEditing(null); setForm(EMPTY); setModalOpen(true); }
  function openEdit(a) { setEditing(a); setForm({ title: a.title, body: a.body, target_group: a.target_group }); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setEditing(null); }
  function setField(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const { data } = await api.put(`/api/announcements/${editing.id}`, form);
        setAnnouncements(as => as.map(a => a.id === editing.id ? data : a));
      } else {
        const { data } = await api.post('/api/announcements', form);
        setAnnouncements(as => [data, ...as]);
      }
      closeModal();
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this announcement?')) return;
    await api.delete(`/api/announcements/${id}`);
    setAnnouncements(as => as.filter(a => a.id !== id));
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-up">
        <div>
          <h1 className="font-heading font-bold text-3xl text-white mb-1">Announcements</h1>
          <p className="text-zinc-500 font-body text-sm">{announcements.length} posted</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <PlusIcon /> New announcement
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card space-y-3">
              <div className="skeleton h-5 w-1/3" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-3 w-1/4" />
            </div>
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="card text-center py-20 animate-fade-up">
          <p className="text-zinc-600 font-body text-sm mb-4">No announcements yet</p>
          <button onClick={openCreate} className="btn-secondary text-sm">Post first announcement</button>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a, i) => {
            const gs = GROUP_STYLE[a.target_group] || GROUP_STYLE.all;
            return (
            <div
              key={a.id}
              className={`card animate-fade-up ${gs.card}`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-heading font-semibold text-white text-sm">{a.title}</h3>
                    <GroupBadge group={a.target_group} gs={gs} />
                  </div>
                  <p className="text-zinc-500 font-body text-sm leading-relaxed mb-2 line-clamp-3">{a.body}</p>
                  <p className="text-zinc-700 text-xs font-body">
                    {new Date(a.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEdit(a)}
                    aria-label="Edit announcement"
                    className="p-2 rounded-md text-zinc-600 hover:text-white hover:bg-surface-2 transition-colors duration-200 cursor-pointer focus-ring"
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    aria-label="Delete announcement"
                    className="p-2 rounded-md text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200 cursor-pointer focus-ring"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit announcement' : 'New announcement'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="ann-title" className="label">Title</label>
            <input
              id="ann-title"
              type="text"
              required
              value={form.title}
              onChange={e => setField('title', e.target.value)}
              placeholder="Announcement title"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="ann-body" className="label">Message</label>
            <textarea
              id="ann-body"
              required
              rows={5}
              value={form.body}
              onChange={e => setField('body', e.target.value)}
              placeholder="Write your announcement..."
              className="input resize-none"
            />
          </div>

          <div>
            <label htmlFor="ann-group" className="label">Target</label>
            <select
              id="ann-group"
              value={form.target_group}
              onChange={e => setField('target_group', e.target.value)}
              className="input cursor-pointer"
            >
              <option value="all">All students</option>
              <option value="A">Group A only</option>
              <option value="B">Group B only</option>
              <option value="C">Group C only</option>
            </select>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Posting...' : editing ? 'Save changes' : 'Post announcement'}
            </button>
            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}

function GroupBadge({ group, gs }) {
  const style = gs || GROUP_STYLE[group] || GROUP_STYLE.all;
  return (
    <span className={`badge border ${style.badge}`}>
      {style.label}
    </span>
  );
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}
