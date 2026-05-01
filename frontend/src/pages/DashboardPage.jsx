import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Legend } from 'recharts';
import Layout from '../components/Layout';
import OnboardingModal from '../components/OnboardingModal';
import { sessionsApi } from '../services/api';

const EXERCISE_COLORS = { squat: '#6366f1', deadlift: '#10b981', pushup: '#f59e0b' };
const EXERCISE_ICONS = { squat: '🦵', deadlift: '🏋️', pushup: '💪' };

const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  title: { fontSize: 26, fontWeight: 700, color: '#e2e8f0' },
  newBtn: { padding: '0.6rem 1.4rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #6366f1, #818cf8)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  statCard: { background: '#1e1e32', border: '1px solid #6366f120', borderRadius: 12, padding: '1.2rem' },
  statValue: { fontSize: 28, fontWeight: 800, color: '#818cf8' },
  statLabel: { fontSize: 13, color: '#64748b', marginTop: 4 },
  chartsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' },
  chartCard: { background: '#1e1e32', border: '1px solid #6366f120', borderRadius: 12, padding: '1.5rem' },
  chartTitle: { fontSize: 15, fontWeight: 600, color: '#c7d2fe', marginBottom: '1rem' },
  section: { marginBottom: '2rem' },
  sectionTitle: { fontSize: 18, fontWeight: 600, color: '#e2e8f0', marginBottom: '1rem' },
  sessionRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: '#1e1e32', border: '1px solid #6366f120', borderRadius: 12,
    padding: '1rem 1.5rem', marginBottom: '0.75rem', cursor: 'pointer',
    transition: 'border-color 0.2s',
  },
  sessionLeft: { display: 'flex', alignItems: 'center', gap: '1rem' },
  sessionIcon: { fontSize: 28 },
  sessionName: { fontSize: 15, fontWeight: 600, color: '#e2e8f0', textTransform: 'capitalize' },
  sessionDate: { fontSize: 12, color: '#64748b', marginTop: 2 },
  sessionRight: { display: 'flex', gap: '2rem', alignItems: 'center' },
  metricBox: { textAlign: 'center' },
  metricVal: { fontSize: 16, fontWeight: 700, color: '#818cf8' },
  metricLbl: { fontSize: 11, color: '#64748b' },
  scoreBadge: (score) => ({
    padding: '0.25rem 0.75rem', borderRadius: 20, fontSize: 13, fontWeight: 700,
    background: score >= 80 ? '#05966920' : score >= 60 ? '#d9770620' : '#dc262620',
    color: score >= 80 ? '#34d399' : score >= 60 ? '#fbbf24' : '#f87171',
  }),
  emptyState: { textAlign: 'center', padding: '3rem', color: '#475569' },
  emptyIcon: { fontSize: 48, marginBottom: '1rem' },
  emptyText: { fontSize: 16, marginBottom: '1.5rem' },
  loading: { textAlign: 'center', padding: '3rem', color: '#64748b' },
};

export default function DashboardPage() {
  const [sessions, setSessions] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('phystech_onboarded'));
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([sessionsApi.list(), sessionsApi.progress()])
      .then(([s, p]) => { setSessions(s.data); setProgress(p.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><div style={s.loading}>Loading your data…</div></Layout>;

  const totalSessions = sessions.length;
  const totalReps = sessions.reduce((sum, s) => sum + (s.total_reps || 0), 0);
  const avgScore = sessions.length
    ? Math.round(sessions.reduce((sum, s) => sum + (parseFloat(s.avg_form_score) || 0), 0) / sessions.length)
    : 0;
  const totalMinutes = Math.round(sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / 60);

  return (
    <Layout onOpenHelp={() => setShowOnboarding(true)}>
      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
      <div style={s.header}>
        <div style={s.title}>My Dashboard</div>
        <button style={s.newBtn} onClick={() => navigate('/analyze')}>+ New Session</button>
      </div>

      {/* Stats */}
      <div style={s.statsGrid}>
        {[
          { value: totalSessions, label: 'Total Sessions' },
          { value: totalReps, label: 'Total Reps' },
          { value: `${avgScore}%`, label: 'Avg Form Score' },
          { value: `${totalMinutes}m`, label: 'Total Training Time' },
        ].map((stat) => (
          <div key={stat.label} style={s.statCard}>
            <div style={s.statValue}>{stat.value}</div>
            <div style={s.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      {progress && (
        <div style={s.chartsGrid}>
          {progress.trend?.length > 1 && (
            <div style={s.chartCard}>
              <div style={s.chartTitle}>Form Score Trend (30 days)</div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={progress.trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#6366f110" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={d => d.slice(5)} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ background: '#1e1e32', border: '1px solid #6366f140', borderRadius: 8 }} />
                  <Line type="monotone" dataKey="avg_score" stroke="#818cf8" strokeWidth={2} dot={false} name="Form Score" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {progress.byExercise?.length > 0 && (
            <div style={s.chartCard}>
              <div style={s.chartTitle}>Sessions by Exercise</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={progress.byExercise}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#6366f110" />
                  <XAxis dataKey="exercise_type" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ background: '#1e1e32', border: '1px solid #6366f140', borderRadius: 8 }} />
                  <Bar dataKey="total_sessions" name="Sessions" radius={[4, 4, 0, 0]}
                    fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Session list */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Recent Sessions</div>
        {sessions.length === 0 ? (
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>🏃</div>
            <div style={s.emptyText}>No sessions yet. Start your first analysis!</div>
            <button style={s.newBtn} onClick={() => navigate('/analyze')}>Start Analyzing</button>
          </div>
        ) : (
          sessions.map((session) => (
            <div key={session.id} style={s.sessionRow} onClick={() => navigate(`/sessions/${session.id}`)}>
              <div style={s.sessionLeft}>
                <span style={s.sessionIcon}>{EXERCISE_ICONS[session.exercise_type] || '🏋️'}</span>
                <div>
                  <div style={s.sessionName}>{session.exercise_type}</div>
                  <div style={s.sessionDate}>{new Date(session.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
              <div style={s.sessionRight}>
                <div style={s.metricBox}>
                  <div style={s.metricVal}>{session.total_reps}</div>
                  <div style={s.metricLbl}>Reps</div>
                </div>
                <div style={s.metricBox}>
                  <div style={s.metricVal}>{Math.round(session.duration_seconds / 60)}m</div>
                  <div style={s.metricLbl}>Duration</div>
                </div>
                <div style={s.scoreBadge(parseFloat(session.avg_form_score))}>
                  {Math.round(parseFloat(session.avg_form_score))}%
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}
