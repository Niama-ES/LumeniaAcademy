import { useState, useEffect } from 'react';
import { NeuralActivityMap } from './Canvases.jsx';
import { teacherStatsAPI, coursesAPI, consultationsAPI } from '../api.js';
import { useAuth } from '../auth.jsx';

function fmt(n) { return n ?? 0; }
function dayLabel(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  const load = () => {
    setLoading(true);
    teacherStatsAPI.me()
      .then(r => setStats(r.data?.stats || r.data || null))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="main"><div className="loading-state"><div className="spinner" />Loading statistics...</div></div>;

  const totals = stats?.totals || {};
  const topCourses = stats?.topCourses || [];
  const topChapters = stats?.topChapters || [];
  const timeline = stats?.timelineDaily || [];
  const perCourse = stats?.consultationsPerCourse || [];

  const maxBar = Math.max(...(timeline.length ? timeline.map(t => t.consultations) : [1]), 1);

  const COLORS = ['#4ECDC4', '#F7B731', '#A29BFE', '#55EFC4'];

  return (
    <div className="main pfade">
      <div className="ph">
        <div className="ph-eye">You are shaping minds</div>
        <div className="ph-title">Teacher Statistics</div>
        <div className="ph-sub">Analytics and insights about your courses</div>
      </div>

      {/* Stat cards */}
      <div className="ts-top">
        {[
          ['Total Courses', fmt(totals.courses), 't'],
          ['Total Chapters', fmt(totals.chapters), 't'],
          ['Total Consultations', fmt(totals.consultations), 'a'],
          ['Chapter Views', fmt(totals.consultationsChapterLevel), 'a'],
        ].map(([l, v, c], i) => (
          <div key={i} className="ts-card">
            <div className="ts-lbl">{l}</div>
            <div className={"ts-val " + c}>{v}</div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="tab-bar" style={{ marginBottom: 24 }}>
        {['overview', 'courses', 'chapters'].map(t => (
          <button key={t} className={"tab-btn" + (tab === t ? ' on' : '')} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="ts-grid">
          {/* Neural map */}
          <div className="neural-map-card" style={{ gridColumn: '1 / -1' }}>
            <NeuralActivityMap />
            <div className="nm-overlay">
              <div className="nm-label">Student Engagement Network</div>
              <div className="nm-sublabel">Node brightness = consultation intensity</div>
            </div>
          </div>

          {/* Timeline chart */}
          <div className="ts-chart">
            <div className="ts-chart-ttl">Daily Consultations</div>
            {timeline.length === 0 ? (
              <div style={{ color: 'var(--whiteMuted)', fontSize: 12, paddingTop: 16 }}>No consultation data yet.</div>
            ) : (
              <div className="bar-chart" style={{ alignItems: 'flex-end', overflowX: 'auto' }}>
                {timeline.slice(-14).map((t, i) => (
                  <div key={i} className="bc-grp" style={{ minWidth: 28 }}>
                    <div className="bc-bar t" style={{ height: Math.max(4, (t.consultations / maxBar) * 100) + '%', maxWidth: 22 }} />
                    <div className="bc-lbl" style={{ fontSize: 9 }}>{new Date(t.day).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Per-course */}
          <div className="ts-chart">
            <div className="ts-chart-ttl">Consultations by Course</div>
            <div className="eng-list">
              {perCourse.length === 0 && <div style={{ color: 'var(--whiteMuted)', fontSize: 12 }}>No courses yet.</div>}
              {perCourse.slice(0, 6).map((c, i) => {
                const color = COLORS[i % 4];
                const maxC = Math.max(...perCourse.map(x => x.consultations), 1);
                const pct = Math.round((c.consultations / maxC) * 100);
                return (
                  <div key={i} className="eng-item">
                    <div className="eng-dot" style={{ background: color, boxShadow: '0 0 5px ' + color }} />
                    <div className="eng-lbl">{c.title.split(' ').slice(0, 3).join(' ')}</div>
                    <div className="eng-track">
                      <div className="eng-fill" style={{ width: pct + '%', background: 'linear-gradient(90deg,' + color + '30,' + color + ')', boxShadow: '0 0 6px ' + color + '50' }} />
                    </div>
                    <div className="eng-val">{c.consultations}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === 'courses' && (
        <div>
          <div className="sec">Top Courses by Consultations</div>
          {topCourses.length === 0 && <div style={{ color: 'var(--whiteMuted)', fontSize: 13 }}>No courses yet.</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topCourses.map((c, i) => (
              <div key={i} className="pb-card v0" style={{ cursor: 'default' }}>
                <div className="pb-ico v0" style={{ background: COLORS[i % 4] + '20', color: COLORS[i % 4] }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div className="pb-name">{c.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--whiteMuted)' }}>Course ID: {c.id}</div>
                </div>
                <div style={{ color: 'var(--amber)', fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 20 }}>{c.consultations}</div>
                <div style={{ fontSize: 10, color: 'var(--whiteMuted)' }}>views</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'chapters' && (
        <div>
          <div className="sec">Top Chapters by Consultations</div>
          {topChapters.length === 0 && <div style={{ color: 'var(--whiteMuted)', fontSize: 13 }}>No chapters yet.</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topChapters.map((c, i) => (
              <div key={i} className="pb-card v1" style={{ cursor: 'default' }}>
                <div className="pb-ico v1" style={{ background: COLORS[i % 4] + '20', color: COLORS[i % 4] }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div className="pb-name">{c.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--whiteMuted)' }}>From: {c.course_title}</div>
                </div>
                <div style={{ color: 'var(--teal)', fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 20 }}>{c.consultations}</div>
                <div style={{ fontSize: 10, color: 'var(--whiteMuted)' }}>reads</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
