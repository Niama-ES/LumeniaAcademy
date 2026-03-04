import { useState } from 'react';
import { useAuth } from '../auth.jsx';
import { AuthCanvas } from './Canvases.jsx';
import { AtSign, Lock, Brain, Zap, Globe, GraduationCap, BookOpen, Check, ChevronLeft } from 'lucide-react';

export function Login({ setView, onSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email || !pass) { setError('Please fill in all fields.'); return; }
    setLoading(true); setError('');
    try {
      const user = await login(email, pass);
      onSuccess(user);
    } catch (e) {
      setError(e.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page pfade">
      <div className="auth-left">
        <button className="auth-back" onClick={() => setView('landing')}>
          <ChevronLeft size={14} /> Back to home
        </button>
        <div className="auth-logo">
          <div className="auth-mark">L</div>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700 }}>Luminia</div>
            <div style={{ fontSize: 9, color: 'var(--teal)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Academy</div>
          </div>
        </div>
        <div className="auth-eyebrow">Neural Access Portal</div>
        <h1 className="auth-title">Welcome<br />back.</h1>
        <p className="auth-sub">Sign in to reconnect with your learning core and resume your neural journey.</p>
        <div className="auth-form">
          {error && <div className="error-msg">{error}</div>}
          <div className="field">
            <div className="field-label">Email Address</div>
            <div className="field-wrap">
              <input className="field-input" type="email" placeholder="your@email.com"
                value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
              <span className="field-icon"><AtSign size={14} /></span>
            </div>
          </div>
          <div className="field">
            <div className="field-label">Password</div>
            <div className="field-wrap">
              <input className="field-input" type="password" placeholder="••••••••"
                value={pass} onChange={e => setPass(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
              <span className="field-icon"><Lock size={14} /></span>
            </div>
          </div>
          <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Connecting...' : 'Reconnect to Core'}
          </button>
          <div className="form-divider">or</div>
          <div className="form-footer">
            Don't have an account?{' '}
            <button className="form-link" onClick={() => setView('register')}>Create your node →</button>
          </div>
        </div>
      </div>
      <div className="auth-right">
        <AuthCanvas type="login" />
        <div className="auth-right-content">
          <div className="auth-feature-card">
            <div className="afc-icon"><Brain size={26} style={{ color: 'var(--teal)' }} /></div>
            <div className="afc-title">Your Learning Core</div>
            <div className="afc-desc">Every time you sign in, your neural map picks up exactly where you left off. Progress is never lost — it's encoded.</div>
          </div>
          <div className="auth-mini-cards">
            <div className="auth-mini">
              <div className="am-val t">47</div>
              <div className="am-lbl">Consultations today</div>
            </div>
            <div className="auth-mini">
              <div className="am-val a">12</div>
              <div className="am-lbl">Active right now</div>
            </div>
          </div>
          <div className="auth-quote">
            <div className="aq-text">"Luminia made my progress visible for the first time. I could literally see myself learning."</div>
            <div className="aq-author">
              <div className="aq-av">AI</div>
              <div>
                <div className="aq-name">Amina Ikbir</div>
                <div className="aq-role">Student · Master ISI</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Register({ setView, onSuccess }) {
  const { register } = useAuth();
  const [role, setRole] = useState('STUDENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !pass) { setError('Please fill in all fields.'); return; }
    setLoading(true); setError('');
    try {
      const user = await register(name, email, pass, role);
      setDone(true);
      setTimeout(() => onSuccess(user), 1800);
    } catch (e) {
      setError(e.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="auth-page pfade">
        <div className="auth-left" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div className="success-state">
            <div className="success-ring"><span className="success-check"><Check size={22} /></span></div>
            <h2 className="success-title">Node activated.</h2>
            <p className="success-sub">Your neural profile has been created. Welcome to the network, {name}.</p>
            <div style={{ fontSize: 12, color: 'var(--wMuted)' }}>Connecting to your core...</div>
          </div>
        </div>
        <div className="auth-right">
          <AuthCanvas type="register" />
          <div className="auth-right-content">
            <div className="auth-feature-card">
              <div className="afc-icon"><Zap size={26} style={{ color: 'var(--amber)' }} /></div>
              <div className="afc-title">Your node is live</div>
              <div className="afc-desc">You've joined the network. Your learning core is ready — activating your first synapses now.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page pfade">
      <div className="auth-left" style={{ overflowY: 'auto', paddingTop: 100 }}>
        <button className="auth-back" onClick={() => setView('landing')}>
          <ChevronLeft size={14} /> Back to home
        </button>
        <div className="auth-logo">
          <div className="auth-mark">L</div>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700 }}>Luminia</div>
            <div style={{ fontSize: 9, color: 'var(--teal)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Academy</div>
          </div>
        </div>
        <div className="auth-eyebrow">Join the Network</div>
        <h1 className="auth-title">Create your<br />node.</h1>
        <p className="auth-sub">Choose your role and enter the neural learning environment.</p>
        <div className="auth-form">
          {error && <div className="error-msg">{error}</div>}
          <div className="field">
            <div className="field-label">I am a</div>
            <div className="role-select">
              {[{ id: 'STUDENT', icon: <GraduationCap size={18} />, label: 'Student' }, { id: 'TEACHER', icon: <BookOpen size={18} />, label: 'Teacher' }].map(r => (
                <div key={r.id} className={`rs-opt ${role === r.id ? 'sel' : ''}`} onClick={() => setRole(r.id)}>
                  <span className="rs-emoji">{r.icon}</span>
                  <span className="rs-label">{r.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="field">
            <div className="field-label">Full Name</div>
            <div className="field-wrap">
              <input className="field-input" type="text" placeholder="Your full name"
                value={name} onChange={e => setName(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <div className="field-label">Email Address</div>
            <div className="field-wrap">
              <input className="field-input" type="email" placeholder="your@email.com"
                value={email} onChange={e => setEmail(e.target.value)} />
              <span className="field-icon"><AtSign size={14} /></span>
            </div>
          </div>
          <div className="field">
            <div className="field-label">Password</div>
            <div className="field-wrap">
              <input className="field-input" type="password" placeholder="Create a strong password"
                value={pass} onChange={e => setPass(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
              <span className="field-icon"><Lock size={14} /></span>
            </div>
          </div>
          <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Activating...' : 'Activate My Node'}
          </button>
          <div className="form-footer">
            Already in the network?{' '}
            <button className="form-link" onClick={() => setView('login')}>Sign in →</button>
          </div>
        </div>
      </div>
      <div className="auth-right">
        <AuthCanvas type="register" />
        <div className="auth-right-content">
          <div className="auth-feature-card">
            <div className="afc-icon"><Globe size={26} style={{ color: 'var(--amber)' }} /></div>
            <div className="afc-title">What happens when you join</div>
            <div className="afc-desc">Your neural profile is created instantly. As a {role.toLowerCase()}, you'll get access to your personal learning environment with a live neural map that grows with you.</div>
          </div>
          <div className="auth-mini-cards">
            <div className="auth-mini">
              <div className="am-val t">17</div>
              <div className="am-lbl">Nodes in network</div>
            </div>
            <div className="auth-mini">
              <div className="am-val a">4+</div>
              <div className="am-lbl">Active courses</div>
            </div>
          </div>
          <div className="auth-quote">
            <div className="aq-text">"Teaching here feels different. I can see exactly which concepts my students are engaging with."</div>
            <div className="aq-author">
              <div className="aq-av" style={{ background: 'linear-gradient(135deg,#F7B731,#e0a020)' }}>KE</div>
              <div>
                <div className="aq-name">Karima El Amrani</div>
                <div className="aq-role">Teacher · Intro to AI</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
