import { useState, useEffect, useCallback, useRef } from 'react';
import AppLayout from '../../components/layout/AppLayout.jsx';
import api from '../../lib/api.js';

export default function AdminAllowlist() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [singleEmail, setSingleEmail] = useState('');
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
      await api.post('/api/admin/allowlist', { email: singleEmail.trim().toLowerCase() });
      setSingleEmail('');
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
      // Parse CSV — handle header row, strip quotes, get emails
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const emails = lines
        .map(l => l.replace(/^["']|["']$/g, '').trim().toLowerCase())
        .filter(l => l.includes('@') && !l.includes('email')); // skip header if present

      if (!emails.length) {
        setError('No valid emails found in the CSV file.');
        setImporting(false);
        return;
      }

      const { data } = await api.post('/api/admin/allowlist/import', { emails });
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
      <div className="max-w-2xl">
        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <h1 className="font-heading font-bold text-3xl text-white mb-1">Allowlist</h1>
          <p className="text-zinc-500 font-body text-sm">
            Only emails on this list can create accounts. {emails.length} emails added.
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 animate-fade-up delay-75">
          {/* Single add */}
          <div className="card">
            <h2 className="font-heading font-semibold text-white text-sm mb-3">Add single email</h2>
            <form onSubmit={handleAddOne} className="space-y-3">
              <div>
                <label htmlFor="single-email" className="label">Email address</label>
                <input
                  id="single-email"
                  type="email"
                  required
                  value={singleEmail}
                  onChange={e => setSingleEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="input text-sm"
                />
              </div>
              {error && <p className="text-red-400 text-xs font-body">{error}</p>}
              <button type="submit" disabled={addingOne || !singleEmail} className="btn-primary w-full text-sm">
                {addingOne ? 'Adding...' : 'Add email'}
              </button>
            </form>
          </div>

          {/* CSV import */}
          <div className="card">
            <h2 className="font-heading font-semibold text-white text-sm mb-3">Import from CSV</h2>
            <p className="text-zinc-500 font-body text-xs mb-4 leading-relaxed">
              CSV must have one email per row. A single <code className="text-zinc-300 bg-surface-2 px-1 rounded">email</code> column header is fine — it'll be skipped automatically.
            </p>

            {importResult && (
              <div className="bg-accent/5 border border-accent/20 rounded-md px-3 py-2 mb-3">
                <p className="text-accent text-xs font-body">
                  ✓ Imported {importResult.imported} · Skipped {importResult.skipped} duplicates
                </p>
              </div>
            )}

            <button
              type="button"
              disabled={importing}
              onClick={() => fileRef.current?.click()}
              className="btn-secondary w-full text-sm flex items-center justify-center gap-2"
            >
              <UploadIcon />
              {importing ? 'Importing...' : 'Choose CSV file'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleCSV}
              className="sr-only"
              aria-label="Upload CSV file"
            />
          </div>
        </div>

        {/* Email list */}
        <section className="animate-fade-up delay-150">
          <h2 className="font-heading font-semibold text-white text-base mb-4">
            Allowed emails
          </h2>

          {loading ? (
            <div className="border border-border rounded-lg overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0">
                  <div className="skeleton h-4 flex-1" />
                  <div className="skeleton h-3 w-20" />
                </div>
              ))}
            </div>
          ) : emails.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-zinc-600 font-body text-sm">No emails added yet</p>
            </div>
          ) : (
            <div className="border border-border rounded-lg overflow-x-auto">
              <table className="w-full min-w-[360px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-xs font-heading font-medium text-zinc-500 uppercase tracking-wider">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-heading font-medium text-zinc-500 uppercase tracking-wider hidden sm:table-cell">Added</th>
                  </tr>
                </thead>
                <tbody>
                  {emails.map((e, i) => (
                    <tr
                      key={e.id}
                      className="border-b border-border last:border-0 animate-fade-up"
                      style={{ animationDelay: `${i * 20}ms` }}
                    >
                      <td className="px-4 py-2.5">
                        <p className="text-zinc-300 text-sm font-body">{e.email}</p>
                      </td>
                      <td className="px-4 py-2.5 hidden sm:table-cell">
                        <p className="text-zinc-600 text-xs font-body">
                          {new Date(e.imported_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })}
                        </p>
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
