import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { analyzeFrame, updateRepCount } from '../utils/poseAnalysis';
import { initializePoseDetection, detectPose, convertToMediaPipeFormat } from '../utils/tfPoseDetector';
import { sessionsApi } from '../services/api';

const EXERCISES = [
  { id: 'squat', label: 'Squat', icon: '🦵', desc: 'Tracks knee angles, hip depth & back alignment' },
  { id: 'deadlift', label: 'Deadlift', icon: '🏋️', desc: 'Tracks hip hinge, back rounding & knee bend' },
  { id: 'pushup', label: 'Push-up', icon: '💪', desc: 'Tracks elbow angle & body alignment' },
];

const EXERCISE_SETUP = {
  squat: {
    camera: 'Place camera at hip height, 1.5–2 m away, filming from the side.',
    position: 'Stand sideways to the camera. Feet shoulder-width apart.',
    watch: ['Knee angle (should reach ~90° at bottom)', 'Torso lean (keep chest up)', 'Hip depth (hips below parallel for full ROM)'],
    avoid: ['Knees caving inward', 'Heels lifting off the floor', 'Excessive forward lean'],
  },
  deadlift: {
    camera: 'Place camera at knee height, 1.5–2 m away, filming from the side.',
    position: 'Stand sideways to the camera. Bar should be over mid-foot.',
    watch: ['Back angle (maintain neutral spine)', 'Hip hinge (push hips back, not down)', 'Bar path (close to body throughout)'],
    avoid: ['Rounding the lower back', 'Jerking the bar off the floor', 'Hyper-extending at lockout'],
  },
  pushup: {
    camera: 'Place camera at floor level to the side, 1–1.5 m away.',
    position: 'Film from the side so your full body is visible from head to toe.',
    watch: ['Elbow angle (aim for ~90° at bottom)', 'Body line (straight from head to heels)', 'Elbow flare (keep elbows at ~45°)'],
    avoid: ['Hips sagging or piking', 'Head drooping forward', 'Partial range of motion'],
  },
};

const s = {
  page: { maxWidth: 1100 },
  title: { fontSize: 26, fontWeight: 700, color: '#e2e8f0', marginBottom: '0.5rem' },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: '2rem' },
  exercisePicker: { display: 'flex', gap: '1rem', marginBottom: '2rem' },
  exCard: (active) => ({
    flex: 1, padding: '1.2rem', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
    border: active ? '2px solid #6366f1' : '2px solid #374151',
    background: active ? '#6366f115' : '#1e1e32',
  }),
  exIcon: { fontSize: 28, marginBottom: '0.5rem' },
  exLabel: { fontSize: 15, fontWeight: 600, color: '#e2e8f0', marginBottom: 4 },
  exDesc: { fontSize: 12, color: '#64748b' },
  analyzeLayout: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' },
  videoWrap: { position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#000', aspectRatio: '4/3' },
  canvas: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  video: { width: '100%', display: 'block' },
  overlay: { position: 'absolute', top: 12, left: 12, display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  badge: (color) => ({ padding: '0.3rem 0.8rem', borderRadius: 20, fontSize: 13, fontWeight: 700, background: color + '30', color, border: `1px solid ${color}50` }),
  sidebar: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  card: { background: '#1e1e32', border: '1px solid #6366f120', borderRadius: 12, padding: '1.2rem' },
  cardTitle: { fontSize: 13, fontWeight: 600, color: '#818cf8', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: 1 },
  scoreCircle: { display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '1rem 0' },
  scoreNum: (score) => ({ fontSize: 52, fontWeight: 900, color: score >= 80 ? '#34d399' : score >= 60 ? '#fbbf24' : '#f87171' }),
  scoreLabel: { fontSize: 12, color: '#64748b' },
  angleRow: { display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #6366f110', fontSize: 13 },
  angleKey: { color: '#94a3b8' },
  angleVal: { color: '#c7d2fe', fontWeight: 600 },
  alertList: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  alertItem: { display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: 13, color: '#fca5a5', background: '#7f1d1d20', border: '1px solid #ef444420', borderRadius: 8, padding: '0.5rem 0.75rem' },
  repCount: { fontSize: 48, fontWeight: 900, color: '#818cf8', textAlign: 'center', padding: '0.5rem 0' },
  repLabel: { fontSize: 12, color: '#64748b', textAlign: 'center' },
  phase: { textAlign: 'center', fontSize: 14, color: '#a5b4fc', marginTop: 4, textTransform: 'capitalize' },
  controls: { display: 'flex', gap: '0.75rem', marginTop: '1rem' },
  startBtn: { flex: 1, padding: '0.75rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #059669, #34d399)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' },
  stopBtn: { flex: 1, padding: '0.75rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #dc2626, #f87171)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' },
  saving: { textAlign: 'center', padding: '1rem', color: '#818cf8', fontSize: 14 },
  setupGuide: {
    background: '#1e1e32', border: '1px solid #6366f120', borderRadius: 16,
    padding: '1.5rem', marginBottom: '1rem',
  },
  setupTitle: { fontSize: 15, fontWeight: 700, color: '#c7d2fe', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  setupSection: { marginBottom: '1rem' },
  setupLabel: { fontSize: 11, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.4rem' },
  setupRow: { fontSize: 13, color: '#94a3b8', marginBottom: '0.3rem', display: 'flex', gap: '0.5rem' },
  cameraBox: { background: '#6366f115', border: '1px solid #6366f130', borderRadius: 10, padding: '0.75rem 1rem', fontSize: 13, color: '#a5b4fc', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' },
  placeholder: { display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.75rem', color: '#374151', fontSize: 14, height: '100%', minHeight: 200 },
};

const ANGLE_LABELS = {
  left_knee_angle: 'Left Knee',
  right_knee_angle: 'Right Knee',
  hip_angle: 'Hip',
  back_angle: 'Back',
  elbow_angle: 'Elbow',
};

export default function AnalyzePage() {
  const [exercise, setExercise] = useState('squat');
  const [isRunning, setIsRunning] = useState(false);
  const [formScore, setFormScore] = useState(100);
  const [angles, setAngles] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [phase, setPhase] = useState('');
  const [repState, setRepState] = useState({ count: 0, lastPhase: 'up' });
  const [saving, setSaving] = useState(false);

  const canvasRef = useRef(null);
  const repStateRef = useRef({ count: 0, lastPhase: 'up' });
  const navigate = useNavigate();
  const startTimeRef = useRef(null);
  const metricsBuffer = useRef([]);
  const videoRef = useRef(null);

  const onResults = useCallback((results) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 640;
    canvas.height = 480;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw simulated skeleton
    if (results.landmarks) {
      // Draw placeholder skeleton
      drawSimulatedSkeleton(ctx, results.landmarks, results.angles, canvas.width, canvas.height);

      const analysis = analyzeFrame(results.landmarks, exercise);
      setFormScore(analysis.formScore);
      setAngles(analysis.angles);
      setAlerts(analysis.alerts);
      setPhase(analysis.phase);

      const newRepState = updateRepCount(repStateRef.current, analysis.angles, exercise);
      if (newRepState.count !== repStateRef.current.count) {
        repStateRef.current = newRepState;
        setRepState({ ...newRepState });
      } else {
        repStateRef.current = { ...repStateRef.current, lastPhase: newRepState.lastPhase };
      }

      // Buffer metric snapshot every ~500ms
      const now = Date.now();
      if (!metricsBuffer.current._lastSaved || now - metricsBuffer.current._lastSaved > 500) {
        metricsBuffer.current.push({
          timestamp_ms: startTimeRef.current ? now - startTimeRef.current : 0,
          ...analysis.angles,
          form_score: analysis.formScore,
          alert_type: analysis.alerts[0] || null,
          rep_count: repStateRef.current.count,
        });
        metricsBuffer.current._lastSaved = now;
      }
    }
    ctx.restore();
  }, [exercise]);

  const startSession = async () => {
    metricsBuffer.current = [];
    repStateRef.current = { count: 0, lastPhase: 'up' };
    setRepState({ count: 0, lastPhase: 'up' });
    startTimeRef.current = Date.now();

    // Initialize TensorFlow.js pose detection
    await initializePoseDetection();

    // Start webcam
    const video = document.createElement('video');
    video.width = 640;
    video.height = 480;
    video.style.display = 'none';
    document.body.appendChild(video);

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 }
    });
    video.srcObject = stream;
    await video.play();

    // Detection loop
    const detect = async () => {
      if (!isRunning) {
        stream.getTracks().forEach(t => t.stop());
        document.body.removeChild(video);
        return;
      }

      const poses = await detectPose(video);
      const results = convertToMediaPipeFormat(poses);

      if (results && results.landmarks) {
        onResults(results);
      }

      requestAnimationFrame(detect);
    };

    setIsRunning(true);
    requestAnimationFrame(detect);
    console.log('Session started - analyzing pose with TensorFlow.js...');
  };

  const stopSession = async () => {
    setIsRunning(false);
    await saveSession();
  };

  const saveSession = async () => {
    setSaving(true);
    try {
      const duration = startTimeRef.current ? Math.round((Date.now() - startTimeRef.current) / 1000) : 0;
      const metrics = metricsBuffer.current.filter(m => !m._lastSaved);
      const avgScore = metrics.length
        ? Math.round(metrics.reduce((sum, m) => sum + (m.form_score || 0), 0) / metrics.length)
        : 0;

      const { data } = await sessionsApi.create({
        exercise_type: exercise,
        duration_seconds: duration,
        total_reps: repStateRef.current.count,
        avg_form_score: avgScore,
        metrics,
      });
      navigate(`/sessions/${data.sessionId}`);
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div style={s.page}>
        <div style={s.title}>Live Analysis</div>
        <div style={s.subtitle}>Select an exercise, then start your session</div>

        {/* Exercise picker */}
        <div style={s.exercisePicker}>
          {EXERCISES.map((ex) => (
            <div key={ex.id} style={s.exCard(exercise === ex.id)} onClick={() => !isRunning && setExercise(ex.id)}>
              <div style={s.exIcon}>{ex.icon}</div>
              <div style={s.exLabel}>{ex.label}</div>
              <div style={s.exDesc}>{ex.desc}</div>
            </div>
          ))}
        </div>

        <div style={s.analyzeLayout}>
          {/* Canvas area */}
          <div>
            {/* Setup guide shown before session starts */}
            {!isRunning && !saving && <SetupGuide exercise={exercise} />}

            <div style={{ ...s.videoWrap, display: isRunning ? 'block' : 'none' }}>
              <canvas ref={canvasRef} style={s.canvas} width={640} height={480} />
              {isRunning && (
                <div style={s.overlay}>
                  <span style={s.badge('#34d399')}>SIM</span>
                  <span style={s.badge('#818cf8')}>{EXERCISES.find(e => e.id === exercise)?.label}</span>
                  {phase && <span style={s.badge('#a5b4fc')}>{phase}</span>}
                </div>
              )}
            </div>
            <div style={s.controls}>
              {!isRunning ? (
                <button style={s.startBtn} onClick={startSession}>▶ Start Session</button>
              ) : (
                <button style={s.stopBtn} onClick={stopSession}>⏹ Stop & Save</button>
              )}
            </div>
            {saving && <div style={s.saving}>Saving session and generating AI report…</div>}
          </div>

          {/* Sidebar */}
          <div style={s.sidebar}>
            {/* Form score */}
            <div style={s.card}>
              <div style={s.cardTitle}>Form Score</div>
              <div style={s.scoreCircle}>
                <div style={s.scoreNum(formScore)}>{formScore}</div>
                <div style={s.scoreLabel}>out of 100</div>
              </div>
            </div>

            {/* Reps */}
            <div style={s.card}>
              <div style={s.cardTitle}>Rep Counter</div>
              <div style={s.repCount}>{repState.count}</div>
              <div style={s.repLabel}>reps completed</div>
              {phase && <div style={s.phase}>{phase}</div>}
            </div>

            {/* Angles */}
            <div style={s.card}>
              <div style={s.cardTitle}>Joint Angles</div>
              {Object.entries(angles).length === 0 ? (
                <div style={{ fontSize: 13, color: '#475569' }}>Start session to see angles</div>
              ) : (
                Object.entries(angles).map(([key, val]) => (
                  <div key={key} style={s.angleRow}>
                    <span style={s.angleKey}>{ANGLE_LABELS[key] || key}</span>
                    <span style={s.angleVal}>{val}°</span>
                  </div>
                ))
              )}
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
              <div style={s.card}>
                <div style={s.cardTitle}>Form Alerts</div>
                <div style={s.alertList}>
                  {alerts.map((alert, i) => (
                    <div key={i} style={s.alertItem}>⚠️ {alert}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function SetupGuide({ exercise }) {
  const guide = EXERCISE_SETUP[exercise];
  if (!guide) return null;
  const ex = EXERCISES.find(e => e.id === exercise);

  return (
    <div style={s.setupGuide}>
      <div style={s.setupTitle}>
        <span>{ex?.icon}</span> Setup Guide — {ex?.label}
      </div>

      <div style={s.cameraBox}>
        📷 <span>{guide.camera}</span>
      </div>

      <div style={s.setupSection}>
        <div style={s.setupLabel}>Your starting position</div>
        <div style={s.setupRow}>🧍 {guide.position}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={s.setupSection}>
          <div style={s.setupLabel}>What we track</div>
          {guide.watch.map((item, i) => (
            <div key={i} style={s.setupRow}><span style={{ color: '#34d399' }}>✓</span> {item}</div>
          ))}
        </div>
        <div style={s.setupSection}>
          <div style={s.setupLabel}>Common mistakes to avoid</div>
          {guide.avoid.map((item, i) => (
            <div key={i} style={s.setupRow}><span style={{ color: '#f87171' }}>✗</span> {item}</div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '1rem', background: '#059669' + '15', border: '1px solid #05966940', borderRadius: 10, padding: '0.75rem 1rem', fontSize: 13, color: '#34d399' }}>
        ✅ When ready, press <strong>Start Session</strong> — the AI will begin analyzing your form immediately.
      </div>
    </div>
  );
}

function drawSimulatedSkeleton(ctx, landmarks, angles, w, h) {
  // Draw simple skeleton representation
  ctx.strokeStyle = '#6366f180';
  ctx.lineWidth = 2;
  
  // Draw dots for landmarks
  ctx.fillStyle = '#818cf8';
  if (landmarks) {
    Object.values(landmarks).forEach(lm => {
      if (lm && lm.x && lm.y) {
        ctx.beginPath();
        ctx.arc(lm.x * w, lm.y * h, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  // Draw angle overlays
  ctx.font = 'bold 13px Segoe UI';
  ctx.fillStyle = '#818cf8';
  ctx.textAlign = 'center';

  const drawAt = (lm, text) => {
    if (!lm || !lm.x || !lm.y) return;
    ctx.fillStyle = '#0f0f1aCC';
    ctx.fillRect(lm.x * w - 25, lm.y * h - 22, 50, 18);
    ctx.fillStyle = '#c7d2fe';
    ctx.fillText(text, lm.x * w, lm.y * h - 8);
  };

  if (landmarks[25] && angles.left_knee_angle != null) drawAt(landmarks[25], `${angles.left_knee_angle}°`);
  if (landmarks[26] && angles.right_knee_angle != null) drawAt(landmarks[26], `${angles.right_knee_angle}°`);
  if (landmarks[23] && angles.hip_angle != null) drawAt(landmarks[23], `${angles.hip_angle}°`);
  if (landmarks[13] && angles.elbow_angle != null) drawAt(landmarks[13], `${angles.elbow_angle}°`);
}
