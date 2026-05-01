import { useState } from 'react';

const overlay = {
  position: 'fixed', inset: 0, background: '#0008', zIndex: 1000,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  backdropFilter: 'blur(4px)',
};
const modal = {
  background: '#1e1e32', border: '1px solid #6366f130', borderRadius: 20,
  width: '100%', maxWidth: 520, padding: '2.5rem',
  boxShadow: '0 25px 80px #0008',
  maxHeight: '90vh', overflowY: 'auto',
};
const featureGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.25rem' };
const featureItem = { background: '#6366f110', border: '1px solid #6366f120', borderRadius: 10, padding: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 };
const exRow = { display: 'flex', gap: '1rem', alignItems: 'flex-start', background: '#6366f110', borderRadius: 10, padding: '0.75rem 1rem' };

const STEPS = [
  {
    icon: '👋',
    title: 'Welcome to PhysTech 2026',
    content: (
      <>
        <p>Your personal <strong>AI biomechanics coach</strong> — analyze your exercise form in real time using just your camera.</p>
        <p style={{ marginTop: '0.75rem' }}>No wearables, no sensors. Just you and your phone or laptop.</p>
        <div style={featureGrid}>
          {[
            { icon: '📹', label: 'Live pose detection' },
            { icon: '📐', label: 'Joint angle tracking' },
            { icon: '⚠️', label: 'Instant form alerts' },
            { icon: '🤖', label: 'AI session reports' },
          ].map((f) => (
            <div key={f.label} style={featureItem}>
              <span style={{ fontSize: 22 }}>{f.icon}</span>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{f.label}</span>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    icon: '🏋️',
    title: 'Choose your exercise',
    content: (
      <>
        <p>PhysTech currently supports 3 exercises, each with specialized biomechanical analysis:</p>
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { icon: '🦵', name: 'Squat', desc: 'Tracks knee angles, hip depth and torso lean. Counts reps automatically.' },
            { icon: '🏋️', name: 'Deadlift', desc: 'Monitors back rounding, hip hinge angle and knee bend during the pull.' },
            { icon: '💪', name: 'Push-up', desc: 'Checks elbow angle and full-body alignment from head to ankle.' },
          ].map((ex) => (
            <div key={ex.name} style={exRow}>
              <span style={{ fontSize: 26 }}>{ex.icon}</span>
              <div>
                <div style={{ fontWeight: 700, color: '#c7d2fe', marginBottom: 2 }}>{ex.name}</div>
                <div style={{ fontSize: 13, color: '#94a3b8' }}>{ex.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    icon: '📷',
    title: 'Set up your camera',
    content: (
      <>
        <p>Good camera positioning is key to accurate analysis. Follow these tips:</p>
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {[
            { ok: true, text: 'Place camera at full-body height — your whole body should be visible' },
            { ok: true, text: 'Use good lighting — avoid backlighting (window behind you)' },
            { ok: true, text: 'Film from the side or front — avoid diagonal angles' },
            { ok: true, text: 'Wear fitted clothing so joint landmarks are visible' },
            { ok: false, text: 'Avoid loose baggy clothes that hide your body shape' },
            { ok: false, text: 'Don\'t start too close to the camera — keep 1–2m distance' },
          ].map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontSize: 13 }}>
              <span style={{ color: tip.ok ? '#34d399' : '#f87171', marginTop: 1 }}>{tip.ok ? '✓' : '✗'}</span>
              <span style={{ color: '#cbd5e1' }}>{tip.text}</span>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    icon: '📊',
    title: 'Reading your results',
    content: (
      <>
        <p>During a session, the sidebar shows live feedback:</p>
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { label: 'Form Score', color: '#818cf8', desc: '0–100 score updated every frame. 80+ is excellent.' },
            { label: 'Rep Counter', color: '#34d399', desc: 'Automatically counts reps based on joint angle phases.' },
            { label: 'Joint Angles', color: '#a5b4fc', desc: 'Live degree readings for each tracked joint.' },
            { label: 'Form Alerts', color: '#f87171', desc: 'Real-time warnings when your form deviates from safe ranges.' },
          ].map((item) => (
            <div key={item.label} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, marginTop: 5, flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, color: item.color, fontSize: 13 }}>{item.label}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    icon: '🤖',
    title: 'AI Coach Report',
    content: (
      <>
        <p>When you stop a session, the AI coach generates a full report including:</p>
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {[
            '📋 An overall score based on your form throughout the session',
            '💪 Your strengths — what you did well',
            '📈 Areas to improve — specific, actionable feedback',
            '🚨 Injury risk assessment — low / medium / high',
            '💡 A personalized tip for your next session',
          ].map((item, i) => (
            <div key={i} style={{ fontSize: 13, color: '#cbd5e1', display: 'flex', gap: '0.5rem' }}>
              <span>{item}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '1.5rem', background: '#6366f115', border: '1px solid #6366f130', borderRadius: 10, padding: '0.75rem 1rem', fontSize: 13, color: '#c7d2fe' }}>
          All sessions are saved to your dashboard so you can track your progress over time.
        </div>
      </>
    ),
  },
];

export default function OnboardingModal({ onClose }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const finish = () => {
    localStorage.setItem('phystech_onboarded', '1');
    onClose();
  };

  return (
    <div style={overlay} onClick={(e) => e.target === e.currentTarget && finish()}>
      <div style={modal}>
        {/* Step dots */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem' }}>
          {STEPS.map((_, i) => (
            <div key={i} onClick={() => setStep(i)} style={{
              flex: i === step ? 2 : 1, height: 4, borderRadius: 2, cursor: 'pointer',
              background: i === step ? '#818cf8' : i < step ? '#6366f160' : '#374151',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>

        {/* Icon + title */}
        <div style={{ fontSize: 42, marginBottom: '0.5rem' }}>{current.icon}</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#e2e8f0', marginBottom: '1rem' }}>{current.title}</h2>

        {/* Content */}
        <div style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7 }}>{current.content}</div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem', alignItems: 'center' }}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} style={{
              padding: '0.6rem 1.2rem', borderRadius: 8, border: '1px solid #374151',
              background: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 14,
            }}>← Back</button>
          )}
          <div style={{ flex: 1 }} />
          <button onClick={isLast ? finish : () => setStep(s => s + 1)} style={{
            padding: '0.6rem 1.5rem', borderRadius: 8, border: 'none',
            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
            color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600,
          }}>
            {isLast ? "Let's go! 🚀" : 'Next →'}
          </button>
        </div>

        {/* Skip */}
        {!isLast && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button onClick={finish} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 12 }}>
              Skip tutorial
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
