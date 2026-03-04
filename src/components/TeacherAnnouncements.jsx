import { useState, useEffect } from 'react';
import { announcementsAPI } from '../api.js';
import { Plus, Pencil, Trash2 } from 'lucide-react';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return diff + 's ago';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}

const EMPTY_FORM = { title: '', content: '' };

export default function TeacherAnnouncements() {
  const [anns, setAnns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = create, obj = edit
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);

  const load = () => {
    setLoading(true);
    announcementsAPI.list()
      .then(r => setAnns(r.data?.announcements || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowForm(true);
  };

  const openEdit = (ann) => {
    setEditTarget(ann);
    setForm({ title: ann.title, content: ann.content || ann.body || '' });
    setError('');
    setShowForm(true);
  };

  const cancelForm = () => { setShowForm(false); setError(''); setEditTarget(null); };

  const submit = async () => {
    if (!form.title.trim()) { setError('Title is required'); return; }
    setSaving(true); setError('');
    try {
      if (editTarget) {
        await announcementsAPI.update(editTarget.id, form);
      } else {
        await announcementsAPI.create(form);
      }
      cancelForm();
      load();
    } catch (e) { setError(e.message); }
    setSaving(false);
  };

  const deleteAnn = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try { await announcementsAPI.delete(id); setAnns(a => a.filter(x => x.id !== id)); }
    catch (e) { alert(e.message); }
  };

  if (loading) return <div className="main"><div className="loading-state"><div className="spinner" />Loading signals...</div></div>;

  return (
    <div className="main pfade">
      <div className="ph">
        <div className="ph-eye">Synaptic Broadcasting</div>
        <div className="ph-title">Announcements</div>
        <div className="ph-sub">Transmit signals to all connected students.</div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <button className="inline-btn ghost" onClick={openCreate}><Plus size={14} /> New Announcement</button>
      </div>

      {showForm && (
        <div className="form-panel" style={{ marginBottom: 28 }}>
          <div className="form-panel-title">{editTarget ? 'Edit Announcement' : 'Broadcast Signal'}</div>
          {error && <div className="error-msg" style={{ marginBottom: 14 }}>{error}</div>}
          <div className="field" style={{ marginBottom: 12 }}>
            <div className="field-label">Title</div>
            <input className="field-input" placeholder="Announcement title"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="field" style={{ marginBottom: 16 }}>
            <div className="field-label">Message</div>
            <textarea className="field-input" placeholder="Your message to students..." rows={4}
              value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="inline-btn" onClick={submit} disabled={saving}>
              {saving ? 'Saving...' : editTarget ? 'Update' : 'Transmit Signal'}
            </button>
            <button className="inline-btn ghost" onClick={cancelForm}>Cancel</button>
          </div>
        </div>
      )}

      <div className="sec">Transmitted Signals ({anns.length})</div>
      <div className="ann-list">
        {anns.length === 0 && <div style={{ color: 'var(--whiteMuted)', fontSize: 13 }}>No announcements yet.</div>}
        {anns.map((a, i) => (
          <div key={a.id} className="ann" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', width: '100%', alignItems: 'flex-start', gap: 12 }}>
              <div className="ann-dot" style={{ marginTop: 6, flexShrink: 0 }} />
              <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setExpanded(expanded === a.id ? null : a.id)}>
                <div className="ann-ttl">{a.title}</div>
                <div className="ann-by" style={{ marginTop: 4 }}>
                  {a.course_title ? <><span>Course:</span> {a.course_title}</> : 'General broadcast'}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                <div className="ann-time">{timeAgo(a.created_at)}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="inline-btn ghost" style={{ padding: '3px 10px', fontSize: 10 }} onClick={() => openEdit(a)}><Pencil size={10} /> Edit</button>
                  <button className="inline-btn danger" style={{ padding: '3px 10px', fontSize: 10 }} onClick={() => deleteAnn(a.id)}><Trash2 size={10} /> Delete</button>
                </div>
              </div>
            </div>
            {expanded === a.id && (a.content || a.body) && (
              <div style={{ marginLeft: 22, padding: '10px 14px', background: 'rgba(78,205,196,0.04)', borderRadius: 8, border: '1px solid var(--glassBorder)', fontSize: 13, color: 'var(--whiteMuted)', lineHeight: 1.6 }}>
                {(a.content || a.body)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
