import { useState, useEffect } from 'react';
import { announcementsAPI } from '../api.js';
import { Zap } from 'lucide-react';

function timeAgo(dateStr) {
  const now = Date.now();
  const d = new Date(dateStr).getTime();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AnnouncementsPage() {
  const [anns, setAnns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    announcementsAPI.list()
      .then(r => setAnns(r.data?.announcements || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="main"><div className="loading-state"><div className="spinner" />Loading signals...</div></div>;

  return (
    <div className="main pfade">
      <div className="ph">
        <div className="ph-eye">Synaptic Transmissions</div>
        <div className="ph-title">Announcements</div>
        <div className="ph-sub">Live signals from your teachers, arriving in real time.</div>
      </div>

      {selected ? (
        <div>
          <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--teal)', cursor: 'pointer', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>← All announcements</button>
          <div className="chap-content">
            <div className="chap-bc">
              <Zap size={12} style={{ color: 'var(--teal)' }} />
              <span className="chap-bc-sep">·</span>
              <span style={{ color: 'var(--whiteMuted)' }}>{selected.teacher_name || 'Teacher'}</span>
              <span className="chap-bc-sep">·</span>
              <span className="chap-bc-cur">{selected.created_at ? timeAgo(selected.created_at) : ''}</span>
            </div>
            <h2 className="chap-title">{selected.title}</h2>
            <div className="chap-body">
              {(selected.content || selected.body || 'No content').split('\n').map((p, i) => p.trim() ? <p key={i}>{p}</p> : null)}
            </div>
          </div>
        </div>
      ) : (
        <div className="ann-list">
          {anns.length === 0 && <div style={{ color: 'var(--whiteMuted)', fontSize: 13 }}>No announcements yet.</div>}
          {anns.map((a, i) => (
            <div key={i} className="ann" onClick={() => setSelected(a)} style={{ cursor: 'pointer' }}>
              <div className="ann-dot" />
              <div style={{ flex: 1 }}>
                <div className="ann-ttl">{a.title}</div>
                <div className="ann-by">By <span>{a.teacher_name || 'Teacher'}</span>{a.course_title ? ` · ${a.course_title}` : ''}</div>
                {(a.content || a.body) && (
                  <div style={{ fontSize: 11, color: 'var(--whiteMuted)', marginTop: 4 }}>
                    {(a.content || a.body).slice(0, 100)}{(a.content || a.body).length > 100 ? '...' : ''}
                  </div>
                )}
              </div>
              <div className="ann-time">{a.created_at ? timeAgo(a.created_at) : ''}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
