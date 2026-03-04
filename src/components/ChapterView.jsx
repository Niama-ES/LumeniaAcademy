import { useState, useEffect } from 'react';
import { ChapterSideCanvas } from './Canvases.jsx';
import { consultationsAPI, chapterFilesAPI } from '../api.js';
import { useAuth } from '../auth.jsx';
import { CheckCircle, Circle, Paperclip, FileText, Image as ImageIcon, Download } from 'lucide-react';

function getFileIcon(mimetype) {
  if (mimetype === 'application/pdf') return <FileText size={20} />;
  if (mimetype.startsWith('image/')) return <ImageIcon size={20} />;
  if (mimetype.includes('word')) return <FileText size={20} />;
  if (mimetype.includes('presentation') || mimetype.includes('powerpoint')) return <FileText size={20} />;
  return <Paperclip size={20} />;
}

export default function ChapterView({ data, setPage }) {
  const { user } = useAuth();
  const [marked, setMarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (data?.chapter?.id) {
      chapterFilesAPI.list(data.chapter.id)
        .then(r => setFiles(r.data?.files || []))
        .catch(e => console.error('Failed to load chapter files:', e));
    }
  }, [data?.chapter?.id]);

  if (!data) {
    return (
      <div className="main pfade">
        <div className="ph-title" style={{ marginTop: 40 }}>No chapter selected</div>
        <button onClick={() => setPage('courses')} style={{ background: 'none', border: 'none', color: 'var(--teal)', cursor: 'pointer', marginTop: 12 }}>← Back to courses</button>
      </div>
    );
  }

  const { course, chapter, allChapters } = data;

  const chapters = allChapters.map((ch, i) => ({
    ...ch,
    status: ch.id === chapter.id ? 'current' : i < allChapters.findIndex(c => c.id === chapter.id) ? 'completed' : 'dim',
  }));

  const markDone = async () => {
    if (marked || loading) return;
    setLoading(true);
    try {
      await consultationsAPI.consultChapter(chapter.id);
      setMarked(true);
    } catch (e) { setMarked(true); } // optimistic
    finally { setLoading(false); }
  };

  return (
    <div className="main pfade">
      <div className="ph" style={{ marginBottom: 20 }}>
        <div className="ph-eye">Synaptic Activation</div>
        <div className="ph-title" style={{ fontSize: 24 }}>{chapter.title}</div>
      </div>
      <div className="chap-layout">
        <div className="chap-content">
          <div className="chap-bc">
            <span style={{ cursor: 'pointer', color: 'var(--whiteMuted)' }} onClick={() => setPage('courses')}>Courses</span>
            <span className="chap-bc-sep">→</span>
            <span style={{ color: 'var(--whiteMuted)' }}>{course?.title}</span>
            <span className="chap-bc-sep">→</span>
            <span className="chap-bc-cur">{chapter.title}</span>
          </div>
          <div className="chap-meta">
            <div className="chap-meta-i">Course: <span>{course?.title}</span></div>
            {chapter.created_at && (
              <div className="chap-meta-i">Date: <span>{new Date(chapter.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></div>
            )}
          </div>
          <div className="chap-body">
            {chapter.content ? (
              chapter.content.split('\n').map((para, i) => para.trim() ? <p key={i}>{para}</p> : null)
            ) : (
              <p style={{ color: 'var(--whiteMuted)', fontStyle: 'italic' }}>This chapter has no content yet. Check back later.</p>
            )}
          </div>
          <button className="mark-btn" onClick={markDone} disabled={loading}
            style={marked ? { background: 'rgba(78,205,196,.22)', borderColor: 'var(--teal)' } : {}}>
            {marked
              ? <><CheckCircle size={15} /> Node Activated</>
              : loading
              ? 'Activating...'
              : <><Circle size={15} /> Activate this Node</>}
          </button>

          {files.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <div style={{ fontSize: 11, color: 'var(--whiteMuted)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Paperclip size={12} /> Attachments
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {files.map(f => {
                  const size = f.size < 1024 * 1024
                    ? (f.size / 1024).toFixed(1) + ' KB'
                    : (f.size / (1024 * 1024)).toFixed(1) + ' MB';
                  return (
                    <a key={f.id} href={`/uploads/chapters/${f.stored_name}`} target="_blank" rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(78,205,196,0.06)', border: '1px solid rgba(78,205,196,0.18)', borderRadius: 10, textDecoration: 'none', transition: 'background .2s', color: 'var(--teal)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(78,205,196,0.12)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(78,205,196,0.06)'}>
                      <span style={{ display: 'flex' }}>{getFileIcon(f.mimetype)}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: 'var(--white)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.original_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--whiteMuted)' }}>{size}</div>
                      </div>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--teal)', whiteSpace: 'nowrap' }}>
                        <Download size={12} /> Download
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className="chap-sidebar">
          <div className="chap-side-card">
            <ChapterSideCanvas chapters={chapters} />
            <div className="chap-side-list">
              <div className="chap-side-ttl">Chapter Nodes</div>
              {chapters.map((ch, i) => (
                <div key={i} className={`cn-item ${ch.status === 'current' ? 'cur' : ''}`}>
                  <div className={`cn-dot ${ch.status}`} />
                  <div className={`cn-txt ${ch.status}`}>{ch.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
