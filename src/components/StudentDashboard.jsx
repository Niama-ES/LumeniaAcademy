import { useState, useEffect } from 'react';
import { LearningCore } from './Canvases.jsx';
import { coursesAPI, announcementsAPI, chaptersAPI, consultationsAPI } from '../api.js';
import { useAuth } from '../auth.jsx';
import { Bot, Code, Settings, FileText, Globe, BarChart2, Atom, Monitor } from 'lucide-react';

const ICON_COMPONENTS = [Bot, Code, Settings, FileText, Globe, BarChart2, Atom, Monitor];
const getIcon = (i, size = 18) => { const C = ICON_COMPONENTS[i % ICON_COMPONENTS.length]; return <C size={size} />; };
const COLORS = ['#4ECDC4', '#F7B731', '#A29BFE', '#55EFC4'];
const CLS = ['v0', 'v1', 'v2', 'v3'];

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return diff + 's ago';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}

export default function StudentDashboard({ setPage, setSelectedCourse }) {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [anns, setAnns] = useState([]);
  const [progress, setProgress] = useState({}); // courseId -> { total, done }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([coursesAPI.list(), announcementsAPI.list(), consultationsAPI.myStudentProgress()])
      .then(async ([c, a, prog]) => {
        const courseList = c.data?.courses || [];
        setCourses(courseList);
        setAnns((a.data?.announcements || []).slice(0, 5));

        // Build a map of courseId -> chapters_read from the student's consultations
        const consulted = {};
        for (const p of (prog.data?.progress || [])) {
          consulted[p.course_id] = p.chapters_read || 0;
        }

        // Load chapter counts per course, then compute real progress percentage
        const progressMap = {};
        await Promise.all(courseList.slice(0, 6).map(async (course) => {
          try {
            const r = await chaptersAPI.listByCourse(course.id);
            const total = (r.data?.chapters || []).length;
            const done = consulted[course.id] || 0;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            progressMap[course.id] = { total, done, pct };
          } catch {}
        }));
        setProgress(progressMap);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="main"><div className="loading-state"><div className="spinner" />Loading your core...</div></div>;

  const totalChapters = Object.values(progress).reduce((s, p) => s + p.total, 0);
  const totalRead = Object.values(progress).reduce((s, p) => s + (p.done || 0), 0);

  return (
    <div className="main pfade">
      <div className="ph">
        <div className="ph-eye">Neural Learning Environment</div>
        <div className="ph-title">Your Learning Core</div>
        <div className="ph-sub">Each node is a course. Each glow is your progress.</div>
      </div>

      <div className="nc-wrap">
        <div className="nc-canvas-card">
          <LearningCore courses={courses} />
          <div className="nc-label">Learning Core · Live</div>
        </div>
        <div className="nc-right">
          {[
            { lbl: 'Available Courses', val: courses.length.toString(), cls: 't', desc: 'Nodes in your network' },
            { lbl: 'Chapters Read', val: `${totalRead}/${totalChapters}`, cls: 't', desc: 'Nodes activated' },
            { lbl: 'Announcements', val: anns.length.toString(), cls: 'a', desc: 'Signals received' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="sc-label">{s.lbl}</div>
              <div className={"sc-val " + s.cls}>{s.val}</div>
              <div className="sc-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="sec">Progress Signals</div>
      <div className="pb-list">
        {courses.length === 0 && <div style={{ color: 'var(--whiteMuted)', fontSize: 13 }}>No courses available yet.</div>}
        {courses.slice(0, 6).map((c, i) => {
          const prog = progress[c.id];
          const total = prog?.total || c.chapter_count || 0;
          const done = prog?.done || 0;
          const pct = prog?.pct || 0;
          const cls = CLS[i % 4];
          return (
            <div key={c.id} className={"pb-card " + cls}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                if (setPage && setSelectedCourse) {
                  setPage('courses');
                }
              }}>
              <div className={"pb-ico " + cls}>{getIcon(i)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="pb-name">{c.title}</div>
                <div style={{ fontSize: 10, color: 'var(--whiteMuted)', marginBottom: 6 }}>
                  {total > 0 ? `${done}/${total} chapter${total !== 1 ? 's' : ''} read` : 'No chapters yet'}
                  {c.teacher_name ? ' · ' + c.teacher_name : ''}
                </div>
                <div className="pb-track">
                  <div className={"pb-fill " + cls} style={{ width: pct + '%' }}>
                    {pct > 5 && pct < 100 && <div className="pb-dot" />}
                  </div>
                </div>
              </div>
              <div className={"pb-pct " + cls}>{pct}%</div>
            </div>
          );
        })}
      </div>

      <div className="sec">Incoming Signals</div>
      <div className="ann-list">
        {anns.length === 0 && <div style={{ color: 'var(--whiteMuted)', fontSize: 13 }}>No announcements yet.</div>}
        {anns.map((a, i) => (
          <div key={i} className="ann">
            <div className="ann-dot" />
            <div style={{ flex: 1 }}>
              <div className="ann-ttl">{a.title}</div>
              <div className="ann-by">By <span>{a.teacher_name || a.author || 'Teacher'}</span>{a.course_title ? ' · ' + a.course_title : ''}</div>
              {(a.content || a.body) && (
                <div style={{ fontSize: 11, color: 'var(--whiteMuted)', marginTop: 3 }}>
                  {(a.content || a.body).slice(0, 80)}{(a.content || a.body).length > 80 ? '...' : ''}
                </div>
              )}
            </div>
            <div className="ann-time">{a.created_at ? timeAgo(a.created_at) : ''}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
