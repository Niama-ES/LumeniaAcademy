import { useState, useEffect, useRef } from 'react';
import { coursesAPI, chaptersAPI, chapterFilesAPI } from '../api.js';
import { useAuth } from '../auth.jsx';
import { Bot, Code, Settings, FileText, Globe, BarChart2, Atom, Monitor, Paperclip, Image as ImageIcon, Pencil, X, Trash2 } from 'lucide-react';

const ICON_COMPONENTS = [Bot, Code, Settings, FileText, Globe, BarChart2, Atom, Monitor];
const getIcon = (i, size = 20) => { const C = ICON_COMPONENTS[i % ICON_COMPONENTS.length]; return <C size={size} />; };
const COLORS = ['#4ECDC4', '#F7B731', '#A29BFE', '#55EFC4'];

const EMPTY_COURSE = { title: '', description: '' };
const EMPTY_CHAPTER = { title: '', content: '' };

function fileIcon(mimetype) {
  if (mimetype === 'application/pdf') return <FileText size={15} />;
  if (mimetype.startsWith('image/')) return <ImageIcon size={15} />;
  if (mimetype.includes('word')) return <FileText size={15} />;
  if (mimetype.includes('presentation') || mimetype.includes('powerpoint')) return <FileText size={15} />;
  return <Paperclip size={15} />;
}

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function MyCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loadingChapters, setLoadingChapters] = useState(false);

  // Course form
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [courseForm, setCourseForm] = useState(EMPTY_COURSE);

  // Chapter form
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [editChapter, setEditChapter] = useState(null);
  const [chapterForm, setChapterForm] = useState(EMPTY_CHAPTER);

  // File state — lives inside the chapter form
  const [existingFiles, setExistingFiles] = useState([]); // already on server (edit mode)
  const [pendingFiles, setPendingFiles] = useState([]);   // File objects, not yet uploaded

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const r = await coursesAPI.listByTeacher(user?.id);
      setCourses(r.data?.courses || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const loadChapters = async (course) => {
    setLoadingChapters(true);
    try {
      const r = await chaptersAPI.listByCourse(course.id);
      setChapters(r.data?.chapters || []);
    } catch (e) { console.error(e); }
    setLoadingChapters(false);
  };

  useEffect(() => { loadCourses(); }, []);

  const openCourse = (c) => { setSelected(c); loadChapters(c); setShowChapterForm(false); setEditChapter(null); };
  const backToCourses = () => { setSelected(null); setShowChapterForm(false); setEditChapter(null); setError(''); };

  // --- Course CRUD ---
  const openCreateCourse = () => { setEditCourse(null); setCourseForm(EMPTY_COURSE); setError(''); setShowCourseForm(true); };
  const openEditCourse = (c, e) => { e.stopPropagation(); setEditCourse(c); setCourseForm({ title: c.title, description: c.description || '' }); setError(''); setShowCourseForm(true); };
  const cancelCourseForm = () => { setShowCourseForm(false); setError(''); };

  const submitCourse = async () => {
    if (!courseForm.title.trim()) { setError('Title required'); return; }
    setSaving(true); setError('');
    try {
      if (editCourse) {
        await coursesAPI.update(editCourse.id, courseForm);
      } else {
        await coursesAPI.create(courseForm.title, courseForm.description);
      }
      cancelCourseForm();
      loadCourses();
    } catch (e) { setError(e.message); }
    setSaving(false);
  };

  const deleteCourse = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this course and all its chapters?')) return;
    try { await coursesAPI.delete(id); setSelected(null); loadCourses(); }
    catch (e) { alert(e.message); }
  };

  // --- Chapter CRUD ---
  const openCreateChapter = () => {
    setEditChapter(null);
    setChapterForm(EMPTY_CHAPTER);
    setExistingFiles([]);
    setPendingFiles([]);
    setError('');
    setShowChapterForm(true);
  };

  const openEditChapter = async (ch) => {
    setEditChapter(ch);
    setChapterForm({ title: ch.title, content: ch.content || '' });
    setPendingFiles([]);
    setError('');
    setShowChapterForm(true);
    // Load existing files for this chapter
    try {
      const r = await chapterFilesAPI.list(ch.id);
      setExistingFiles(r.data?.files || []);
    } catch { setExistingFiles([]); }
  };

  const cancelChapterForm = () => {
    setShowChapterForm(false);
    setEditChapter(null);
    setExistingFiles([]);
    setPendingFiles([]);
    setError('');
  };

  const submitChapter = async () => {
    if (!chapterForm.title.trim()) { setError('Title required'); return; }
    setSaving(true); setError('');
    try {
      let chapterId;
      if (editChapter) {
        await chaptersAPI.update(editChapter.id, chapterForm);
        chapterId = editChapter.id;
      } else {
        const r = await chaptersAPI.create(selected.id, chapterForm);
        chapterId = r.data?.chapter?.id;
      }
      // Upload any pending files
      if (chapterId && pendingFiles.length > 0) {
        const failed = [];
        for (const file of pendingFiles) {
          try {
            await chapterFilesAPI.upload(chapterId, file);
          } catch (e) {
            console.error('File upload failed:', e.message);
            failed.push(`${file.name} (${e.message})`);
          }
        }
        if (failed.length > 0) {
          setError(`Chapter saved but file upload failed: ${failed.join('; ')}`);
          setSaving(false);
          loadChapters(selected);
          return;
        }
      }
      cancelChapterForm();
      loadChapters(selected);
    } catch (e) { setError(e.message); }
    setSaving(false);
  };

  const deleteChapter = async (id) => {
    if (!window.confirm('Delete this chapter?')) return;
    try { await chaptersAPI.delete(id); setChapters(ch => ch.filter(c => c.id !== id)); }
    catch (e) { alert(e.message); }
  };

  // --- File helpers (inside form) ---
  const removeExistingFile = async (fileId) => {
    if (!window.confirm('Remove this file?')) return;
    try {
      await chapterFilesAPI.delete(editChapter.id, fileId);
      setExistingFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (e) { alert(e.message); }
  };

  const addPendingFile = (file) => {
    if (!file) return;
    setPendingFiles(prev => [...prev, file]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePendingFile = (index) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) return <div className="main"><div className="loading-state"><div className="spinner" />Loading courses...</div></div>;

  // ── Chapter view ─────────────────────────────────────────
  if (selected) {
    return (
      <div className="main pfade">
        <div className="ph">
          <button onClick={backToCourses} style={{ background: 'none', border: 'none', color: 'var(--teal)', cursor: 'pointer', fontSize: 13, marginBottom: 8 }}>← My Courses</button>
          <div className="ph-eye">Course Management</div>
          <div className="ph-title">{selected.title}</div>
          <div className="ph-sub">{selected.description}</div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          <button className="inline-btn ghost" onClick={openCreateChapter}>+ Add Chapter</button>
          <button className="inline-btn ghost" onClick={() => openEditCourse(selected, { stopPropagation: () => {} })}><Pencil size={13} /> Edit Course</button>
          <button className="inline-btn danger" onClick={(e) => deleteCourse(selected.id, e)}><Trash2 size={13} /> Delete Course</button>
        </div>

        {(showCourseForm && editCourse) && (
          <div className="form-panel" style={{ marginBottom: 24 }}>
            <div className="form-panel-title">Edit Course</div>
            {error && <div className="error-msg" style={{ marginBottom: 14 }}>{error}</div>}
            <div className="field" style={{ marginBottom: 12 }}>
              <div className="field-label">Title</div>
              <input className="field-input" value={courseForm.title} onChange={e => setCourseForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="field" style={{ marginBottom: 16 }}>
              <div className="field-label">Description</div>
              <textarea className="field-input" rows={3} value={courseForm.description}
                onChange={e => setCourseForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="inline-btn" onClick={submitCourse} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
              <button className="inline-btn ghost" onClick={cancelCourseForm}>Cancel</button>
            </div>
          </div>
        )}

        {showChapterForm && (
          <div className="form-panel" style={{ marginBottom: 24 }}>
            <div className="form-panel-title">{editChapter ? 'Edit Chapter' : 'New Chapter'}</div>
            {error && <div className="error-msg" style={{ marginBottom: 14 }}>{error}</div>}

            <div className="field" style={{ marginBottom: 12 }}>
              <div className="field-label">Chapter Title</div>
              <input className="field-input" placeholder="Chapter title"
                value={chapterForm.title} onChange={e => setChapterForm(f => ({ ...f, title: e.target.value }))} />
            </div>

            <div className="field" style={{ marginBottom: 16 }}>
              <div className="field-label">Content</div>
              <textarea className="field-input" placeholder="Chapter content..." rows={6}
                value={chapterForm.content} onChange={e => setChapterForm(f => ({ ...f, content: e.target.value }))}
                style={{ resize: 'vertical', minHeight: 120 }} />
            </div>

            {/* ── File attachments ── */}
            <div className="field" style={{ marginBottom: 16 }}>
              <div className="field-label">Attachments</div>

              {/* Existing files (edit mode) */}
              {existingFiles.map(f => (
                <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ display: 'flex', color: 'var(--teal)' }}>{fileIcon(f.mimetype)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: 'var(--white)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.original_name}</div>
                    <div style={{ fontSize: 10, color: 'var(--whiteMuted)' }}>{formatSize(f.size)}</div>
                  </div>
                  <button className="inline-btn danger" style={{ padding: '2px 7px', fontSize: 10 }}
                    onClick={() => removeExistingFile(f.id)}><X size={10} /></button>
                </div>
              ))}

              {/* Pending files (queued to upload on save) */}
              {pendingFiles.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ display: 'flex', color: 'var(--teal)' }}><Paperclip size={15} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: 'var(--teal)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--whiteMuted)' }}>{formatSize(f.size)} · will upload on save</div>
                  </div>
                  <button className="inline-btn ghost" style={{ padding: '2px 7px', fontSize: 10 }}
                    onClick={() => removePendingFile(i)}><X size={10} /></button>
                </div>
              ))}

              {existingFiles.length === 0 && pendingFiles.length === 0 && (
                <div style={{ fontSize: 11, color: 'var(--whiteMuted)', paddingBottom: 8 }}>No attachments yet.</div>
              )}

              {/* Add file button */}
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                <input ref={fileInputRef} type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp"
                  style={{ display: 'none' }}
                  onChange={e => addPendingFile(e.target.files[0])} />
                <button type="button" className="inline-btn ghost" style={{ padding: '4px 12px', fontSize: 11 }}
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}>
                  + Add File
                </button>
                <span style={{ fontSize: 10, color: 'var(--whiteMuted)' }}>PDF · Word · PowerPoint · Images · max 50 MB</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="inline-btn" onClick={submitChapter} disabled={saving}>
                {saving ? (pendingFiles.length > 0 ? 'Saving & uploading...' : 'Saving...') : editChapter ? 'Update Chapter' : 'Create Chapter'}
              </button>
              <button className="inline-btn ghost" onClick={cancelChapterForm}>Cancel</button>
            </div>
          </div>
        )}

        <div className="sec">Chapters ({loadingChapters ? '...' : chapters.length})</div>
        {!loadingChapters && chapters.length === 0 && <div style={{ color: 'var(--whiteMuted)', fontSize: 13 }}>No chapters yet. Add your first chapter above.</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {chapters.map((ch, i) => (
            <div key={ch.id} className="pb-card v0" style={{ cursor: 'default' }}>
              <div className="pb-ico v0"><FileText size={18} /></div>
              <div style={{ flex: 1 }}>
                <div className="pb-name">{ch.title}</div>
                <div style={{ fontSize: 11, color: 'var(--whiteMuted)' }}>{ch.content ? ch.content.slice(0, 100) + '...' : 'No content'}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="inline-btn ghost" style={{ padding: '4px 10px', fontSize: 10 }} onClick={() => openEditChapter(ch)}><Pencil size={10} /> Edit</button>
                <button className="inline-btn danger" style={{ padding: '4px 10px', fontSize: 10 }} onClick={() => deleteChapter(ch.id)}><Trash2 size={10} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Course list ───────────────────────────────────────────
  return (
    <div className="main pfade">
      <div className="ph">
        <div className="ph-eye">Teaching Neural Grid</div>
        <div className="ph-title">My Courses</div>
        <div className="ph-sub">Manage your courses and their chapter nodes.</div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <button className="inline-btn ghost" onClick={openCreateCourse}>+ Create Course</button>
      </div>

      {showCourseForm && !editCourse && (
        <div className="form-panel" style={{ marginBottom: 28 }}>
          <div className="form-panel-title">New Course</div>
          {error && <div className="error-msg" style={{ marginBottom: 14 }}>{error}</div>}
          <div className="field" style={{ marginBottom: 12 }}>
            <div className="field-label">Course Title</div>
            <input className="field-input" placeholder="e.g. Introduction to AI"
              value={courseForm.title} onChange={e => setCourseForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="field" style={{ marginBottom: 16 }}>
            <div className="field-label">Description</div>
            <textarea className="field-input" placeholder="What will students learn?" rows={3}
              value={courseForm.description} onChange={e => setCourseForm(f => ({ ...f, description: e.target.value }))}
              style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="inline-btn" onClick={submitCourse} disabled={saving}>{saving ? 'Creating...' : 'Create Course'}</button>
            <button className="inline-btn ghost" onClick={cancelCourseForm}>Cancel</button>
          </div>
        </div>
      )}

      <div className="course-cards-grid">
        {courses.length === 0 && !showCourseForm && <div style={{ color: 'var(--whiteMuted)', fontSize: 13, gridColumn: '1/-1' }}>You haven't created any courses yet.</div>}
        {courses.map((c, i) => {
          const color = COLORS[i % 4];
          return (
            <div key={c.id} className="cc" onClick={() => openCourse(c)}>
              <div className="cc-top">
                <div className="cc-ico" style={{ background: color + '18', width: 52, height: 52, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{getIcon(i, 22)}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="inline-btn ghost" style={{ padding: '3px 8px', fontSize: 10, zIndex: 2 }}
                    onClick={(e) => openEditCourse(c, e)}><Pencil size={10} /></button>
                  <button className="inline-btn danger" style={{ padding: '3px 8px', fontSize: 10, zIndex: 2 }}
                    onClick={(e) => deleteCourse(c.id, e)}><Trash2 size={10} /></button>
                </div>
              </div>
              <div className="cc-title">{c.title}</div>
              <div className="cc-desc">{c.description || 'Click to manage chapters'}</div>
              <div className="cc-foot">
                <div style={{ fontSize: 11, color: 'var(--teal)' }}>Manage →</div>
                <div className="cc-ch">{c.chapter_count || 0} chapters</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
