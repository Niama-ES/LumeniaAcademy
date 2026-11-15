import { useState, useEffect } from 'react';
import { consultationsAPI } from '../api.js';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return diff + 's ago';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    consultationsAPI.myTeacherConsults()
      .then(r => setConsultations(r.data?.consultations || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="main"><div className="loading-state"><div className="spinner" />Loading consultations...</div></div>;

  const filtered = filter === 'course' ? consultations.filter(c => !c.chapter_id)
    : filter === 'chapter' ? consultations.filter(c => c.chapter_id)
    : consultations;

  const courseCount = consultations.filter(c => !c.chapter_id).length;
  const chapterCount = consultations.filter(c => c.chapter_id).length;

  const byCourse = {};
  consultations.forEach(c => {
    const key = c.course_title || c.course_id || 'Unknown';
    byCourse[key] = (byCourse[key] || 0) + 1;
  });

  return (
    <div className="main pfade">
      <div className="ph">
        <div className="ph-eye">Student Engagement</div>
        <div className="ph-title">Consultations</div>
        <div className="ph-sub">Every time a student visits your content.</div>
      </div>

      <div className="ts-top" style={{ marginBottom: 24 }}>
        {[
          ['Total', consultations.length, 'a'],
          ['Course Views', courseCount, 't'],
          ['Chapter Reads', chapterCount, 't'],
          ['Unique Courses', Object.keys(byCourse).length, 'a'],
        ].map(([l, v, c], i) => (
          <div key={i} className="ts-card">
            <div className="ts-lbl">{l}</div>
            <div className={"ts-val " + c}>{v}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="tab-bar" style={{ marginBottom: 20 }}>
        {[['all', 'All'], ['course', 'Course Views'], ['chapter', 'Chapter Reads']].map(([v, l]) => (
          <button key={v} className={"tab-btn" + (filter === v ? ' on' : '')} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>

      {/* Course breakdown */}
      <div className="sec">By Course</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
        {Object.entries(byCourse).sort((a, b) => b[1] - a[1]).map(([title, count], i) => {
          const COLORS = ['#4ECDC4', '#F7B731', '#A29BFE', '#55EFC4'];
          const color = COLORS[i % 4];
          const max = Math.max(...Object.values(byCourse), 1);
          return (
            <div key={i} className="eng-item" style={{ padding: '10px 14px', background: 'var(--glass)', border: '1px solid var(--glassBorder)', borderRadius: 10 }}>
              <div className="eng-dot" style={{ background: color, boxShadow: '0 0 5px ' + color }} />
              <div className="eng-lbl" style={{ fontSize: 13 }}>{title}</div>
              <div className="eng-track">
                <div className="eng-fill" style={{ width: Math.round(count / max * 100) + '%', background: 'linear-gradient(90deg,' + color + '30,' + color + ')' }} />
              </div>
              <div className="eng-val" style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, color: color }}>{count}</div>
            </div>
          );
        })}
        {Object.keys(byCourse).length === 0 && <div style={{ color: 'var(--whiteMuted)', fontSize: 13 }}>No consultations yet.</div>}
      </div>

      <div className="sec">Recent Consultations</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 && <div style={{ color: 'var(--whiteMuted)', fontSize: 13 }}>No consultations yet.</div>}
        {filtered.slice(0, 50).map((c, i) => (
          <div key={i} className="log-e" style={{ padding: '10px 14px', background: 'var(--glass)', border: '1px solid var(--glassBorder)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className={"log-sig " + (c.chapter_id ? 'ls-ok' : 'ls-del')} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: 'var(--white)', fontWeight: 500 }}>
                {c.chapter_id ? ('Chapter: ' + (c.chapter_title || '#' + c.chapter_id)) : ('Course: ' + (c.course_title || '#' + c.course_id))}
              </div>
              <div style={{ fontSize: 11, color: 'var(--whiteMuted)', marginTop: 2 }}>
                Student: {c.student_name || c.student_email || ('ID ' + c.student_id)}
              </div>
            </div>
            <div className={"log-act " + (c.chapter_id ? 'la-ok' : 'la-del')} style={{ fontSize: 10 }}>
              {c.chapter_id ? 'CHAPTER' : 'COURSE'}
            </div>
            <div className="log-t">{timeAgo(c.consulted_at || c.created_at)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
