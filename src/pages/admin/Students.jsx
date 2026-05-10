import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import AppLayout from '../../components/layout/AppLayout.jsx';
import { 
  fetchAllStudents, 
  adminUpdateUser,
  selectAdminStudents,
  selectAdminLoading
} from '../../store/slices/adminSlice.js';

const DOMAINS = [
  { id: 'webdev', label: 'Web Development' },
  { id: 'ai', label: 'Artificial Intelligence' }
];

const GROUPS = ['A', 'B', 'C'];
const ROLES = ['student', 'instructor', 'admin'];

export default function AdminStudents() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const students = useSelector(selectAdminStudents);
  const loading = useSelector(selectAdminLoading);
  
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState(searchParams.get('group') || 'all');
  const [updating, setUpdating] = useState(null);

  const load = useCallback(() => {
    dispatch(fetchAllStudents());
  }, [dispatch]);

  useEffect(() => { load(); }, [load]);

  async function handleUpdate(studentId, updates) {
    setUpdating(studentId);
    dispatch(adminUpdateUser({ id: studentId, ...updates }))
      .finally(() => setUpdating(null));
  }

  const filtered = students
    .filter(s => domainFilter === 'all' || s.domain === domainFilter)
    .filter(s => groupFilter === 'all' || s.group === groupFilter)
    .filter(s =>
      search === '' ||
      (s.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-up">
        <div>
          <h1 className="font-heading font-bold text-3xl text-white mb-1">Users & Students</h1>
          <p className="text-zinc-500 font-body text-sm">{students.length} accounts total</p>
        </div>
        <Link to="/admin/allowlist" className="btn-secondary text-sm">
          Manage Allowlist
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 mb-6 animate-fade-up delay-75">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input max-w-xs text-sm"
          />
          
          {/* Domain Filter */}
          <div className="flex items-center gap-1.5 bg-surface-1 p-1 rounded-lg border border-border">
            <button
              onClick={() => setDomainFilter('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-heading font-medium transition-all
                ${domainFilter === 'all' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              All Domains
            </button>
            {DOMAINS.map(d => (
              <button
                key={d.id}
                onClick={() => setDomainFilter(d.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-heading font-medium transition-all
                  ${domainFilter === d.id ? 'bg-accent/10 text-accent border border-accent/20' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setGroupFilter('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-heading font-medium transition-colors
                ${groupFilter === 'all' ? 'text-white underline' : 'text-zinc-500 hover:text-white'}`}
            >
              All Groups
            </button>
            {GROUPS.map(g => (
              <button
                key={g}
                onClick={() => setGroupFilter(g)}
                className={`px-3 py-1.5 rounded-md text-xs font-heading font-medium transition-colors
                  ${groupFilter === g ? 'text-accent' : 'text-zinc-500 hover:text-white'}`}
              >
                Group {g}
              </button>
            ))}
          </div>
          <span className="text-zinc-600 text-xs font-body ml-auto">{filtered.length} shown</span>
        </div>
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
          <p className="text-zinc-600 font-body text-sm">No users found for these filters</p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-x-auto animate-fade-up delay-150">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-border bg-surface-1">
                <th className="text-left px-4 py-3 text-xs font-heading font-medium text-zinc-500 uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-xs font-heading font-medium text-zinc-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-4 py-3 text-xs font-heading font-medium text-zinc-500 uppercase tracking-wider">Domain</th>
                <th className="text-left px-4 py-3 text-xs font-heading font-medium text-zinc-500 uppercase tracking-wider">Group</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr
                  key={s.id}
                  className="border-b border-border last:border-0 hover:bg-surface-2 transition-colors animate-fade-up"
                  style={{ animationDelay: `${i * 20}ms` }}
                >
                  <td className="px-4 py-3">
                    <p className="font-heading font-medium text-white text-sm">{s.full_name || 'Anonymous'}</p>
                    <p className="text-zinc-600 text-xs font-body">{s.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={s.role}
                      onChange={e => handleUpdate(s.id, { role: e.target.value })}
                      disabled={updating === s.id}
                      className="bg-transparent border-none text-xs font-heading text-zinc-400 cursor-pointer hover:text-white capitalize"
                    >
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={s.domain || ''}
                      onChange={e => handleUpdate(s.id, { domain: e.target.value })}
                      disabled={updating === s.id}
                      className="bg-surface-2 border border-border rounded text-[10px] font-heading text-white px-2 py-1 cursor-pointer focus-ring disabled:opacity-40 uppercase"
                    >
                      <option value="" disabled>Select Domain</option>
                      {DOMAINS.map(d => <option key={d.id} value={d.id}>{d.id}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={s.group || ''}
                      onChange={e => handleUpdate(s.id, { group: e.target.value })}
                      disabled={updating === s.id}
                      className="bg-surface-2 border border-border rounded text-[10px] font-heading text-white px-2 py-1 cursor-pointer focus-ring disabled:opacity-40"
                    >
                      <option value="" disabled>-</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      {s.domain === 'ai' && <option value="C">C</option>}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/admin/students/${s.id}`}
                      className="text-xs text-zinc-500 hover:text-accent transition-colors font-body"
                    >
                      Details
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
