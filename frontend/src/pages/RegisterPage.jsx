import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)' },
  card: { background: '#1e1e32', border: '1px solid #6366f120', borderRadius: 16, padding: '2.5rem', width: '100%', maxWidth: 420 },
  logo: { textAlign: 'center', marginBottom: '2rem' },
  logoText: { fontSize: 28, fontWeight: 800, color: '#818cf8' },
  logoSub: { fontSize: 13, color: '#475569', marginTop: 4 },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#e2e8f0' },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: '2rem' },
  label: { display: 'block', fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 6 },
  input: { width: '100%', padding: '0.65rem 1rem', borderRadius: 8, border: '1px solid #374151', background: '#0f0f1a', color: '#e2e8f0', fontSize: 14, outline: 'none', marginBottom: '1.2rem' },
  btn: { width: '100%', padding: '0.75rem', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #6366f1, #818cf8)', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  error: { background: '#7f1d1d40', border: '1px solid #ef444440', borderRadius: 8, padding: '0.6rem 1rem', fontSize: 13, color: '#fca5a5', marginBottom: '1rem' },
  link: { textAlign: 'center', marginTop: '1.5rem', fontSize: 14, color: '#64748b' },
  linkA: { color: '#818cf8', textDecoration: 'none', fontWeight: 500 },
};

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>
          <div style={s.logoText}>PhysTech 2026</div>
          <div style={s.logoSub}>AI Biomechanics Analyzer</div>
        </div>
        <div style={s.title}>Create account</div>
        <div style={s.subtitle}>Start analyzing your form today</div>
        {error && <div style={s.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <label style={s.label}>Name</label>
          <input style={s.input} type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
          <label style={s.label}>Email</label>
          <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          <label style={s.label}>Password</label>
          <input style={s.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" required />
          <button style={s.btn} disabled={loading}>{loading ? 'Creating account…' : 'Create Account'}</button>
        </form>
        <div style={s.link}>
          Already have an account? <Link to="/login" style={s.linkA}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
