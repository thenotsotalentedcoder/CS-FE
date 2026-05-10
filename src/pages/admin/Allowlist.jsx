import { useState, useEffect, useCallback, useRef } from 'react';
import AppLayout from '../../components/layout/AppLayout.jsx';
import api from '../../lib/api.js';

const DOMAINS = [
  { id: 'webdev', label: 'Web Development' },
  { id: 'ai', label: 'Artificial Intelligence' }
];

const GROUPS = ['A', 'B', 'C'];
const ROLES = ['student', 'instructor', 'admin'];

export default function AdminAllowlist() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Single Add State
  const [formData, setFormData] = useState({
    email: '',
    role: 'student',
    domain: 'webdev',
    group: 'A'
  });
  
  const [addingOne, setAddingOne] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/allowlist');
      setEmails(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleAddOne(e) {
    e.preventDefault();
    setError('');
    setAddingOne(true);
    try {
      await api.post('/api/admin/allowlist', formData);
      setFormData({ ...formData, email: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add email');
    } finally {
      setAddingOne(false);
    }
  }

  async function handleCSV(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportResult(null);
    setError('');
    setImporting(true);

    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      
      // Parse CSV — handle email, role, domain, group columns
      // Expected format: email,role,domain,group (header optional)
      const users = lines.slice(lines[0].toLowerCase().includes('email') ? 1 : 0).map(line => {
        const parts = line.split(',').map(p => p.replace(/^["']|["']$/g, '').trim().toLowerCase());
        return {
          email: parts[0],
          role: parts[1] || 'student',
          domain: parts[2] || 'webdev',
          group: parts[3]?.toUpperCase() || 'A'
        };
      }).filter(u => u.email.includes('@'));

      if (!users.length) {
        setError('No valid data found in the CSV file.');
        setImporting(false);
        return;
      }

      const { data } = await api.post('/api/admin/allowlist/import', { users });
      setImportResult(data);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Import failed');
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <AppLayout>
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <h1 className="font-heading font-bold text-3xl text-white mb-1">Gated Community</h1>
          <p className="text-zinc-500 font-body text-sm">
            Pre-authorize emails and assign them to specific domains/groups. {emails.length} entries.
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-fade-up delay-75">
          {/* Single add */}
          <div className="card border-accent/20 bg-accent/[0.02]">
            <h2 className="font-heading font-semibold text-white text-base mb-4">Invite Single User</h2>
            <form onSubmit={handleAddOne} className="space-y-4">
              <div>
                <label className="label text-[10px] uppercase tracking-wider text-zinc-500">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="student@example.com"
                  className="input text-sm"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label text-[10px] uppercase tracking-wider text-zinc-500">Role</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    className="input text-xs h-9 bg-surface-2"
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label text-[10px] uppercase tracking-wider text-zinc-500">Domain</label>
                  <select
                    value={formData.domain}
                    onChange={e => setFormData({ ...formData, domain: e.target.value })}
                    className="input text-xs h-9 bg-surface-2"
                  >
                    {DOMAINS.map(d => <option key={d.id} value={d.id}>{d.id}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label text-[10px] uppercase tracking-wider text-zinc-500">Group</label>
                  <select
                    value={formData.group}
                    onChange={e => setFormData({ ...formData, group: e.target.value })}
                    className="input text-xs h-9 bg-surface-2"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    {formData.domain === 'ai' && <option value="C">C</option>}
                  </select>
                </div>
              </div>

              {error && <p className="text-red-400 text-xs font-body">{error}</p>}
              <button type="submit" disabled={addingOne || !formData.email} className="btn-primary w-full text-sm">
                {addingOne ? 'Authorizing...' : 'Authorize & Invite'}
              </button>
            </form>
          </div>

          {/* CSV import */}
          <div className="card">
            <h2 className="font-heading font-semibold text-white text-base mb-4">Batch Import</h2>
            <p className="text-zinc-500 font-body text-xs mb-6 leading-relaxed">
              Upload a CSV to invite multiple users at once. 
              <br/><br/>
              Format: <code className="text-accent bg-accent/5 px-1 rounded">email, role, domain, group</code>
            </p>

            {importResult && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-md px-3 py-2 mb-4">
                <p className="text-emerald-400 text-xs font-body">
                  ✓ Successfully authorized {importResult.imported} users.
                </p>
              </div>
            )}

            <button
              type="button"
              disabled={importing}
              onClick={() => fileRef.current?.click()}
              className="btn-secondary w-full text-sm flex items-center justify-center gap-2 py-3"
            >
              <UploadIcon />
              {importing ? 'Processing CSV...' : 'Upload CSV File'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleCSV}
              className="sr-only"
            />
          </div>
        </div>

        {/* List */}
        <section className="animate-fade-up delay-150">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-white text-lg">Authorized Queue</h2>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-heading">Waiting for signup</span>
          </div>

          {loading ? (
            <div className="border border-border rounded-lg overflow-hidden">
               <div className="skeleton h-20 w-full" />
            </div>
          ) : (
            <div className="border border-border rounded-lg overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-border bg-surface-1">
                    <th className="text-left px-4 py-3 text-[10px] font-heading font-medium text-zinc-500 uppercase tracking-wider">Target Email</th>
                    <th className="text-left px-4 py-3 text-[10px] font-heading font-medium text-zinc-500 uppercase tracking-wider">Role</th>
                    <th className="text-left px-4 py-3 text-[10px] font-heading font-medium text-zinc-500 uppercase tracking-wider">Track</th>
                    <th className="text-left px-4 py-3 text-[10px] font-heading font-medium text-zinc-500 uppercase tracking-wider">Group</th>
                  </tr>
                </thead>
                <tbody>
                  {emails.map((e, i) => (
                    <tr
                      key={e.email}
                      className="border-b border-border last:border-0 hover:bg-surface-2 transition-colors"
                    >
                      <td className="px-4 py-2.5">
                        <p className="text-zinc-300 text-sm font-body">{e.email}</p>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[10px] font-heading px-1.5 py-0.5 rounded capitalize ${e.role === 'admin' ? 'bg-red-500/10 text-red-400' : e.role === 'instructor' ? 'bg-amber-500/10 text-amber-400' : 'bg-zinc-800 text-zinc-400'}`}>
                          {e.role}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-[10px] font-heading text-zinc-400 uppercase">
                          {e.domain || 'All'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="text-xs font-heading text-white">{e.group || '-'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}

function UploadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  );
}
