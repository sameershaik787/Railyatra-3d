import React, { useState, useEffect, useMemo } from 'react';
import {
  Database,
  RefreshCw,
  Search,
  Download,
  Users,
  ShieldCheck,
  UserCheck,
  Ban,
  CheckCircle2,
  Trash2,
  Clock,
  AlertCircle,
} from 'lucide-react';

function fmtDate(val) {
  if (!val) return '—';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminUsersDatabasePanel({ user }) {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, passengers: 0, tte: 0, admins: 0, suspended: 0 });
  const [dbName, setDbName] = useState('railyatra3d');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchDatabase = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/.netlify/functions/admin-users', {
        headers: { Authorization: `Bearer ${user?.token || ''}` },
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Admin Database API requires live Netlify Functions deployment.');
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Could not load users database.');
      setUsers(data.users || []);
      setLogs(data.logs || []);
      setStats(data.stats || { total: 0, passengers: 0, tte: 0, admins: 0, suspended: 0 });
      setDbName(data.dbName || 'railyatra3d');
    } catch (err) {
      setError(err.message || 'Database connection failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabase();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (!q) return true;
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    });
  }, [users, query, roleFilter]);

  const updateUser = async (id, patch) => {
    setBusyId(id);
    setError('');
    try {
      const res = await fetch('/.netlify/functions/admin-users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token || ''}`,
        },
        body: JSON.stringify({ id, ...patch }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to update user.');
      await fetchDatabase();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId('');
    }
  };

  const deleteUser = async (u) => {
    if (!window.confirm(`Permanently delete ${u.email} from MongoDB?`)) return;
    setBusyId(u.id);
    setError('');
    try {
      const res = await fetch('/.netlify/functions/admin-users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token || ''}`,
        },
        body: JSON.stringify({ id: u.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to delete user.');
      await fetchDatabase();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId('');
    }
  };

  const exportCsv = () => {
    const header = ['Name', 'Email', 'Role', 'Status', 'Login Count', 'Created At', 'Last Login'];
    const rows = filteredUsers.map((u) => [
      `"${(u.name || '').replace(/"/g, '""')}"`,
      `"${u.email}"`,
      u.role,
      u.status,
      u.loginCount,
      `"${fmtDate(u.createdAt)}"`,
      `"${fmtDate(u.lastLoginAt)}"`,
    ]);
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `railyatra-users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 mb-2">
            <Database className="w-3.5 h-3.5" />
            MongoDB Atlas Live • {dbName}.users
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Registered Users Database
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time cross-device accounts, RBAC role assignments, account controls, and security audit trail.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            disabled={filteredUsers.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={fetchDatabase}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Live DB
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
            Total Users <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats.total}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{stats.suspended} suspended</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
            Passengers <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats.passengers}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Verified accounts</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
            TTE Staff <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats.tte}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Onboard HHT staff</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
            Railway Admins <ShieldCheck className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats.admins}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Full console access</div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs font-medium text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white pl-9 pr-4 py-2 text-xs text-slate-900 outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'all', label: 'All Roles' },
              { id: 'passenger', label: 'Passengers' },
              { id: 'tte', label: 'TTE Staff' },
              { id: 'admin', label: 'Admins' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  roleFilter === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">RBAC Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Logins</th>
                <th className="px-4 py-3">Signed Up / Last Login</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Loading live MongoDB records...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No users match the current filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSelf = u.email === user?.email;
                  const isBusy = busyId === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">
                          {u.name}{' '}
                          {isSelf && (
                            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-slate-500 font-mono text-[11px]">{u.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          disabled={isSelf || isBusy}
                          onChange={(e) => updateUser(u.id, { role: e.target.value })}
                          className="rounded-lg bg-white border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-800 disabled:opacity-60"
                        >
                          <option value="passenger">Passenger</option>
                          <option value="tte">TTE Staff</option>
                          <option value="admin">Railway Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            u.status === 'Suspended'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {u.status === 'Suspended' ? (
                            <Ban className="w-3 h-3" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-700">{u.loginCount}</td>
                      <td className="px-4 py-3 text-[11px] text-slate-600">
                        <div>Joined: {fmtDate(u.createdAt)}</div>
                        <div className="text-slate-400">Last: {fmtDate(u.lastLoginAt)}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            disabled={isSelf || isBusy}
                            onClick={() =>
                              updateUser(u.id, {
                                status: u.status === 'Suspended' ? 'Active' : 'Suspended',
                              })
                            }
                            className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border border-slate-200 hover:bg-slate-100 text-slate-700 disabled:opacity-40"
                          >
                            {u.status === 'Suspended' ? 'Activate' : 'Suspend'}
                          </button>
                          <button
                            disabled={isSelf || isBusy}
                            onClick={() => deleteUser(u)}
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-40"
                            title="Delete user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-blue-600" />
          Recent Authentication & Database Audit Logs
        </h2>
        {logs.length === 0 ? (
          <p className="text-xs text-slate-500">No audit events recorded yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {logs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-xs"
              >
                <div className="min-w-0">
                  <span className="font-bold text-blue-700">{log.action}</span>
                  <span className="text-slate-600 ml-2 truncate">{log.email}</span>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">{fmtDate(log.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}