import { useState, useEffect, useCallback } from 'react';
import AppLayout from '../../components/layout/AppLayout.jsx';
import ResourceCard from '../../components/resources/ResourceCard.jsx';
import ResourceForm from '../../components/resources/ResourceForm.jsx';
import Modal from '../../components/ui/Modal.jsx';
import api from '../../lib/api.js';

export default function AdminResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Admin gets all resources — reuse student endpoint but admin sees all
      const { data } = await api.get('/api/resources');
      setResources(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() { setEditing(null); setModalOpen(true); }
  function openEdit(r) { setEditing(r); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setEditing(null); }

  async function handleSubmit(form) {
    setSaving(true);
    try {
      if (editing) {
        const { data } = await api.put(`/api/resources/${editing.id}`, form);
        setResources(rs => rs.map(r => r.id === editing.id ? data : r));
      } else {
        const { data } = await api.post('/api/resources', form);
        setResources(rs => [data, ...rs]);
      }
      closeModal();
    } catch {
      // silent — could add toast here
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this resource?')) return;
    await api.delete(`/api/resources/${id}`);
    setResources(rs => rs.filter(r => r.id !== id));
  }

  const filtered = resources
    .filter(r => typeFilter === 'all' || r.type === typeFilter)
    .filter(r => groupFilter === 'all' || r.target_group === groupFilter);

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-up">
        <div>
          <h1 className="font-heading font-bold text-3xl text-white mb-1">Resources</h1>
          <p className="text-zinc-500 font-body text-sm">{resources.length} total</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <PlusIcon /> Add resource
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 animate-fade-up delay-75">
        <FilterGroup
          label="Type"
          options={[
            { value: 'all', label: 'All types' },
            { value: 'youtube', label: 'YouTube' },
            { value: 'documentation', label: 'Docs' },
            { value: 'repository', label: 'Repo' },
          ]}
          value={typeFilter}
          onChange={setTypeFilter}
        />
        <FilterGroup
          label="Group"
          options={[
            { value: 'all', label: 'All groups' },
            { value: 'A', label: 'Group A' },
            { value: 'B', label: 'Group B' },
            { value: 'C', label: 'Group C' },
          ]}
          value={groupFilter}
          onChange={setGroupFilter}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card space-y-3">
              <div className="skeleton h-5 w-1/3" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16 animate-fade-up">
          <p className="text-zinc-600 font-body text-sm">No resources yet — add one to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r, i) => (
            <div key={r.id} className="animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
              <ResourceCard
                resource={r}
                variant="admin"
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit resource' : 'Add resource'}
      >
        <ResourceForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          loading={saving}
        />
      </Modal>
    </AppLayout>
  );
}

function FilterGroup({ options, value, onChange }) {
  return (
    <div className="flex items-center gap-1.5">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 rounded-md text-xs font-heading font-medium transition-colors duration-200 cursor-pointer focus-ring
            ${value === o.value
              ? 'bg-accent/10 text-accent border border-accent/20'
              : 'text-zinc-600 hover:text-zinc-300 border border-border'
            }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}
