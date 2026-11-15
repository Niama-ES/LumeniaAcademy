import { useState, useEffect } from 'react';
import { adminAPI } from '../api.js';
import { RefreshCw } from 'lucide-react';

function formatDate(d) {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

const roleColor = { STUDENT: 'var(--teal)', TEACHER: 'var(--amber)', ADMIN: 'var(--violet)' };
const roleGrad = {
  STUDENT: 'linear-gradient(135deg,#4ECDC4,#55EFC4)',
  TEACHER: 'linear-gradient(135deg,#F7B731,#e0a020)',
  ADMIN: 'linear-gradient(135deg,#A29BFE,#6c5ce7)',
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [toggling, setToggling] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const u = await adminAPI.listUsers();
      setUsers(Array.isArray(u.data) ? u.data : (u.data?.users || []));
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggleUser = async (user) => {
    setToggling(user.id);
    try {
      if (user.is_active) await adminAPI.deactivateUser(user.id);
      else await adminAPI.activateUser(user.id);
      load();
    } catch (e) { alert(e.message); }
    setToggling(null);
  };

  const initials = (name) => (name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const filtered = users.filter(u => {
    const matchSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? u.is_active !== 0 : u.is_active === 0);
    return matchSearch && matchRole && matchStatus;
  });

  if (loading) return <div className="main"><div className="loading-state"><div className="spinner" />Loading users...</div></div>;

  return (
    <div className="main pfade">
      <div className="ph" style={{ marginBottom: 20 }}>
        <div className="ph-eye">User Management</div>
        <div className="ph-title">All Users</div>
        <div className="ph-sub">Manage user accounts and permissions</div>
      </div>

      {/* Search + filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="field-input" placeholder="Search by name or email..."
          style={{ flex: 1, minWidth: 200, maxWidth: 340 }}
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="field-input" style={{ width: 130 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="ALL">All Roles</option>
          <option value="STUDENT">Students</option>
          <option value="TEACHER">Teachers</option>
          <option value="ADMIN">Admins</option>
        </select>
        <select className="field-input" style={{ width: 130 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <button className="inline-btn ghost" onClick={load} style={{ flexShrink: 0 }}><RefreshCw size={13} /> Refresh</button>
      </div>

      <div style={{ fontSize: 11, color: 'var(--whiteMuted)', marginBottom: 14 }}>
        Showing {filtered.length} of {users.length} users
      </div>

      {/* User list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 && <div style={{ color: 'var(--whiteMuted)', fontSize: 13 }}>No users match your filters.</div>}
        {filtered.map((u, i) => (
          <div key={u.id} className="urow" style={{ padding: '12px 16px', background: 'var(--glass)', border: '1px solid var(--glassBorder)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 11, color: 'var(--whiteMuted)', minWidth: 24 }}>#{u.id}</div>
            <div className="u-av" style={{ background: roleGrad[u.role] || roleGrad.STUDENT, flexShrink: 0 }}>{initials(u.name)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="u-name">{u.name}</div>
              <div className="u-email">{u.email}</div>
            </div>
            <div className="role-b" style={{ background: (roleColor[u.role] || 'var(--teal)') + '18', border: '1px solid ' + (roleColor[u.role] || 'var(--teal)') + '40', color: roleColor[u.role] || 'var(--teal)', padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, letterSpacing: '.05em' }}>
              {u.role}
            </div>
            <div style={{ textAlign: 'center', minWidth: 64 }}>
              <div className={'st-dot ' + (u.is_active !== 0 ? 'st-on' : 'st-off')} style={{ display: 'inline-block', marginRight: 5 }} />
              <span style={{ fontSize: 11, color: u.is_active !== 0 ? 'var(--teal)' : '#ff6b6b' }}>
                {u.is_active !== 0 ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--whiteMuted)', minWidth: 80, textAlign: 'right' }}>
              {formatDate(u.created_at)}
            </div>
            <button className="act-btn"
              disabled={toggling === u.id}
              style={{
                borderColor: u.is_active !== 0 ? 'rgba(255,107,107,0.3)' : 'rgba(78,205,196,0.3)',
                color: u.is_active !== 0 ? '#ff6b6b' : 'var(--teal)',
                background: u.is_active !== 0 ? 'rgba(255,107,107,0.05)' : 'rgba(78,205,196,0.05)',
                minWidth: 90,
              }}
              onClick={() => toggleUser(u)}>
              {toggling === u.id ? '...' : u.is_active !== 0 ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
