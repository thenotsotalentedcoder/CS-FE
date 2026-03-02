import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout.jsx';
import TaskForm from '../../components/tasks/TaskForm.jsx';
import api from '../../lib/api.js';

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/tasks');
      setTasks(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() { setEditing(null); setPanelOpen(true); }
  function openEdit(t) { setEditing(t); setPanelOpen(true); }
  function closePanel() { setPanelOpen(false); setEditing(null); }

  async function handleSubmit(form) {
    setSaving(true);
    try {
      if (editing) {
        const { data } = await api.put(`/api/tasks/${editing.id}`, form);
        setTasks(ts => ts.map(t => t.id === editing.id ? data : t));
      } else {
        const { data } = await api.post('/api/tasks', form);
        setTasks(ts => [data, ...ts]);
      }
      closePanel();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this task? All assignments and submissions will be removed.')) return;
    await api.delete(`/api/tasks/${id}`);
    setTasks(ts => ts.filter(t => t.id !== id));
  }

  const filtered = tasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-up">
        <div>
          <h1 className="font-heading font-bold text-3xl text-white mb-1">Tasks</h1>
          <p className="text-zinc-500 font-body text-sm">
            {search ? `${filtered.length} of ${tasks.length}` : `${tasks.length} total`}
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <PlusIcon /> New task
        </button>
      </div>

      {/* Search */}
      {tasks.length > 0 && (
        <div className="mb-6 animate-fade-up delay-75">
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input max-w-xs text-sm"
          />
        </div>
      )}

      {/* Task list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card space-y-3">
              <div className="skeleton h-5 w-1/2" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-3 w-1/4" />
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="card text-center py-20 animate-fade-up">
          <p className="text-zinc-600 font-body text-sm mb-4">No tasks yet</p>
          <button onClick={openCreate} className="btn-secondary text-sm">
            Create your first task
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-20 animate-fade-up">
          <p className="text-zinc-600 font-body text-sm">No tasks match "{search}"</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((task, i) => (
            <AdminTaskRow
              key={task.id}
              task={task}
              index={i}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Side panel for create/edit */}
      <SlidePanel open={panelOpen} onClose={closePanel} title={editing ? 'Edit task' : 'New task'}>
        <TaskForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={closePanel}
          loading={saving}
        />
      </SlidePanel>
    </AppLayout>
  );
}

function AdminTaskRow({ task, index, onEdit, onDelete }) {
  const overdue = new Date() > new Date(task.deadline);

  return (
    <div
      className="card flex items-start justify-between gap-4 animate-fade-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h3 className="font-heading font-semibold text-white text-sm">{task.title}</h3>
          {overdue && <span className="badge badge-late">Overdue</span>}
        </div>
        <p className="text-zinc-500 font-body text-sm line-clamp-2 mb-2">{task.description}</p>
        <p className="text-zinc-600 text-xs font-body">
          Deadline: <span className={overdue ? 'text-red-400' : 'text-zinc-400'}>
            {new Date(task.deadline).toLocaleString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </span>
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          to={`/admin/tasks/${task.id}`}
          className="btn-secondary text-xs px-3 py-1.5"
        >
          View submissions
        </Link>
        <button
          onClick={() => onEdit(task)}
          aria-label="Edit task"
          className="p-2 rounded-md text-zinc-600 hover:text-white hover:bg-surface-2 transition-colors duration-200 cursor-pointer focus-ring"
        >
          <EditIcon />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          aria-label="Delete task"
          className="p-2 rounded-md text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200 cursor-pointer focus-ring"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

function SlidePanel({ open, onClose, title, children }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 animate-fade-in" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-label={title}
        className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg bg-surface border-l border-border flex flex-col animate-slide-in-right overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-surface z-10">
          <h2 className="font-heading font-semibold text-white text-base">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-surface-2 transition-colors duration-200 cursor-pointer focus-ring"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 flex-1">
          {children}
        </div>
      </div>
    </>
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
