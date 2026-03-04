import { Brain, Zap, Lock, BarChart2, Shield, Globe, GraduationCap, BookOpen, Settings, LogIn } from 'lucide-react';
import { HeroNeural, CtaCanvas } from './Canvases.jsx';

export default function Landing({ setView }) {
  const features = [
    { icon: <Brain size={22} />, bg: 'rgba(78,205,196,0.12)', name: 'Neural Progress Tracking', desc: 'Watch your knowledge network grow. Every chapter activates a node. Every course lights up a cluster.', color: '#4ECDC4' },
    { icon: <Zap size={22} />, bg: 'rgba(247,183,49,0.12)', name: 'Live Synaptic Signals', desc: 'Announcements arrive as signals from your teachers. Stay connected to your learning environment in real time.', color: '#F7B731' },
    { icon: <Lock size={22} />, bg: 'rgba(162,155,254,0.12)', name: 'Role-Based Access', desc: 'Students, teachers, and administrators each inhabit their own neural space with tailored tools and permissions.', color: '#A29BFE' },
    { icon: <BarChart2 size={22} />, bg: 'rgba(85,239,196,0.12)', name: 'Engagement Analytics', desc: 'Teachers see their impact visualised as a living network. High consultation = brighter connections.', color: '#55EFC4' },
    { icon: <Shield size={22} />, bg: 'rgba(78,205,196,0.12)', name: 'Secure Architecture', desc: 'JWT authentication, RBAC control, and full audit logging ensure every action is traceable and protected.', color: '#4ECDC4' },
    { icon: <Globe size={22} />, bg: 'rgba(247,183,49,0.12)', name: 'Modern Full-Stack', desc: 'Node.js + Express backend, REST API, SQLite — built with React frontend consuming the same core.', color: '#F7B731' },
  ];
  const roles = [
    { icon: <GraduationCap size={24} />, bg: 'rgba(78,205,196,0.12)', name: 'Student', color: '#4ECDC4', desc: 'Your learning journey visualised as a living neural map. Every chapter you read activates a node.', features: ['Access all enrolled courses', 'Track chapter progress', 'Read announcements', 'View your learning core'] },
    { icon: <BookOpen size={24} />, bg: 'rgba(247,183,49,0.12)', name: 'Teacher', color: '#F7B731', desc: 'Shape minds and see your impact. Watch student engagement light up your neural activity map.', features: ['Create and manage courses', 'Publish announcements', 'View engagement analytics', 'Track student consultations'] },
    { icon: <Settings size={24} />, bg: 'rgba(162,155,254,0.12)', name: 'Administrator', color: '#A29BFE', desc: 'Oversee the entire system neural grid. Every user is a node. Every action leaves a synaptic trace.', features: ['Manage all users', 'Activate and deactivate accounts', 'Monitor audit logs', 'System health overview'] },
  ];

  return (
    <div className="landing pfade">
      <nav className="nav">
        <div className="nav-logo">
          <div className="nav-mark">L</div>
          <div><div className="nav-name">Luminia</div><div className="nav-sub">Academy</div></div>
        </div>
        <div className="nav-links">
          <button className="nav-link">Features</button>
          <button className="nav-link">Roles</button>
          <button className="nav-btn" onClick={() => setView('login')}>Sign In</button>
          <button className="nav-btn solid" onClick={() => setView('register')}>Get Started</button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-left">
          <div className="hero-tag"><span className="hero-tag-dot" />Neural Learning Environment · Live</div>
          <h1 className="hero-title">Where Learning <em>Becomes</em><br /><span style={{ color: 'var(--wDim)', fontWeight: 600 }}>Visible.</span></h1>
          <p className="hero-sub">Luminia Academy transforms education into a living neural network. Watch your knowledge grow, your progress glow, and your understanding connect — course by course, chapter by chapter.</p>
          <div className="hero-cta">
            <button className="cta-primary" onClick={() => setView('register')}>Enter the Network</button>
            <button className="cta-secondary" onClick={() => setView('login')}><LogIn size={13} /> Sign In</button>
          </div>
          <div className="hero-trust">
            {[['4+', 'Courses'], ['17+', 'Students'], ['100%', 'Activation']].map(([v, l], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                {i > 0 && <div className="trust-sep" />}
                <div className="trust-item">
                  <div className="trust-val">{v}</div>
                  <div className="trust-lbl">{l}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-canvas-wrap">
            <div className="hero-canvas-glow" />
            <HeroNeural />
          </div>
        </div>
      </section>

      <section className="features">
        <div className="feat-header">
          <div className="feat-eyebrow">Why Luminia</div>
          <h2 className="feat-title">Built different.<br />Feels <em>alive</em>.</h2>
        </div>
        <div className="feat-grid">
          {features.map((f, i) => (
            <div key={i} className="feat-card">
              <div className="feat-icon" style={{ background: f.bg, color: f.color }}>{f.icon}</div>
              <div className="feat-name" style={{ color: f.color }}>{f.name}</div>
              <div className="feat-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="roles">
        <div className="roles-header">
          <div className="roles-eyebrow">Designed for Every Role</div>
          <h2 className="roles-title">One network.<br />Three neural spaces.</h2>
        </div>
        <div className="roles-grid">
          {roles.map((r, i) => (
            <div key={i} className="role-card">
              <div className="role-avatar" style={{ background: r.bg, color: r.color }}>{r.icon}</div>
              <div className="role-name" style={{ color: r.color }}>{r.name}</div>
              <div className="role-desc">{r.desc}</div>
              <div className="role-features">
                {r.features.map((f, j) => (
                  <div key={j} className="rf-item">
                    <div className="rf-dot" style={{ background: r.color, boxShadow: `0 0 4px ${r.color}` }} />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-card">
          <CtaCanvas />
          <div className="cta-eyebrow">Ready to Connect?</div>
          <h2 className="cta-big-title">Your learning core<br /><em>awaits activation.</em></h2>
          <p className="cta-big-sub">Join Luminia Academy and experience education as a living, breathing neural network. Every chapter you read lights up your map.</p>
          <div className="cta-btns">
            <button className="cta-primary" onClick={() => setView('register')}>Create Your Node</button>
            <button className="cta-secondary" onClick={() => setView('login')}><LogIn size={13} /> I have an account</button>
          </div>
        </div>
      </section>
    </div>
  );
}
