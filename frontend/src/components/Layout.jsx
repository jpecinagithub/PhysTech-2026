import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const s = {
  shell: { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  nav: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    borderBottom: '1px solid #6366f120',
    padding: '0 2rem',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    height: 64,
  },
  logo: { fontSize: 20, fontWeight: 700, color: '#818cf8', textDecoration: 'none', letterSpacing: '-0.5px' },
  logoSpan: { color: '#c7d2fe' },
  navLinks: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
  navLink: (active) => ({
    padding: '0.4rem 1rem', borderRadius: 8, fontSize: 14, fontWeight: 500,
    textDecoration: 'none', transition: 'all 0.2s',
    color: active ? '#fff' : '#94a3b8',
    background: active ? '#6366f1' : 'transparent',
  }),
  userInfo: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  userName: { fontSize: 14, color: '#94a3b8' },
  helpBtn: {
    background: '#6366f115', border: '1px solid #6366f140', borderRadius: 8,
    color: '#818cf8', padding: '0.35rem 0.9rem', cursor: 'pointer', fontSize: 13,
    fontWeight: 600, transition: 'all 0.2s',
  },
  logoutBtn: {
    background: 'none', border: '1px solid #374151', borderRadius: 8,
    color: '#94a3b8', padding: '0.35rem 0.9rem', cursor: 'pointer', fontSize: 13,
    transition: 'all 0.2s',
  },
  main: { flex: 1, padding: '2rem', maxWidth: 1200, margin: '0 auto', width: '100%' },
};

export default function Layout({ children, onOpenHelp }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={s.shell}>
      <nav style={s.nav}>
        <Link to="/dashboard" style={s.logo}>
          Phys<span style={s.logoSpan}>Tech</span> <span style={{ fontSize: 13, color: '#6366f1' }}>2026</span>
        </Link>
        <div style={s.navLinks}>
          <Link to="/dashboard" style={s.navLink(pathname === '/dashboard')}>Dashboard</Link>
          <Link to="/analyze" style={s.navLink(pathname === '/analyze')}>Analyze</Link>
        </div>
        <div style={s.userInfo}>
          <span style={s.userName}>👋 {user?.name}</span>
          {onOpenHelp && (
            <button style={s.helpBtn} onClick={onOpenHelp} title="Open tutorial">
              ? Help
            </button>
          )}
          <button style={s.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <main style={s.main}>{children}</main>
    </div>
  );
}
