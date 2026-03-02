import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout.jsx';
import api from '../../lib/api.js';

const GROUPS = ['A', 'B', 'C'];
const SKILL_LEVELS = ['beginner', 'basic', 'intermediate'];

export default function AdminStudents() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState(searchParams.get('group') || 'all');
  const [updating, setUpdating] = useState(null); // student id being updated

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/students');
      setStudents(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleGroupChange(studentId, group) {
    setUpdating(studentId);
    try {
      const { data } = await api.patch(`/api/students/${studentId}/group`, { group });
      setStudents(ss => ss.map(s => s.id === studentId ? { ...s, ...data } : s));
    } catch {
      // silent
    } finally {
      setUpdating(null);
    }
  }

  async function handleSkillChange(studentId, skill_level) {
    setUpdating(studentId);
    try {
      const { data } = await api.patch(`/api/students/${studentId}/skill-level`, { skill_level });
      setStudents(ss => ss.map(s => s.id === studentId ? { ...s, ...data } : s));
    } catch {
      // silent
    } finally {
      setUpdating(null);
    }
  }

  const filtered = students
    .filter(s => groupFilter === 'all' || s.group === groupFilter)
    .filter(s =>
      search === '' ||
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-up">
        <div>
          <h1 className="font-heading font-bold text-3xl text-white mb-1">Students</h1>
          <p className="text-zinc-500 font-body text-sm">{students.length} enrolled</p>
        </div>
        <Link to="/admin/allowlist" className="btn-secondary text-sm">
          Manage allowlist
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6 animate-fade-up delay-75 overflow-x-auto pb-1 scrollbar-none">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input max-w-xs text-sm"
        />
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setGroupFilter('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-heading font-medium transition-colors duration-200 cursor-pointer
              ${groupFilter === 'all' ? 'bg-accent/10 text-accent border border-accent/20' : 'text-zinc-500 border border-border hover:text-white'}`}
          >
            All groups
          </button>
          {GROUPS.map(g => (
            <button
              key={g}
              onClick={() => setGroupFilter(g)}
              className={`px-3 py-1.5 rounded-md text-xs font-heading font-medium transition-colors duration-200 cursor-pointer
                ${groupFilter === g ? 'bg-accent/10 text-accent border border-accent/20' : 'text-zinc-500 border border-border hover:text-white'}`}
            >
              Group {g}
            </button>
          ))}
        </div>
        <span className="text-zinc-600 text-xs font-body ml-auto">{filtered.length} shown</span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="border border-border rounded-lg overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0">
              <div className="skeleton h-4 w-1/4" />
              <div className="skeleton h-4 w-1/4" />
              <div className="skeleton h-4 w-16" />
              <div className="skeleton h-4 w-20" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-20 animate-fade-up">
          <p className="text-zinc-600 font-body text-sm">No students found</p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-x-auto animate-fade-up delay-150">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-heading font-medium text-zinc-500 uppercase tracking-wider">Student</th>
                <th className="text-left px-4 py-3 text-xs font-heading font-medium text-zinc-500 uppercase tracking-wider hidden md:table-cell">Joined</th>
                <th className="text-left px-4 py-3 text-xs font-heading font-medium text-zinc-500 uppercase tracking-wider">Group</th>
                <th className="text-left px-4 py-3 text-xs font-heading font-medium text-zinc-500 uppercase tracking-wider hidden sm:table-cell">Skill level</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr
                  key={s.id}
                  className="border-b border-border last:border-0 hover:bg-surface-2 transition-colors duration-200 animate-fade-up"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <td className="px-4 py-3">
                    <p className="font-heading font-medium text-white text-sm">{s.full_name}</p>
                    <p className="text-zinc-600 text-xs font-body">{s.email}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-zinc-500 text-xs font-body">
                      {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={s.group || ''}
                      onChange={e => handleGroupChange(s.id, e.target.value)}
                      disabled={updating === s.id}
                      className="bg-surface-2 border border-border rounded text-xs font-heading text-white px-2 py-1 cursor-pointer focus-ring disabled:opacity-40 transition-colors duration-200 hover:border-zinc-600"
                    >
                      <option value="" disabled>Unassigned</option>
                      {GROUPS.map(g => <option key={g} value={g}>Group {g}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <select
                      value={s.skill_level || ''}
                      onChange={e => handleSkillChange(s.id, e.target.value)}
                      disabled={updating === s.id}
                      className="bg-surface-2 border border-border rounded text-xs font-heading text-white px-2 py-1 cursor-pointer focus-ring disabled:opacity-40 transition-colors duration-200 hover:border-zinc-600 capitalize"
                    >
                      <option value="" disabled>Not set</option>
                      {SKILL_LEVELS.map(sl => <option key={sl} value={sl} className="capitalize">{sl}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/admin/students/${s.id}`}
                      className="text-xs text-zinc-500 hover:text-accent transition-colors duration-200 font-body"
                    >
                      Profile →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
}
