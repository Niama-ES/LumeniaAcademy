import { useState } from 'react';
import { useAuth } from '../auth.jsx';
import { authAPI } from '../api.js';
import { Pencil, Lock } from 'lucide-react';

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function ProfilePage({ setPage }) {
  const { user, logout, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [pwMode, setPwMode] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const roleColor = user?.role === 'TEACHER' ? 'var(--amber)' : user?.role === 'ADMIN' ? 'var(--violet)' : 'var(--teal)';
  const avatarGrad = user?.role === 'TEACHER' ? 'linear-gradient(135deg,#F7B731,#e0a020)'
    : user?.role === 'ADMIN' ? 'linear-gradient(135deg,#A29BFE,#6c5ce7)'
    : 'linear-gradient(135deg,#4ECDC4,#55EFC4)';
  const initials = (user?.name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const saveProfile = async () => {
    setErr(''); setMsg('');
    if (!form.name.trim()) { setErr('Name is required'); return; }
    setSaving(true);
    try {
      const r = await authAPI.updateProfile(form.name.trim());
      // Update the name instantly in the sidebar/header without re-login
      updateUser({ name: r.data?.user?.name || form.name.trim() });
      setEditing(false);
      setMsg('Profile updated successfully.');
    } catch (e) {
      setErr(e.message || 'Failed to update profile');
    }
    setSaving(false);
  };

  const changePassword = async () => {
    setErr(''); setMsg('');
    if (!pwForm.current) { setErr('Current password required'); return; }
    if (pwForm.next.length < 6) { setErr('New password must be at least 6 characters'); return; }
    if (pwForm.next !== pwForm.confirm) { setErr('Passwords do not match'); return; }
    setSaving(true);
    try {
      await authAPI.changePassword(pwForm.current, pwForm.next);
      setPwMode(false);
      setPwForm({ current: '', next: '', confirm: '' });
      setMsg('Password changed successfully. Use your new password next time you log in.');
    } catch (e) {
      setErr(e.message || 'Failed to change password');
    }
    setSaving(false);
  };

  return (
    <div className="main pfade">
      <div className="ph">
        <div className="ph-eye">Identity Node</div>
        <div className="ph-title">My Profile</div>
        <div className="ph-sub">Your identity in the neural network.</div>
      </div>

      {msg && <div className="success-msg" style={{ marginBottom: 20, padding: '12px 18px', background: 'rgba(78,205,196,0.1)', border: '1px solid rgba(78,205,196,0.25)', borderRadius: 10, color: 'var(--teal)', fontSize: 13 }}>{msg}</div>}

      <div className="prof-card">
        {/* Avatar row */}
        <div className="prof-head">
          <div className="prof-av-wrap">
            <div className="prof-av" style={{ background: avatarGrad }}>{initials}</div>
            <div className="prof-av-ring" style={{ borderColor: roleColor }} />
          </div>
          <div className="prof-info">
            <div className="prof-name">{user?.name}</div>
            <div className="prof-email">{user?.email}</div>
            <div className="prof-role-tag" style={{ background: `${roleColor}18`, border: `1px solid ${roleColor}40`, color: roleColor }}>{user?.role}</div>
          </div>
        </div>

        <div className="prof-divider" />

        {/* Stats row */}
        <div className="prof-stats">
          {[
            { lbl: 'Account Created', val: formatDate(user?.created_at) },
            { lbl: 'Account Status', val: user?.is_active !== 0 ? 'Active' : 'Inactive',
              valStyle: { color: user?.is_active !== 0 ? 'var(--teal)' : '#ff6b6b' } },
            { lbl: 'Role', val: user?.role },
          ].map(({ lbl, val, valStyle }, i) => (
            <div key={i} className="prof-stat">
              <div className="prof-stat-lbl">{lbl}</div>
              <div className="prof-stat-val" style={valStyle || {}}>{val}</div>
            </div>
          ))}
        </div>

        <div className="prof-divider" />

        {/* Edit profile */}
        {!pwMode && (
          editing ? (
            <div className="prof-edit-form">
              <div className="form-panel-title" style={{ marginBottom: 16, fontSize: 14 }}>Edit Profile</div>
              {err && <div className="error-msg" style={{ marginBottom: 12 }}>{err}</div>}
              <div className="field" style={{ marginBottom: 12 }}>
                <div className="field-label">Full Name</div>
                <input className="field-input" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="field" style={{ marginBottom: 16 }}>
                <div className="field-label">Email</div>
                <input className="field-input" value={form.email} disabled
                  style={{ opacity: .5, cursor: 'not-allowed' }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="inline-btn" onClick={saveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                <button className="inline-btn ghost" onClick={() => { setEditing(false); setErr(''); }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="inline-btn ghost" onClick={() => { setEditing(true); setMsg(''); }}><Pencil size={13} /> Edit Profile</button>
              <button className="inline-btn ghost" onClick={() => { setPwMode(true); setMsg(''); }}><Lock size={13} /> Change Password</button>
            </div>
          )
        )}

        {/* Change password */}
        {pwMode && (
          <div className="prof-edit-form">
            <div className="form-panel-title" style={{ marginBottom: 16, fontSize: 14 }}>Change Password</div>
            {err && <div className="error-msg" style={{ marginBottom: 12 }}>{err}</div>}
            {[
              { lbl: 'Current Password', key: 'current' },
              { lbl: 'New Password', key: 'next' },
              { lbl: 'Confirm New Password', key: 'confirm' },
            ].map(({ lbl, key }) => (
              <div key={key} className="field" style={{ marginBottom: 12 }}>
                <div className="field-label">{lbl}</div>
                <input className="field-input" type="password" value={pwForm[key]}
                  onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button className="inline-btn" onClick={changePassword} disabled={saving}>{saving ? 'Saving...' : 'Update Password'}</button>
              <button className="inline-btn ghost" onClick={() => { setPwMode(false); setErr(''); }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
