import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api.js';

const GROUPS = ['A', 'B', 'C'];
const SKILL_LEVELS = ['beginner', 'basic', 'intermediate'];

export default function StudentPicker({ selected, onChange }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [groupFilter, setGroupFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (groupFilter !== 'all') params.set('group', groupFilter);
      if (skillFilter !== 'all') params.set('skill_level', skillFilter);
      const { data } = await api.get(`/api/tasks/assignable-students?${params}`);
      setStudents(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [groupFilter, skillFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = students.filter(s =>
    search === '' ||
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  function toggleStudent(id) {
    onChange(
      selected.includes(id)
        ? selected.filter(x => x !== id)
        : [...selected, id]
    );
  }

  function selectAll() {
    const ids = filtered.map(s => s.id);
    const allSelected = ids.every(id => selected.includes(id));
    if (allSelected) {
      onChange(selected.filter(id => !ids.includes(id)));
    } else {
      onChange([...new Set([...selected, ...ids])]);
    }
  }

  const allFilteredSelected = filtered.length > 0 && filtered.every(s => selected.includes(s.id));

  return (
    <div className="space-y-3">
      {/* Filters row */}
      <div className="flex flex-wrap gap-2">
        {/* Group filter */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setGroupFilter('all')}
            className={`px-2.5 py-1 rounded text-xs font-heading font-medium transition-colors duration-200 cursor-pointer
              ${groupFilter === 'all' ? 'bg-accent/10 text-accent border border-accent/20' : 'text-zinc-500 border border-border hover:text-white'}`}
          >
            All groups
          </button>
          {GROUPS.map(g => (
            <button
              key={g}
              type="button"
              onClick={() => setGroupFilter(g)}
              className={`px-2.5 py-1 rounded text-xs font-heading font-medium transition-colors duration-200 cursor-pointer
                ${groupFilter === g ? 'bg-accent/10 text-accent border border-accent/20' : 'text-zinc-500 border border-border hover:text-white'}`}
            >
              Group {g}
            </button>
          ))}
        </div>

        {/* Skill filter */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSkillFilter('all')}
            className={`px-2.5 py-1 rounded text-xs font-heading font-medium transition-colors duration-200 cursor-pointer
              ${skillFilter === 'all' ? 'bg-accent/10 text-accent border border-accent/20' : 'text-zinc-500 border border-border hover:text-white'}`}
          >
            All levels
          </button>
          {SKILL_LEVELS.map(sl => (
            <button
              key={sl}
              type="button"
              onClick={() => setSkillFilter(sl)}
              className={`px-2.5 py-1 rounded text-xs font-heading font-medium transition-colors duration-200 cursor-pointer capitalize
                ${skillFilter === sl ? 'bg-accent/10 text-accent border border-accent/20' : 'text-zinc-500 border border-border hover:text-white'}`}
            >
              {sl}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="input text-sm"
      />

      {/* Select all row */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={selectAll}
          className="text-xs text-zinc-500 hover:text-accent transition-colors duration-200 cursor-pointer font-body"
        >
          {allFilteredSelected ? 'Deselect all visible' : `Select all visible (${filtered.length})`}
        </button>
        <span className="text-xs text-zinc-600 font-body">
          {selected.length} selected
        </span>
      </div>

      {/* Student list */}
      <div className="border border-border rounded-lg overflow-hidden max-h-56 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton w-4 h-4 rounded" />
                <div className="skeleton h-4 flex-1" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-zinc-600 text-xs font-body">No students match the filters</p>
          </div>
        ) : (
          <ul>
            {filtered.map((s, i) => {
              const isSelected = selected.includes(s.id);
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => toggleStudent(s.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-200 cursor-pointer
                      border-b border-border last:border-0
                      ${isSelected ? 'bg-accent/5' : 'hover:bg-surface-2'}`}
                  >
                    {/* Checkbox */}
                    <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors duration-200
                      ${isSelected ? 'bg-accent border-accent' : 'border-border'}`}>
                      {isSelected && (
                        <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-heading font-medium truncate ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                        {s.full_name}
                      </p>
                      <p className="text-xs text-zinc-600 font-body truncate">{s.email}</p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="badge badge-not-submitted text-[10px]">Grp {s.group}</span>
                      {s.skill_level && (
                        <span className="badge badge-not-submitted text-[10px] capitalize">{s.skill_level}</span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Selected tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map(id => {
            const s = students.find(st => st.id === id);
            if (!s) return null;
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 bg-accent/10 text-accent border border-accent/20 text-xs font-heading font-medium px-2 py-0.5 rounded-full"
              >
                {s.full_name}
                <button
                  type="button"
                  onClick={() => toggleStudent(id)}
                  aria-label={`Remove ${s.full_name}`}
                  className="text-accent/60 hover:text-accent cursor-pointer transition-colors duration-200"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
