import { useState, useEffect } from 'react';
import { Ring } from './Canvases.jsx';
import { coursesAPI, chaptersAPI, consultationsAPI } from '../api.js';
import { Bot, Code, Settings, FileText, Globe, BarChart2, Atom, Monitor, CheckCircle, ChevronRight } from 'lucide-react';

const ICON_COMPONENTS = [Bot, Code, Settings, FileText, Globe, BarChart2, Atom, Monitor];
const getIcon = (i, size = 20) => { const C = ICON_COMPONENTS[i % ICON_COMPONENTS.length]; return <C size={size} />; };

const COLORS = ['#4ECDC4', '#F7B731', '#A29BFE', '#55EFC4'];
const GRADS = ['linear-gradient(135deg,#4ECDC4,#45B7AA)', 'linear-gradient(135deg,#F7B731,#e0a020)', 'linear-gradient(135deg,#A29BFE,#8e84fe)', 'linear-gradient(135deg,#55EFC4,#40d9ae)'];
const CLS = ['v0', 'v1', 'v2', 'v3'];

export default function CoursesPage({ setPage, setSelectedCourse }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [doneChapterIds, setDoneChapterIds] = useState(new Set());

  useEffect(() => {
    coursesAPI.list().then(r => setCourses(r.data?.courses || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const openCourse = async (course) => {
    setSelected(course);
    setDoneChapterIds(new Set());
    setLoadingChapters(true);
    try {
      const [chaptersRes, doneRes] = await Promise.all([
        chaptersAPI.listByCourse(course.id),
        consultationsAPI.myConsultedChapters(course.id).catch(() => ({ data: { chapterIds: [] } })),
      ]);
      setChapters(chaptersRes.data?.chapters || []);
      setDoneChapterIds(new Set(doneRes.data?.chapterIds || []));
      // record course-level consultation
      consultationsAPI.consultCourse(course.id).catch(() => {});
    } catch (e) { console.error(e); }
    finally { setLoadingChapters(false); }
  };

  const openChapter = (chapter) => {
    setSelectedCourse({ course: selected, chapter, allChapters: chapters });
    setPage('chapter');
  };

  if (loading) return <div className="main"><div className="loading-state"><div className="spinner" />Loading courses...</div></div>;

  if (selected) {
    return (
      <div className="main pfade">
        <div className="ph">
          <button style={{ background: 'none', border: 'none', color: 'var(--teal)', cursor: 'pointer', fontSize: 13, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => setSelected(null)}>← Back to courses</button>
          <div className="ph-eye">Course Details</div>
          <div className="ph-title">{selected.title}</div>
          <div className="ph-sub">{selected.description}</div>
        </div>
        {loadingChapters ? (
          <div className="loading-state"><div className="spinner" />Loading chapters...</div>
        ) : (
          <div>
            <div className="sec">Chapters</div>
            {chapters.length === 0 && <div style={{ color: 'var(--whiteMuted)', fontSize: 13 }}>No chapters available yet.</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {chapters.map((ch, i) => {
                const isDone = doneChapterIds.has(ch.id);
                return (
                  <div key={ch.id} className="pb-card v0" onClick={() => openChapter(ch)} style={{ cursor: 'pointer' }}>
                    <div className="pb-ico v0"><FileText size={18} /></div>
                    <div style={{ flex: 1 }}>
                      <div className="pb-name">{ch.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--whiteMuted)' }}>{ch.content ? ch.content.slice(0, 80) + '...' : 'Click to read'}</div>
                    </div>
                    {isDone
                      ? <div style={{ fontSize: 11, color: 'var(--teal)', fontWeight: 600, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={13} /> Done</div>
                      : <ChevronRight size={16} style={{ color: 'var(--teal)' }} />
                    }
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="main pfade">
      <div className="ph">
        <div className="ph-eye">Knowledge Constellation</div>
        <div className="ph-title">Available Courses</div>
        <div className="ph-sub">Each course is a cluster. Click to explore its chapters.</div>
      </div>
      <div className="course-cards-grid">
        {courses.length === 0 && <div style={{ color: 'var(--whiteMuted)', fontSize: 13, gridColumn: '1/-1' }}>No courses available yet.</div>}
        {courses.map((c, i) => {
          const color = COLORS[i % 4];
          const grad = GRADS[i % 4];
          const pct = Math.round((c.progress || 0) * 100);
          const badge = pct === 100 ? 'done' : pct > 0 ? 'on' : 'new';
          const badgeLabel = { on: 'In Progress', new: 'New', done: 'Complete' };
          const av = (c.teacher_name || 'T').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
          return (
            <div key={c.id} className="cc" onClick={() => openCourse(c)}>
              <div className="cc-top">
                <div className="cc-ico-wrap">
                  <div className="cc-ico" style={{ background: `${color}18`, color }}>{getIcon(i, 22)}</div>
                  <Ring pct={pct} color={color} />
                </div>
                <div className={`cc-badge badge-${badge}`}>{badgeLabel[badge]}</div>
              </div>
              <div className="cc-title">{c.title}</div>
              <div className="cc-desc">{c.description || 'Explore this course and activate your knowledge nodes.'}</div>
              <div className="cc-foot">
                <div className="cc-teacher">
                  <div className="cc-tav" style={{ background: grad }}>{av}</div>
                  <div className="cc-tname">{c.teacher_name || 'Teacher'}</div>
                </div>
                <div className="cc-ch">{c.chapter_count || 0} chapters</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
