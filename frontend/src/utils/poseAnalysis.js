// MediaPipe Pose landmark indices
export const LM = {
  LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13, RIGHT_ELBOW: 14,
  LEFT_WRIST: 15, RIGHT_WRIST: 16,
  LEFT_HIP: 23, RIGHT_HIP: 24,
  LEFT_KNEE: 25, RIGHT_KNEE: 26,
  LEFT_ANKLE: 27, RIGHT_ANKLE: 28,
};

export function calcAngle(a, b, c) {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return Math.round(angle);
}

export function getLandmark(landmarks, index) {
  const lm = landmarks[index];
  if (!lm || lm.visibility < 0.5) return null;
  return lm;
}

// ─── SQUAT ──────────────────────────────────────────────────────────────────
export function analyzeSquat(landmarks) {
  const lKnee = getLandmark(landmarks, LM.LEFT_KNEE);
  const rKnee = getLandmark(landmarks, LM.RIGHT_KNEE);
  const lHip = getLandmark(landmarks, LM.LEFT_HIP);
  const rHip = getLandmark(landmarks, LM.RIGHT_HIP);
  const lAnkle = getLandmark(landmarks, LM.LEFT_ANKLE);
  const rAnkle = getLandmark(landmarks, LM.RIGHT_ANKLE);
  const lShoulder = getLandmark(landmarks, LM.LEFT_SHOULDER);
  const rShoulder = getLandmark(landmarks, LM.RIGHT_SHOULDER);

  const angles = {};
  const alerts = [];

  if (lHip && lKnee && lAnkle) {
    angles.left_knee_angle = calcAngle(lHip, lKnee, lAnkle);
    if (angles.left_knee_angle < 70) alerts.push('Knee too deep — risk of strain');
    if (angles.left_knee_angle > 160) alerts.push('Squat deeper for full ROM');
  }
  if (rHip && rKnee && rAnkle) {
    angles.right_knee_angle = calcAngle(rHip, rKnee, rAnkle);
  }
  if (lShoulder && lHip && lKnee) {
    angles.hip_angle = calcAngle(lShoulder, lHip, lKnee);
    if (angles.hip_angle < 50) alerts.push('Torso too far forward — keep chest up');
  }

  // Back angle (shoulder to hip vertical)
  if (lShoulder && lHip) {
    const backAngle = Math.abs(
      Math.atan2(lShoulder.y - lHip.y, lShoulder.x - lHip.x) * (180 / Math.PI) - 90
    );
    angles.back_angle = Math.round(backAngle);
    if (backAngle > 45) alerts.push('Back leaning too far — risk of lower back injury');
  }

  const formScore = computeFormScore(alerts, angles, 'squat');
  const phase = detectSquatPhase(angles.left_knee_angle);

  return { angles, alerts, formScore, phase };
}

function detectSquatPhase(kneeAngle) {
  if (kneeAngle == null) return 'unknown';
  if (kneeAngle > 150) return 'standing';
  if (kneeAngle > 100) return 'descending';
  if (kneeAngle <= 100) return 'bottom';
  return 'ascending';
}

// ─── DEADLIFT ────────────────────────────────────────────────────────────────
export function analyzeDeadlift(landmarks) {
  const lShoulder = getLandmark(landmarks, LM.LEFT_SHOULDER);
  const lHip = getLandmark(landmarks, LM.LEFT_HIP);
  const lKnee = getLandmark(landmarks, LM.LEFT_KNEE);
  const lAnkle = getLandmark(landmarks, LM.LEFT_ANKLE);

  const angles = {};
  const alerts = [];

  if (lShoulder && lHip && lKnee) {
    angles.hip_angle = calcAngle(lShoulder, lHip, lKnee);
    if (angles.hip_angle < 60) alerts.push('Hip too low — use hip hinge pattern');
    if (angles.hip_angle > 160) alerts.push('Lockout phase — keep core tight');
  }
  if (lHip && lKnee && lAnkle) {
    angles.left_knee_angle = calcAngle(lHip, lKnee, lAnkle);
  }
  if (lShoulder && lHip) {
    const backAngle = Math.abs(
      Math.atan2(lShoulder.y - lHip.y, lShoulder.x - lHip.x) * (180 / Math.PI) - 90
    );
    angles.back_angle = Math.round(backAngle);
    if (backAngle > 30) alerts.push('Back rounding detected — engage lats and brace core');
  }

  const formScore = computeFormScore(alerts, angles, 'deadlift');
  const phase = detectDeadliftPhase(angles.hip_angle);

  return { angles, alerts, formScore, phase };
}

function detectDeadliftPhase(hipAngle) {
  if (hipAngle == null) return 'unknown';
  if (hipAngle < 90) return 'setup';
  if (hipAngle < 150) return 'pulling';
  return 'lockout';
}

// ─── PUSH-UP ─────────────────────────────────────────────────────────────────
export function analyzePushup(landmarks) {
  const lShoulder = getLandmark(landmarks, LM.LEFT_SHOULDER);
  const lElbow = getLandmark(landmarks, LM.LEFT_ELBOW);
  const lWrist = getLandmark(landmarks, LM.LEFT_WRIST);
  const lHip = getLandmark(landmarks, LM.LEFT_HIP);
  const lAnkle = getLandmark(landmarks, LM.LEFT_ANKLE);

  const angles = {};
  const alerts = [];

  if (lShoulder && lElbow && lWrist) {
    angles.elbow_angle = calcAngle(lShoulder, lElbow, lWrist);
    if (angles.elbow_angle < 70) alerts.push('Elbows too far out — tuck them closer');
    if (angles.elbow_angle > 160) alerts.push('Arms fully extended — lower slowly');
  }

  // Body alignment (hip should not sag or pike)
  if (lShoulder && lHip && lAnkle) {
    angles.back_angle = calcAngle(lShoulder, lHip, lAnkle);
    if (angles.back_angle < 160) alerts.push('Body not straight — hips sagging or piking');
  }

  const formScore = computeFormScore(alerts, angles, 'pushup');
  const phase = detectPushupPhase(angles.elbow_angle);

  return { angles, alerts, formScore, phase };
}

function detectPushupPhase(elbowAngle) {
  if (elbowAngle == null) return 'unknown';
  if (elbowAngle > 150) return 'up';
  if (elbowAngle > 100) return 'lowering';
  return 'bottom';
}

// ─── SHARED ──────────────────────────────────────────────────────────────────
function computeFormScore(alerts, angles, exercise) {
  let score = 100;
  score -= alerts.length * 15;
  return Math.max(0, Math.min(100, score));
}

export function analyzeFrame(landmarks, exerciseType) {
  switch (exerciseType) {
    case 'squat': return analyzeSquat(landmarks);
    case 'deadlift': return analyzeDeadlift(landmarks);
    case 'pushup': return analyzePushup(landmarks);
    default: return { angles: {}, alerts: [], formScore: 0, phase: 'unknown' };
  }
}

// Rep counting using knee angle for squat/deadlift, elbow for pushup
export function updateRepCount(prevState, currentAngles, exerciseType) {
  const { count, lastPhase } = prevState;

  let currentPhase;
  if (exerciseType === 'squat') {
    const angle = currentAngles.left_knee_angle;
    if (angle == null) return prevState;
    currentPhase = angle > 150 ? 'up' : angle < 110 ? 'down' : 'mid';
  } else if (exerciseType === 'deadlift') {
    const angle = currentAngles.hip_angle;
    if (angle == null) return prevState;
    currentPhase = angle > 150 ? 'up' : angle < 100 ? 'down' : 'mid';
  } else if (exerciseType === 'pushup') {
    const angle = currentAngles.elbow_angle;
    if (angle == null) return prevState;
    currentPhase = angle > 150 ? 'up' : angle < 90 ? 'down' : 'mid';
  } else {
    return prevState;
  }

  // Count rep on transition from down → up
  if (lastPhase === 'down' && currentPhase === 'up') {
    return { count: count + 1, lastPhase: currentPhase };
  }
  return { count, lastPhase: currentPhase };
}
