import { useState, useEffect, useCallback } from 'react';
import AppLayout from '../../components/layout/AppLayout.jsx';
import ResourceCard from '../../components/resources/ResourceCard.jsx';
import api from '../../lib/api.js';

const TABS = ['all', 'saved'];
const TYPES = ['all', 'youtube', 'documentation', 'repository'];
const CATEGORIES = ['all', 'web dev', 'essentials', 'ai', 'misc'];

export default function StudentResources() {
  const [tab, setTab] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [resources, setResources] = useState([]);
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [resRes, savedRes] = await Promise.all([
        api.get('/api/resources'),
        api.get('/api/resources/saved'),
      ]);
      setResources(resRes.data);
      setSaved(savedRes.data.map(r => r.id));
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSaveToggle(id, isSaved) {
    if (isSaved) {
      await api.delete(`/api/resources/${id}/save`);
      setSaved(s => s.filter(x => x !== id));
    } else {
      await api.post(`/api/resources/${id}/save`);
      setSaved(s => [...s, id]);
    }
    // Update is_saved flag on resource list
    setResources(rs => rs.map(r => r.id === id ? { ...r, is_saved: !isSaved } : r));
  }

  const displayList = tab === 'saved'
    ? resources.filter(r => saved.includes(r.id))
    : resources;

  const filtered = displayList
    .filter(r => typeFilter === 'all' || r.type === typeFilter)
    .filter(r => categoryFilter === 'all' || r.category === categoryFilter);

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <h1 className="font-heading font-bold text-3xl text-white mb-1">Resources</h1>
        <p className="text-zinc-500 font-body text-sm">Learning materials for your group</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center bg-surface-2 rounded-md p-1 border border-border w-fit mb-5 animate-fade-up delay-75">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded text-sm font-heading font-medium transition-colors duration-200 cursor-pointer focus-ring capitalize
              ${tab === t ? 'bg-surface text-white border border-border' : 'text-zinc-500 hover:text-white'}`}
          >
            {t === 'saved' ? `Saved${saved.length > 0 ? ` (${saved.length})` : ''}` : 'All'}
          </button>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3 mb-6 animate-fade-up delay-150">
        {/* Category filter */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1.5 rounded-md text-xs font-heading font-medium transition-colors duration-200 cursor-pointer whitespace-nowrap capitalize focus-ring
                ${categoryFilter === c
                  ? 'bg-accent/10 text-accent border border-accent/20'
                  : 'text-zinc-600 hover:text-zinc-300 border border-transparent'
                }`}
            >
              {c === 'all' ? 'All categories' : c}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-border hidden sm:block" />

        {/* Type filter */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">
          {TYPES.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-heading font-medium transition-colors duration-200 cursor-pointer whitespace-nowrap capitalize focus-ring
                ${typeFilter === t
                  ? 'bg-white/10 text-white border border-white/10'
                  : 'text-zinc-600 hover:text-zinc-300 border border-transparent'
                }`}
            >
              {t === 'all' ? 'All types' : t === 'documentation' ? 'Docs' : t === 'repository' ? 'Repo' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className="text-zinc-600 text-sm font-body mb-4 animate-fade-up delay-150">
        {filtered.length} resource{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card space-y-3">
              <div className="skeleton h-5 w-1/3" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16 animate-fade-up">
          <p className="text-zinc-600 font-body text-sm">
            {tab === 'saved' ? 'No saved resources yet — bookmark resources to find them here' : 'No resources available yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r, i) => (
            <div key={r.id} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
              <ResourceCard
                resource={{ ...r, is_saved: saved.includes(r.id) }}
                variant="student"
                onSaveToggle={handleSaveToggle}
              />
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
