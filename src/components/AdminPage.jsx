import { useState, useEffect } from 'react';
import { SystemGrid } from './Canvases.jsx';
import { adminAPI } from '../api.js';
import { Activity, BarChart2, Users, ScrollText } from 'lucide-react';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return diff + 's ago';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}

const LOG_STYLES = {
  LOGIN_SUCCESS: { sig: 'ls-ok', act: 'la-ok' },
  LOGOUT: { sig: 'ls-ok', act: 'la-ok' },
  LOGIN_FAILED: { sig: 'ls-fail', act: 'la-fail' },
  DELETE_ACTION: { sig: 'ls-del', act: 'la-del' },
  CREATE: { sig: 'ls-ok', act: 'la-ok' },
};

function getLogStyle(action) {
  for (const [k, v] of Object.entries(LOG_STYLES)) {
    if (action?.includes(k)) return v;
  }
  return { sig: 'ls-ok', act: 'la-ok' };
}

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [u, l] = await Promise.all([adminAPI.listUsers(), adminAPI.listLogs(10)]);
      setUsers(Array.isArray(u.data) ? u.data : (u.data?.users || []));
      setLogs(l.data?.logs || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  if (loading) return <div className="main"><div className="loading-state"><div className="spinner" />Loading system grid...</div></div>;

  const students = users.filter(u => u.role === 'STUDENT');
  const teachers = users.filter(u => u.role === 'TEACHER');
  const active = users.filter(u => u.is_active !== 0);
  const activationRate = users.length ? Math.round(active.length / users.length * 100) : 0;

  const logCounts = { success: 0, failed: 0, delete: 0 };
  logs.forEach(l => {
    if (l.action?.includes('SUCCESS')) logCounts.success++;
    else if (l.action?.includes('FAIL')) logCounts.failed++;
    else if (l.action?.includes('DELETE')) logCounts.delete++;
  });

  return (
    <div className="main pfade">
      <div className="ph">
        <div className="ph-eye">System Brain Monitor</div>
        <div className="ph-title">Admin Dashboard</div>
        <div className="ph-sub">System overview and monitoring</div>
      </div>

      <div className="adm-top">
        {[
          ['Total Users', users.length, 'var(--teal)', 'var(--tealGlow)'],
          ['Active Users', active.length, 'var(--teal)', 'var(--tealGlow)'],
          ['Audit Logs', logs.length, 'var(--amber)', 'var(--amberGlow)'],
          ['Activation Rate', activationRate + '%', 'var(--white)', 'none'],
        ].map(([l, v, c, shadow], i) => (
          <div key={i} className="adm-s">
            <div className="adm-lbl">{l}</div>
            <div className="adm-val" style={{ color: c, textShadow: shadow !== 'none' ? '0 0 18px ' + shadow : 'none' }}>{v}</div>
          </div>
        ))}
      </div>

      <div className="sys-grid-card">
        <SystemGrid users={users} />
        <div style={{ padding: '10px 18px 14px', borderTop: '1px solid var(--glassBorder)' }}>
          <div style={{ fontSize: 10, color: 'var(--whiteMuted)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
            System Neural Grid · {users.length} users · Teal=Student · Amber=Teacher · Violet=Admin
          </div>
        </div>
      </div>

      <div className="adm-grid">
        {/* Quick actions */}
        <div className="adm-card">
          <div className="adm-card-ttl"><Activity size={14} style={{ color: 'var(--teal)', marginRight: 6 }} /> Recent Activity</div>
          <div className="log-list">
            {logs.length === 0 && <div style={{ color: 'var(--whiteMuted)', fontSize: 12 }}>No recent activity.</div>}
            {logs.slice(0, 8).map((l, i) => {
              const style = getLogStyle(l.action);
              return (
                <div key={i} className="log-e">
                  <div className={'log-sig ' + style.sig} />
                  <div className={'log-act ' + style.act}>{l.action}</div>
                  <div className="log-det">{l.userId ? 'User ' + l.userId : 'System'}</div>
                  <div className="log-t">{timeAgo(l.createdAt)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick stats */}
        <div className="adm-card">
          <div className="adm-card-ttl"><BarChart2 size={14} style={{ color: 'var(--amber)', marginRight: 6 }} /> Quick Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            {[
              { label: 'Manage Users', desc: 'View, activate, deactivate user accounts', icon: <Users size={18} />, page: 'admin-users' },
              { label: 'Audit Logs', desc: 'View system logs and activity history', icon: <ScrollText size={18} />, page: 'admin-logs' },
            ].map((item, i) => (
              <div key={i} className="pb-card v0" style={{ cursor: 'pointer' }}>
                <div className="pb-ico v0" style={{ fontSize: 18 }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div className="pb-name">{item.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--whiteMuted)' }}>{item.desc}</div>
                </div>
                <div style={{ color: 'var(--teal)', fontSize: 13 }}>→</div>
              </div>
            ))}
            <div className="prof-stat" style={{ marginTop: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--whiteMuted)' }}>Role distribution:</div>
              <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
                {[['Students', students.length, 'var(--teal)'], ['Teachers', teachers.length, 'var(--amber)'], ['Admins', users.filter(u => u.role === 'ADMIN').length, 'var(--violet)']].map(([l, v, c]) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18, color: c }}>{v}</div>
                    <div style={{ fontSize: 10, color: 'var(--whiteMuted)' }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
