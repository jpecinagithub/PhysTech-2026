import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import Layout from '../components/Layout';
import { sessionsApi } from '../services/api';

const RISK_COLORS = { low: '#34d399', medium: '#fbbf24', high: '#f87171' };
const EXERCISE_ICONS = { squat: '🦵', deadlift: '🏋️', pushup: '💪' };

const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  backBtn: { padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid #374151', background: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 13 },
  title: { fontSize: 24, fontWeight: 700, color: '#e2e8f0' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' },
  grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' },
  card: { background: '#1e1e32', border: '1px solid #6366f120', borderRadius: 12, padding: '1.5rem' },
  cardTitle: { fontSize: 13, fontWeight: 600, color: '#818cf8', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: 1 },
  statBig: { fontSize: 36, fontWeight: 800, color: '#c7d2fe' },
  statSub: { fontSize: 12, color: '#64748b', marginTop: 4 },
  aiScore: (score) => ({ fontSize: 56, fontWeight: 900, color: score >= 80 ? '#34d399' : score >= 60 ? '#fbbf24' : '#f87171', textAlign: 'center' }),
  aiScoreLbl: { fontSize: 12, color: '#64748b', textAlign: 'center', marginTop: 4 },
  summary: { fontSize: 14, color: '#cbd5e1', lineHeight: 1.7 },
  listItem: { display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: 14, color: '#cbd5e1', marginBottom: '0.5rem' },
  riskBadge: (level) => ({
    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.4rem 1rem', borderRadius: 20, fontSize: 14, fontWeight: 700,
    background: (RISK_COLORS[level] || '#818cf8') + '20',
    color: RISK_COLORS[level] || '#818cf8',
    border: `1px solid ${(RISK_COLORS[level] || '#818cf8')}40`,
  }),
  tip: { background: '#6366f115', border: '1px solid #6366f130', borderRadius: 10, padding: '1rem 1.2rem', fontSize: 14, color: '#c7d2fe', marginTop: '1rem' },
  generating: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem', gap: '1rem', color: '#818cf8' },
  spinner: { width: 40, height: 40, border: '3px solid #6366f120', borderTop: '3px solid #818cf8', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  newBtn: { padding: '0.6rem 1.4rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #6366f1, #818cf8)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
};

export default function SessionReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    sessionsApi.get(id).then(({ data }) => {
      setSession(data.session);
      setMetrics(data.metrics);

      if (data.session.ai_report) {
        try { setReport(JSON.parse(data.session.ai_report)); } catch {}
        setLoading(false);
      } else {
        setLoading(false);
        setGeneratingReport(true);
        sessionsApi.generateReport(id)
          .then(({ data: r }) => setReport(r.report))
          .catch(console.error)
          .finally(() => setGeneratingReport(false));
      }
    }).catch(() => navigate('/dashboard'));
  }, [id, navigate]);

  if (loading) return <Layout><div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading session…</div></Layout>;
  if (!session) return null;

  const chartData = metrics.filter((_, i) => i % 3 === 0).map((m) => ({
    t: (m.timestamp_ms / 1000).toFixed(0) + 's',
    score: m.form_score,
    knee: m.left_knee_angle,
    hip: m.hip_angle,
    elbow: m.elbow_angle,
  }));

  return (
    <Layout>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => navigate('/dashboard')}>← Dashboard</button>
        <button style={s.newBtn} onClick={() => navigate('/analyze')}>+ New Session</button>
      </div>

      {/* Session header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={s.title}>
          {EXERCISE_ICONS[session.exercise_type] || '🏋️'} {session.exercise_type.charAt(0).toUpperCase() + session.exercise_type.slice(1)} Session Report
        </div>
        <div style={s.subtitle}>{new Date(session.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
      </div>

      {/* Stats row */}
      <div style={s.grid3}>
        {[
          { val: session.total_reps, lbl: 'Total Reps' },
          { val: `${Math.round(session.duration_seconds / 60)}m ${session.duration_seconds % 60}s`, lbl: 'Duration' },
          { val: `${Math.round(parseFloat(session.avg_form_score))}%`, lbl: 'Avg Form Score' },
        ].map((s_) => (
          <div key={s_.lbl} style={s.card}>
            <div style={s.statBig}>{s_.val}</div>
            <div style={s.statSub}>{s_.lbl}</div>
          </div>
        ))}
      </div>

      {/* Form score chart */}
      {chartData.length > 1 && (
        <div style={{ ...s.card, marginBottom: '1.5rem' }}>
          <div style={s.cardTitle}>Form Score Over Time</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#6366f110" />
              <XAxis dataKey="t" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip contentStyle={{ background: '#1e1e32', border: '1px solid #6366f140', borderRadius: 8 }} />
              <ReferenceLine y={80} stroke="#34d39940" strokeDasharray="4 4" label={{ value: 'Good', fill: '#34d399', fontSize: 11 }} />
              <Line type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={2} dot={false} name="Form Score" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* AI Report */}
      {generatingReport && (
        <div style={{ ...s.card, marginBottom: '1.5rem' }}>
          <div style={s.generating}>
            <div style={s.spinner} />
            <div>Generating AI coach report…</div>
          </div>
        </div>
      )}

      {report && (
        <div style={s.grid2}>
          {/* Overall score */}
          <div style={s.card}>
            <div style={s.cardTitle}>AI Coach Score</div>
            <div style={s.aiScore(report.overall_score)}>{report.overall_score}</div>
            <div style={s.aiScoreLbl}>out of 100</div>
            <div style={{ marginTop: '1rem' }}>
              <div style={s.cardTitle}>Injury Risk</div>
              <span style={s.riskBadge(report.injury_risk)}>
                {report.injury_risk === 'low' ? '✅' : report.injury_risk === 'medium' ? '⚠️' : '🚨'}
                {report.injury_risk?.toUpperCase()} RISK
              </span>
              <div style={{ fontSize: 13, color: '#94a3b8', marginTop: '0.5rem' }}>{report.injury_risk_reason}</div>
            </div>
          </div>

          {/* Summary */}
          <div style={s.card}>
            <div style={s.cardTitle}>Session Summary</div>
            <div style={s.summary}>{report.summary}</div>
            {report.next_session_tip && (
              <div style={s.tip}>💡 <strong>Next session tip:</strong> {report.next_session_tip}</div>
            )}
          </div>

          {/* Strengths */}
          <div style={s.card}>
            <div style={s.cardTitle}>Strengths</div>
            {report.strengths?.map((str, i) => (
              <div key={i} style={s.listItem}><span style={{ color: '#34d399' }}>✓</span> {str}</div>
            ))}
          </div>

          {/* Improvements */}
          <div style={s.card}>
            <div style={s.cardTitle}>Areas to Improve</div>
            {report.improvements?.map((imp, i) => (
              <div key={i} style={s.listItem}><span style={{ color: '#fbbf24' }}>→</span> {imp}</div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
